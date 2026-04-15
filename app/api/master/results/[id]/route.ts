import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Ambil data survey
  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  // Ambil user fields
  const { data: userFields } = await supabase
    .from('survey_user_fields')
    .select('*')
    .eq('survey_id', id)
    .order('field_order')

  // Ambil questions
  const { data: questions } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', id)
    .order('question_order')

  // Ambil semua responses
  const { data: responses } = await supabase
    .from('responses')
    .select('id')
    .eq('survey_id', id)

  const responseIds = responses?.map(r => r.id) || []
  const totalResponses = responseIds.length

  // Ambil jawaban user fields
  const { data: userFieldAnswers } = await supabase
    .from('response_user_fields')
    .select('*')
    .in('response_id', responseIds.length > 0 ? responseIds : ['none'])

  // Ambil jawaban pertanyaan
  const { data: questionAnswers } = await supabase
    .from('response_answers')
    .select('*')
    .in('response_id', responseIds.length > 0 ? responseIds : ['none'])

  return NextResponse.json({
    survey,
    userFields: userFields || [],
    questions: questions || [],
    totalResponses,
    userFieldAnswers: userFieldAnswers || [],
    questionAnswers: questionAnswers || []
  })
}