import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/session'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await verifySession()

  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { is_active } = await request.json()
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ is_active })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await verifySession()

  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }


  // Cegah super_admin menghapus akunnya sendiri
  if (session.id === id) {
    return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}