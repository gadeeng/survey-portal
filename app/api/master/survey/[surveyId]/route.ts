// app/api/survey/[surveyId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  const { surveyId } = await params
  const supabase = await createClient()

  // Ambil data survey
  const { data: survey, error } = await supabase
    .from('surveys')
    .select('id, title, description, status, published_at')
    .eq('id', surveyId)
    .single()

  if (error || !survey) {
    return NextResponse.json({ error: 'Survey tidak ditemukan' }, { status: 404 })
  }

  // Hanya survey aktif yang boleh diakses
  if (survey.status !== 'active') {
    return NextResponse.json({ error: 'Survey sedang tidak tersedia' }, { status: 403 })
  }

  // Field identitas
  const { data: userFields } = await supabase
    .from('survey_user_fields')
    .select('id, label, type, options, rating_min, rating_max, field_order')
    .eq('survey_id', surveyId)
    .order('field_order')

  // Pertanyaan
  const { data: questions } = await supabase
    .from('survey_questions')
    .select('id, question_text, type, options, rating_min, rating_max, question_order')
    .eq('survey_id', surveyId)
    .order('question_order')

  return NextResponse.json({
    survey,
    userFields: userFields || [],
    questions: questions || [],
  })
}