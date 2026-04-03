import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const { email, password } = JSON.parse(body)

    if (!email || !password)
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    // Sign in via Supabase Auth
    const { createClient: createBrowserClient } = await import('@supabase/supabase-js')
    const browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: authData, error: authError } = await browserClient.auth.signInWithPassword({
      email,
      password
    })

    if (authError) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    // Get profile from users table
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    const user = {
      id: authData.user.id,
      name: profile?.name || authData.user.user_metadata?.name || 'User',
      email: authData.user.email!,
      plan: profile?.plan || 'free',
      pdf_used: profile?.pdf_used || 0
    }

    return NextResponse.json({ user })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}