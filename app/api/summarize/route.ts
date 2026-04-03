import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, text, instructions } = await req.json()
    if (!userId || !text)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { data: user } = await supabaseAdmin
      .from('users').select('*').eq('id', userId).single()

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    if (user.plan === 'free' && user.pdf_used >= 1)
      return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are an expert document analyst.\n${instructions ? `Instructions: ${instructions}\n` : ''}Summarize this document. For each section provide:\n- Key People\n- Core Concepts\n- Arguments (~150 words, educational)\n- Methods\n- Implications\n- Critiques\n\nDOCUMENT:\n${text.slice(0, 12000)}`
      }]
    })

    await supabaseAdmin.from('users')
      .update({ pdf_used: (user.pdf_used || 0) + 1 })
      .eq('id', userId)

    const summary = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')

    return NextResponse.json({ summary })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}