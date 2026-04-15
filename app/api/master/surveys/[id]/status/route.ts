import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await request.json()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString()
  }

  if (status === 'active') {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('surveys')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}