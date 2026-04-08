export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

export async function POST(req: NextRequest) {
  try {
    const anthropic = new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 120000, // 2 minute timeout per request
      maxRetries: 5,   // Anthropic SDK handles retries automatically
    })
    
    const supabaseAdmin = getSupabaseAdmin()
    const { userId, text, instructions, chunkIndex, totalChunks, isFirst } = await req.json()

    if (!userId || !text)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    if (isFirst) {
      const { data: user } = await supabaseAdmin
        .from('users').select('*').eq('id', userId).single()
      if (!user)
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
      if (user.plan === 'free' && user.pdf_used >= 1)
        return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
      await supabaseAdmin.from('users')
        .update({ pdf_used: (user.pdf_used || 0) + 1 })
        .eq('id', userId)
    }

    const prompt = `You are an expert document analyst. Analyze this document section (part ${chunkIndex + 1} of ${totalChunks}).
${instructions ? `Instructions: ${instructions}\n` : ''}
For EACH PAGE provide this exact format:

Page X
-------
**People:** Key people and their roles.
**Core Concepts:** Main ideas (2-3 sentences each).
**Arguments:** Thorough explanation (~200 words) — explain reasoning, context, examples so anyone can understand.
**Methods:** Research methods or evidence (or "Not applicable").
**Implications:** Why this matters.
**Critiques:** Weaknesses, assumptions, gaps.

Cover every page. Be thorough and educational.

DOCUMENT SECTION ${chunkIndex + 1}/${totalChunks}:
${text}`

    // Anthropic SDK with built-in retries handles everything
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const summary = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')

    return NextResponse.json({ summary, chunkIndex })

  } catch (e: any) {
    console.error('Summarize error:', e)
    
    if (e?.message?.includes('credit') || e?.message?.includes('billing')) {
      return NextResponse.json({ 
        error: 'insufficient_credits',
        message: 'API credits exhausted.' 
      }, { status: 402 })
    }
    if (e?.status === 429) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    if (e?.status === 529) {
      return NextResponse.json({ error: 'overloaded' }, { status: 529 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}