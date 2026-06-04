import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/session'

export async function GET() {
  const session = await verifySession()
  if (!session || (session.role !== 'super_admin' && session.role !== 'master')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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