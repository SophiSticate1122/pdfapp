export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const anthropic = new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 100000
    })
    
    const { question, documentText } = await req.json()
    if (!question || !documentText)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Search entire document — not just first 10,000 chars
    const fullText = documentText

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert research analyst with deep reasoning capabilities. A user has asked a question about a document. Your job is to:

1. UNDERSTAND the intent behind the question — what is the user really trying to find out?
2. SEARCH thoroughly through the entire document for ALL relevant information
3. REASON across the full document — consider synonyms, related concepts, implied meanings
4. SYNTHESIZE a comprehensive answer with specific evidence from the document

IMPORTANT RULES:
- Think broadly — if someone asks about "voices speaking up against slavery" look for: abolitionists, critics of slavery, people who opposed slavery, resistance movements, protests, petitions, speeches against slavery, moral arguments against slavery, enslaved people who resisted, etc.
- Never say "not found" without searching for ALL related terms and concepts
- Always cite specific names, pages, quotes or passages from the document
- If the exact phrase isn't in the document, find the closest related information
- Structure your answer clearly with specific evidence

USER QUESTION: "${question}"

FULL DOCUMENT TEXT:
${fullText}`
      }]
    })

    const answer = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')

    return NextResponse.json({ answer })
  } catch (e: any) {
    console.error('Ask error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}