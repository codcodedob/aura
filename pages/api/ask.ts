import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from 'dotenv'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { input } = req.body
  if (!input) return res.status(400).json({ error: 'Missing input' })

  try {
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input,
    })

    const [{ embedding }] = embeddingRes.data
    const { data: matches } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: 5,
    })

    const context = matches?.map((m: any) => m.content).join('\n') || ''
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are AURA, an empathetic reasoning agent.' },
        { role: 'user', content: `${context}\n\nUser: ${input}` },
      ],
    })

    const response = chat.choices[0].message.content
    await supabase.from('memories').insert({ content: input, response })
    res.status(200).json({ response })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}