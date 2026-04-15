import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .order('created_at', { ascending: false })

  // Hitung jumlah responden per survey
  const surveysWithCount = await Promise.all(
    (surveys || []).map(async (survey) => {
      const { count } = await supabase
        .from('responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', survey.id)
      return { ...survey, response_count: count || 0 }
    })
  )

  return NextResponse.json({ surveys: surveysWithCount })
}