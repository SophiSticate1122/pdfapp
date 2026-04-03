import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const { name, email, password } = JSON.parse(body)

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // First check if user already exists in our users table
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({
        user: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          plan: existing.plan,
          pdf_used: existing.pdf_used
        }
      })
    }

    // Create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Also manually insert into users table as backup
    await supabaseAdmin.from('users').upsert({
      id: data.user.id,
      name,
      email: email.toLowerCase(),
      plan: 'free',
      pdf_used: 0,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      user: {
        id: data.user.id,
        name,
        email,
        plan: 'free',
        pdf_used: 0
      }
    })
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: e.message || 'Signup failed' }, { status: 500 })
  }
}