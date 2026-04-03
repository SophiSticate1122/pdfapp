import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json()

    const priceId = plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId!, quantity: 1 }],
      metadata: { userId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}