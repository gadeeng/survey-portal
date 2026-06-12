import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/session'

// GET - Ambil detail survey beserta fields dan questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session || (session.role !== 'super_admin' && session.role !== 'master')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: userFields } = await supabase
    .from('survey_user_fields')
    .select('*')
    .eq('survey_id', id)
    .order('field_order')

  const { data: questions } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', id)
    .order('question_order')

  const { count: responseCount } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('survey_id', id)

  return NextResponse.json({
    survey,
    userFields: userFields || [],
    questions: questions || [],
    hasResponses: (responseCount || 0) > 0,
  })
}

// PUT - Update survey
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session || (session.role !== 'super_admin' && session.role !== 'master')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { title, description, status, userFields, questions, spreadsheetWebhookUrl } = await request.json()

  // Validate webhook URL if provided to prevent SSRF
  if (spreadsheetWebhookUrl) {
    try {
      const url = new URL(spreadsheetWebhookUrl)
      if (url.protocol !== 'https:' || !spreadsheetWebhookUrl.startsWith('https://script.google.com/')) {
        return NextResponse.json(
          { error: 'URL webhook harus berupa URL Google Apps Script yang valid (https://script.google.com/...)' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json({ error: 'URL webhook tidak valid' }, { status: 400 })
    }
  }

  const supabase = await createClient()

  // Update survey
  const { error: surveyError } = await supabase
    .from('surveys')
    .update({
      title, description, status,
      updated_at: new Date().toISOString(),
      published_at: status === 'active' ? new Date().toISOString() : null,
      spreadsheet_webhook_url: spreadsheetWebhookUrl || null,
    })
    .eq('id', id)

  if (surveyError) return NextResponse.json({ error: surveyError.message }, { status: 500 })

  // Smart update for survey_user_fields
  const { data: existingFields, error: getFieldsError } = await supabase
    .from('survey_user_fields')
    .select('id')
    .eq('survey_id', id)

  if (getFieldsError) return NextResponse.json({ error: getFieldsError.message }, { status: 500 })

  const existingFieldIds = new Set(existingFields?.map(f => f.id) || [])
  const incomingFieldIds = new Set(userFields.map((f: any) => f.id).filter(Boolean))
  const fieldsToDelete = [...existingFieldIds].filter(fid => !incomingFieldIds.has(fid))

  // Update & Insert incoming user fields
  for (let index = 0; index < userFields.length; index++) {
    const f = userFields[index]
    const payload = {
      label: f.label,
      type: f.type,
      options: f.options?.length > 0 ? f.options : null,
      rating_min: f.type === 'rating' ? f.rating_min : null,
      rating_max: f.type === 'rating' ? f.rating_max : null,
      field_order: index + 1
    }

    if (f.id && existingFieldIds.has(f.id)) {
      // Update existing
      const { error: updError } = await supabase
        .from('survey_user_fields')
        .update(payload)
        .eq('id', f.id)
      if (updError) return NextResponse.json({ error: updError.message }, { status: 500 })
    } else {
      // Insert new
      const { error: insError } = await supabase
        .from('survey_user_fields')
        .insert({
          survey_id: id,
          ...payload
        })
      if (insError) return NextResponse.json({ error: insError.message }, { status: 500 })
    }
  }

  // Delete removed fields
  if (fieldsToDelete.length > 0) {
    const { error: delError } = await supabase
      .from('survey_user_fields')
      .delete()
      .in('id', fieldsToDelete)
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })
  }

  // Smart update for survey_questions
  const { data: existingQuestions, error: getQuestionsError } = await supabase
    .from('survey_questions')
    .select('id')
    .eq('survey_id', id)

  if (getQuestionsError) return NextResponse.json({ error: getQuestionsError.message }, { status: 500 })

  const existingQuestionIds = new Set(existingQuestions?.map(q => q.id) || [])
  const incomingQuestionIds = new Set(questions.map((q: any) => q.id).filter(Boolean))
  const questionsToDelete = [...existingQuestionIds].filter(qid => !incomingQuestionIds.has(qid))

  // Update & Insert incoming questions
  for (let index = 0; index < questions.length; index++) {
    const q = questions[index]
    const payload = {
      question_text: q.question_text,
      type: q.type,
      options: q.options?.length > 0 ? q.options : null,
      rating_min: q.type === 'rating' ? q.rating_min : null,
      rating_max: q.type === 'rating' ? q.rating_max : null,
      question_order: index + 1
    }

    if (q.id && existingQuestionIds.has(q.id)) {
      // Update existing
      const { error: updError } = await supabase
        .from('survey_questions')
        .update(payload)
        .eq('id', q.id)
      if (updError) return NextResponse.json({ error: updError.message }, { status: 500 })
    } else {
      // Insert new
      const { error: insError } = await supabase
        .from('survey_questions')
        .insert({
          survey_id: id,
          ...payload
        })
      if (insError) return NextResponse.json({ error: insError.message }, { status: 500 })
    }
  }

  // Delete removed questions
  if (questionsToDelete.length > 0) {
    const { error: delError } = await supabase
      .from('survey_questions')
      .delete()
      .in('id', questionsToDelete)
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE - Hapus survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const supabase = await createClient()

  // 1. Ambil semua ID respons untuk survey ini
  const { data: responses, error: fetchRespError } = await supabase
    .from('responses')
    .select('id')
    .eq('survey_id', id)

  if (fetchRespError) return NextResponse.json({ error: fetchRespError.message }, { status: 500 })

  const responseIds = responses?.map((r) => r.id) || []

  // 2. Jika ada respons, hapus jawaban dan identitas respons terkait
  if (responseIds.length > 0) {
    const { error: delAnswersError } = await supabase
      .from('response_answers')
      .delete()
      .in('response_id', responseIds)
    if (delAnswersError) return NextResponse.json({ error: delAnswersError.message }, { status: 500 })

    const { error: delUserFieldsError } = await supabase
      .from('response_user_fields')
      .delete()
      .in('response_id', responseIds)
    if (delUserFieldsError) return NextResponse.json({ error: delUserFieldsError.message }, { status: 500 })

    const { error: delResponsesError } = await supabase
      .from('responses')
      .delete()
      .eq('survey_id', id)
    if (delResponsesError) return NextResponse.json({ error: delResponsesError.message }, { status: 500 })
  }

  // 3. Hapus data konfigurasi fields dan pertanyaan survey
  const { error: delSurveyFieldsError } = await supabase
    .from('survey_user_fields')
    .delete()
    .eq('survey_id', id)
  if (delSurveyFieldsError) return NextResponse.json({ error: delSurveyFieldsError.message }, { status: 500 })

  const { error: delSurveyQuestionsError } = await supabase
    .from('survey_questions')
    .delete()
    .eq('survey_id', id)
  if (delSurveyQuestionsError) return NextResponse.json({ error: delSurveyQuestionsError.message }, { status: 500 })

  // 4. Hapus survey utama
  const { error } = await supabase.from('surveys').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}