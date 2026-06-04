import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/session'

export async function GET() {
  const session = await verifySession()
  if (!session || (session.role !== 'super_admin' && session.role !== 'master')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ surveys })
}

export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session || (session.role !== 'super_admin' && session.role !== 'master')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .insert({
      title,
      description,
      status,
      created_by: session.id,
      published_at: status === 'active' ? new Date().toISOString() : null,
      spreadsheet_webhook_url: spreadsheetWebhookUrl || null,
    })
    .select()
    .single()

  if (surveyError) {
    return NextResponse.json({ error: surveyError.message }, { status: 500 })
  }

  if (userFields.length > 0) {
    const { error: fieldsError } = await supabase
      .from('survey_user_fields')
      .insert(userFields.map((f: {
        label: string
        type: string
        options: string[]
        rating_min: number
        rating_max: number
      }, index: number) => ({
        survey_id: survey.id,
        label: f.label,
        type: f.type,
        options: f.options.length > 0 ? f.options : null,
        rating_min: f.type === 'rating' ? f.rating_min : null,
        rating_max: f.type === 'rating' ? f.rating_max : null,
        field_order: index + 1
      })))

    if (fieldsError) {
      return NextResponse.json({ error: fieldsError.message }, { status: 500 })
    }
  }

  if (questions.length > 0) {
    const { error: questionsError } = await supabase
      .from('survey_questions')
      .insert(questions.map((q: {
        question_text: string
        type: string
        options: string[]
        rating_min: number
        rating_max: number
      }, index: number) => ({
        survey_id: survey.id,
        question_text: q.question_text,
        type: q.type,
        options: q.options.length > 0 ? q.options : null,
        rating_min: q.type === 'rating' ? q.rating_min : null,
        rating_max: q.type === 'rating' ? q.rating_max : null,
        question_order: index + 1
      })))

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, survey })
}