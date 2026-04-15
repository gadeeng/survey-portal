import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = await createClient()

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ surveys })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = JSON.parse(sessionCookie.value)
  const { title, description, status, userFields, questions } = await request.json()

  const supabase = await createClient()

  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .insert({
      title,
      description,
      status,
      created_by: session.id,
      published_at: status === 'active' ? new Date().toISOString() : null
    })
    .select()
    .single()

  if (surveyError) {
    return NextResponse.json({ error: surveyError.message }, { status: 500 })
  }

  if (userFields.length > 0) {
    const { error: fieldsError } = await supabase
      .from('survey_user_fields')
      .insert(userFields.map((f: {
        label: string
        type: string
        options: string[]
        rating_min: number
        rating_max: number
      }, index: number) => ({
        survey_id: survey.id,
        label: f.label,
        type: f.type,
        options: f.options.length > 0 ? f.options : null,
        rating_min: f.type === 'rating' ? f.rating_min : null,
        rating_max: f.type === 'rating' ? f.rating_max : null,
        field_order: index + 1
      })))

    if (fieldsError) {
      return NextResponse.json({ error: fieldsError.message }, { status: 500 })
    }
  }

  if (questions.length > 0) {
    const { error: questionsError } = await supabase
      .from('survey_questions')
      .insert(questions.map((q: {
        question_text: string
        type: string
        options: string[]
        rating_min: number
        rating_max: number
      }, index: number) => ({
        survey_id: survey.id,
        question_text: q.question_text,
        type: q.type,
        options: q.options.length > 0 ? q.options : null,
        rating_min: q.type === 'rating' ? q.rating_min : null,
        rating_max: q.type === 'rating' ? q.rating_max : null,
        question_order: index + 1
      })))

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, survey })
}