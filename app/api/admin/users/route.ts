export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    const { data, error } = await supabaseAdmin
      .from('users').select('*').order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
      const users = (authData?.users || []).map(u => ({
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
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  try {
    const { action, userId, subscriptionId } = await req.json()

    if (action === 'cancel') {
      if (subscriptionId) {
        await stripe.subscriptions.cancel(subscriptionId)
      }
      await supabaseAdmin.from('users')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', userId)
      return NextResponse.json({ success: true, message: 'Subscription cancelled' })
    }

    if (action === 'refund') {
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const latestInvoiceId = sub.latest_invoice as string
        if (latestInvoiceId) {
          const invoice = await stripe.invoices.retrieve(latestInvoiceId)
          const paymentIntent = (invoice as any).payment_intent
          if (paymentIntent) {
            await stripe.refunds.create({
              payment_intent: paymentIntent as string
            })
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