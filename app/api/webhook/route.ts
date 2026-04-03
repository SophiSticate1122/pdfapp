import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const subId = session.subscription as string
    const sub = await stripe.subscriptions.retrieve(subId)
    const plan = sub.items.data[0].price.id === process.env.STRIPE_MONTHLY_PRICE_ID
      ? 'monthly' : 'yearly'

    await supabaseAdmin.from('users').update({
      plan,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subId,
      subscribed_at: new Date().toISOString()
    }).eq('id', userId!)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabaseAdmin.from('users')
      .update({ plan: 'free' })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}