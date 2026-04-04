export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const supabaseAdmin = getSupabaseAdmin()
    const { userId, text, instructions } = await req.json()

    if (!userId || !text)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { data: user } = await supabaseAdmin
      .from('users').select('*').eq('id', userId).single()

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    if (user.plan === 'free' && user.pdf_used >= 1)
      return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })

    // Split text into chunks of 40,000 characters each
    const CHUNK_SIZE = 40000
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE))
    }

    let fullSummary = ''

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const isFirst = i === 0
      const isLast = i === chunks.length - 1

      const prompt = `You are an expert document analyst and educator. Analyze the following section of a document (part ${i + 1} of ${chunks.length}).
${instructions ? `Special instructions: ${instructions}\n` : ''}

For EACH PAGE in this section, provide a structured summary using EXACTLY this format:

Page X
-------
**People:** List all key people, authors, or groups mentioned and their significance.
**Core Concepts:** List and briefly explain the main ideas introduced on this page.
**Arguments:** Write a thorough, educational explanation (~250 words) of the main arguments made. Explain the reasoning, provide context, give examples, and make sure someone with no prior knowledge would fully understand what is being argued and why it matters.
**Methods:** Describe any research methods, data, or evidence used (write "Not applicable" if none).
**Implications:** Explain why this matters, what consequences or applications follow from the content.
**Critiques:** Identify any weaknesses, assumptions, gaps, counterarguments, or limitations.

IMPORTANT RULES:
- Cover EVERY single page in this section — do not skip any pages
- Each page summary should be at least 250 words total
- The Arguments section alone should be at least 150 words
- Be thorough and educational — write for someone who has never read this document
- Only use information from the document — do not add outside information

DOCUMENT SECTION ${i + 1} OF ${chunks.length}:
${chunk}`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })

      const chunkSummary = message.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n')

      fullSummary += (isFirst ? '' : '\n\n') + chunkSummary
    }

    // Update pdf_used count
    await supabaseAdmin.from('users')
      .update({ pdf_used: (user.pdf_used || 0) + 1 })
      .eq('id', userId)

    return NextResponse.json({ summary: fullSummary })
  } catch (e: any) {
    console.error('Summarize error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}