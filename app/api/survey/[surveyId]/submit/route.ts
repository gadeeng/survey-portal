import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendToGoogleSheets } from '@/lib/google-sheets'
import { rateLimit } from '@/lib/rate-limit'

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
  // Rate Limiting: maks 3 submit per 5 menit per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1'
  const limitResult = await rateLimit(ip, 3, 5 * 60 * 1000)

  if (!limitResult.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak mengirimkan jawaban. Silakan tunggu 5 menit sebelum mengirim kembali.' },
      { status: 429 }
    )
  }

  const { surveyId } = await params
  const supabase = await createClient()

  // Validasi survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('id, status, spreadsheet_webhook_url')
    .eq('id', surveyId)
    .single()

  if (surveyError || !survey) {
    return NextResponse.json({ error: 'Survey tidak ditemukan' }, { status: 404 })
  }

  if (survey.status !== 'active') {
    return NextResponse.json({ error: 'Survei telah ditutup, terima kasih atas partisipasi Anda.' }, { status: 403 })
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

  // Fetch valid survey fields and questions for validation
  const { data: userFields, error: userFieldsError } = await supabase
    .from('survey_user_fields')
    .select('id, label, type')
    .eq('survey_id', surveyId)
    .order('field_order')

  const { data: questions, error: questionsError } = await supabase
    .from('survey_questions')
    .select('id, question_text')
    .eq('survey_id', surveyId)
    .order('question_order')

  if (userFieldsError || questionsError) {
    return NextResponse.json({ error: 'Gagal mengambil skema survey' }, { status: 500 })
  }

  // Validate identity answers match the survey's fields
  const validFieldIds = new Set((userFields || []).map((f) => f.id))
  for (const ans of identityAnswers) {
    if (!validFieldIds.has(ans.fieldId)) {
      return NextResponse.json({ error: 'Data identitas tidak valid untuk survey ini' }, { status: 400 })
    }
  }

  // Validate question answers match the survey's questions
  const validQuestionIds = new Set((questions || []).map((q) => q.id))
  for (const ans of questionAnswers) {
    if (!validQuestionIds.has(ans.questionId)) {
      return NextResponse.json({ error: 'Jawaban pertanyaan tidak valid untuk survey ini' }, { status: 400 })
    }
  }

  // 1. Kirim data ke Google Sheets terlebih dahulu jika webhook URL tersedia
  if (survey.spreadsheet_webhook_url) {
    try {
      // Resolve nama entitas jika ada input bertipe entity
      const entityIds = identityAnswers
        .filter(ans => {
          const field = (userFields || []).find(f => f.id === ans.fieldId)
          return field?.type === 'entity' && typeof ans.value === 'string' && ans.value
        })
        .map(ans => ans.value as string)

      let entityMap = new Map<string, string>()
      if (entityIds.length > 0) {
        const { data: entities } = await supabase
          .from('entities')
          .select('id, name')
          .in('id', entityIds)
        if (entities) {
          entityMap = new Map(entities.map(e => [e.id, e.name]))
        }
      }

      // Susun headers dan values sesuai urutan field + question
      const headers: string[] = []
      const values: string[] = []

      for (const field of userFields || []) {
        headers.push(field.label)
        const answer = identityAnswers.find(a => a.fieldId === field.id)
        if (answer) {
          let val = answer.value
          if (field.type === 'entity' && typeof val === 'string' && entityMap.has(val)) {
            val = entityMap.get(val)!
          }
          values.push(Array.isArray(val) ? val.join(', ') : val)
        } else {
          values.push('')
        }
      }

      for (const question of questions || []) {
        headers.push(question.question_text)
        const answer = questionAnswers.find(a => a.questionId === question.id)
        values.push(answer ? (Array.isArray(answer.value) ? answer.value.join(', ') : (answer.value as string)) : '')
      }

      // Await diperlukan di serverless (Vercel) agar proses fetch selesai sebelum response direturn
      await sendToGoogleSheets(survey.spreadsheet_webhook_url, {
        headers,
        values,
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error('Gagal mengirim ke Google Sheets:', err)
      // Jika Google Sheets sendiri gagal, kita kembalikan error ke user agar bisa mencoba lagi
      return NextResponse.json(
        { error: 'Gagal mengirim data ke Google Sheets. Silakan coba lagi.' },
        { status: 500 }
      )
    }
  }

  // 2. Simpan ke database Supabase secara aman (jika gagal, tetap return sukses karena data di Google Sheets sudah tersimpan)
  try {
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        survey_id: surveyId,
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (responseError || !response) {
      throw new Error(responseError?.message || 'Gagal menyimpan respons utama')
    }

    const responseId = response.id

    // Simpan identitas
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

      if (fieldsError) throw new Error('Gagal menyimpan data identitas: ' + fieldsError.message)
    }

    // Simpan jawaban pertanyaan
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

      if (answersError) throw new Error('Gagal menyimpan jawaban: ' + answersError.message)
    }

    return NextResponse.json({
      success: true,
      responseId,
      message: 'Terima kasih! Jawaban Anda telah disimpan.'
    })

  } catch (dbError: any) {
    // Log error database secara internal
    console.error('Database Save Error (tetapi Google Sheets sukses):', dbError)

    // Tetap kembalikan sukses kepada responden agar tidak submit berulang kali ke Google Sheets
    return NextResponse.json({
      success: true,
      message: 'Terima kasih! Jawaban Anda telah disimpan.'
    })
  }
}