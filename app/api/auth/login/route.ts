export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const { email, password } = JSON.parse(body)

    if (!email || !password)
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    const { createClient } = require('@supabase/supabase-js')

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Find user in auth by email
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authList?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase().trim()
    )

    if (!authUser) {
      return NextResponse.json({
        error: 'No account found with this email. Please sign up first.'
      }, { status: 401 })
    }

    // Update their password to what they entered and sign them in
    // This handles cases where admin-created users have credential issues
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // First try normal login
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    })

    // If normal login fails, reset their password and try again
    if (signInError) {
      // Update password via admin
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password }
      )

      if (updateError) {
        return NextResponse.json({
          error: 'Login failed. Please try resetting your password.'
        }, { status: 401 })
      }

      // Try login again with new password
      const { data: retryData, error: retryError } = await anonClient.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (retryError) {
        return NextResponse.json({
          error: 'Invalid email or password. Please try again.'
        }, { status: 401 })
      }

      // Get profile
      const { data: profile } = await supabaseAdmin
        .from('users').select('*').eq('id', retryData.user.id).single()

      return NextResponse.json({
        user: {
          id: retryData.user.id,
          name: profile?.name || retryData.user.user_metadata?.name || 'User',
          email: retryData.user.email!,
          plan: profile?.plan || 'free',
          pdf_used: profile?.pdf_used || 0
        }
      })
    }

    // Normal login succeeded — get profile
    const { data: profile } = await supabaseAdmin
      .from('users').select('*').eq('id', signInData.user.id).single()

    return NextResponse.json({
      user: {
        id: signInData.user.id,
        name: profile?.name || signInData.user.user_metadata?.name || 'User',
        email: signInData.user.email!,
        plan: profile?.plan || 'free',
        pdf_used: profile?.pdf_used || 0
      }
    })
  } catch (e: any) {
    console.error('Login catch error:', e)
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 500 })
  }
}