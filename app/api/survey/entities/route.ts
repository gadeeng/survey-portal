import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Ambil semua entitas yang aktif (untuk public survey)
  const { data: entities, error } = await supabase
    .from('entities')
    .select('*')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entities })
}
