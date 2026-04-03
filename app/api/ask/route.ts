import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { question, documentText } = await req.json()
    if (!question || !documentText)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Answer this question using ONLY the document below.\n\nQUESTION: ${question}\n\nDOCUMENT:\n${documentText.slice(0, 10000)}`
      }]
    })

    const answer = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')

    return NextResponse.json({ answer })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}