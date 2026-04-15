import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Ambil detail survey beserta fields dan questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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

  return NextResponse.json({ survey, userFields: userFields || [], questions: questions || [] })
}

// PUT - Update survey
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')

  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, status, userFields, questions } = await request.json()
  const supabase = await createClient()

  // Update survey
  const { error: surveyError } = await supabase
    .from('surveys')
    .update({
      title, description, status,
      updated_at: new Date().toISOString(),
      published_at: status === 'active' ? new Date().toISOString() : null
    })
    .eq('id', id)

  if (surveyError) return NextResponse.json({ error: surveyError.message }, { status: 500 })

  // Hapus fields & questions lama lalu insert baru
  await supabase.from('survey_user_fields').delete().eq('survey_id', id)
  await supabase.from('survey_questions').delete().eq('survey_id', id)

  if (userFields.length > 0) {
    await supabase.from('survey_user_fields').insert(
      userFields.map((f: {
        label: string; type: string; options: string[]
        rating_min: number; rating_max: number
      }, index: number) => ({
        survey_id: id,
        label: f.label,
        type: f.type,
        options: f.options?.length > 0 ? f.options : null,
        rating_min: f.type === 'rating' ? f.rating_min : null,
        rating_max: f.type === 'rating' ? f.rating_max : null,
        field_order: index + 1
      }))
    )
  }

  if (questions.length > 0) {
    await supabase.from('survey_questions').insert(
      questions.map((q: {
        question_text: string; type: string; options: string[]
        rating_min: number; rating_max: number
      }, index: number) => ({
        survey_id: id,
        question_text: q.question_text,
        type: q.type,
        options: q.options?.length > 0 ? q.options : null,
        rating_min: q.type === 'rating' ? q.rating_min : null,
        rating_max: q.type === 'rating' ? q.rating_max : null,
        question_order: index + 1
      }))
    )
  }

  return NextResponse.json({ success: true })
}

// DELETE - Hapus survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')

  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = JSON.parse(sessionCookie.value)
  if (session.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = await createClient()

  const { count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('survey_id', id)

  if (count && count > 0) {
    return NextResponse.json(
      { error: 'Survey tidak bisa dihapus karena sudah ada respons' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('surveys').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}