import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

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

  const { data: responses } = await supabase
    .from('responses')
    .select('id, submitted_at')
    .eq('survey_id', id)

  const responseIds = responses?.map(r => r.id) || []

  const { data: userFieldAnswers } = await supabase
    .from('response_user_fields')
    .select('*')
    .in('response_id', responseIds.length > 0 ? responseIds : ['none'])

  const { data: questionAnswers } = await supabase
    .from('response_answers')
    .select('*')
    .in('response_id', responseIds.length > 0 ? responseIds : ['none'])

  // Build Excel rows
  const headers = [
    'No',
    'Waktu Submit',
    ...(userFields || []).map(f => f.label),
    ...(questions || []).map(q => q.question_text)
  ]

  const rows = (responses || []).map((response, i) => {
    const userAnswers = (userFields || []).map(field => {
      const ans = userFieldAnswers?.find(a => a.response_id === response.id && a.field_id === field.id)
      return ans?.value || ''
    })
    const qAnswers = (questions || []).map(question => {
      const ans = questionAnswers?.find(a => a.response_id === response.id && a.question_id === question.id)
      return ans?.value || ''
    })
    return [i + 1, new Date(response.submitted_at).toLocaleString('id-ID'), ...userAnswers, ...qAnswers]
  })

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Hasil Survey')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="hasil-survey-${id}.xlsx"`
    }
  })
}