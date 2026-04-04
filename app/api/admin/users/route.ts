export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse, NextRequest } from 'next/server'

function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('users').select('*').order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
      const users = (authData?.users || []).map((u: any) => ({
        id: u.id,
        name: u.user_metadata?.name || 'Unknown',
        email: u.email,
        plan: 'free',
        pdf_used: 0,
        created_at: u.created_at,
        stripe_subscription_id: null
      }))
      return NextResponse.json({ users })
    }

    return NextResponse.json({ users: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const stripe = getStripe()
    const { action, userId, subscriptionId, email } = await req.json()

    // ── Delete user ──
    if (action === 'delete') {
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ success: true, message: 'User deleted' })
    }

    // ── Reset password ──
    if (action === 'reset_password') {
      const { createClient } = require('@supabase/supabase-js')
      const browserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      await browserClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      })
      return NextResponse.json({ success: true, message: 'Password reset email sent' })
    }

    // ── Manual upgrade ──
    if (action === 'upgrade') {
      await supabaseAdmin.from('users')
        .update({ plan: 'monthly' })
        .eq('id', userId)
      return NextResponse.json({ success: true, message: 'User upgraded to Pro' })
    }

    // ── Cancel subscription ──
    if (action === 'cancel') {
      if (subscriptionId) {
        await stripe.subscriptions.cancel(subscriptionId)
      }
      await supabaseAdmin.from('users')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', userId)
      return NextResponse.json({ success: true, message: 'Subscription cancelled' })
    }

    // ── Refund ──
    if (action === 'refund') {
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const latestInvoiceId = sub.latest_invoice
        if (latestInvoiceId) {
          const invoice = await stripe.invoices.retrieve(latestInvoiceId)
          const paymentIntent = invoice.payment_intent
          if (paymentIntent) {
            await stripe.refunds.create({ payment_intent: paymentIntent })
          }
        }
        await stripe.subscriptions.cancel(subscriptionId)
      }
      await supabaseAdmin.from('users')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', userId)
      return NextResponse.json({ success: true, message: 'Refund issued and subscription cancelled' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}