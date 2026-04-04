export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const { name, email, password } = JSON.parse(body)

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { createClient } = require('@supabase/supabase-js')

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Check if email already exists in users table
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({
        error: 'An account with this email already exists. Please log in instead.'
      }, { status: 400 })
    }

    // Also check Supabase Auth
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers()
    const authExists = authList?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase().trim()
    )

    if (authExists) {
      return NextResponse.json({
        error: 'An account with this email already exists. Please log in instead.'
      }, { status: 400 })
    }

    // Create new auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { name },
      email_confirm: true
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Insert into users table
    await supabaseAdmin.from('users').upsert({
      id: data.user.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      plan: 'free',
      pdf_used: 0,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      user: {
        id: data.user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        plan: 'free',
        pdf_used: 0
      }
    })
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: e.message || 'Signup failed' }, { status: 500 })
  }
}