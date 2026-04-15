// app/api/survey/[surveyId]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface IdentityAnswer {
  fieldId: string
  value: string | string[]
}

interface QuestionAnswer {
  questionId: string
  value: string | string[]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  const { surveyId } = await params
  const supabase = await createClient()

  // Validasi survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('id, status')
    .eq('id', surveyId)
    .single()

  if (surveyError || !survey) {
    return NextResponse.json({ error: 'Survey tidak ditemukan' }, { status: 404 })
  }

  if (survey.status !== 'active') {
    return NextResponse.json({ error: 'Survey sedang tidak tersedia' }, { status: 403 })
  }

  // Parse body
  const body = await request.json()
  const { identityAnswers, questionAnswers } = body as {
    identityAnswers: IdentityAnswer[]
    questionAnswers: QuestionAnswer[]
  }

  if (!identityAnswers || !questionAnswers) {
    return NextResponse.json({ error: 'Data identitas dan jawaban wajib dikirim' }, { status: 400 })
  }

  // 1. Buat response baru
  const { data: response, error: responseError } = await supabase
    .from('responses')
    .insert({
      survey_id: surveyId,
      submitted_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (responseError || !response) {
    return NextResponse.json({ error: 'Gagal menyimpan respons' }, { status: 500 })
  }

  const responseId = response.id

  try {
    // 2. Simpan identitas
    if (identityAnswers.length > 0) {
      const { error: fieldsError } = await supabase
        .from('response_user_fields')
        .insert(
          identityAnswers.map((item) => ({
            response_id: responseId,
            field_id: item.fieldId,
            value: Array.isArray(item.value) ? JSON.stringify(item.value) : item.value,
          }))
        )

      if (fieldsError) throw new Error('Gagal menyimpan data identitas')
    }

    // 3. Simpan jawaban pertanyaan
    if (questionAnswers.length > 0) {
      const { error: answersError } = await supabase
        .from('response_answers')
        .insert(
          questionAnswers.map((item) => ({
            response_id: responseId,
            question_id: item.questionId,
            value: Array.isArray(item.value) ? JSON.stringify(item.value) : item.value,
          }))
        )

      if (answersError) throw new Error('Gagal menyimpan jawaban')
    }

    return NextResponse.json({
      success: true,
      responseId,
      message: 'Terima kasih! Jawaban Anda telah disimpan.'
    })

  } catch (err: any) {
    // Rollback
    await supabase.from('response_user_fields').delete().eq('response_id', responseId)
    await supabase.from('responses').delete().eq('id', responseId)

    return NextResponse.json(
      { error: err.message || 'Gagal menyimpan jawaban' },
      { status: 500 }
    )
  }
}