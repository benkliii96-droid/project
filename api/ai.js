const API_URL = 'https://api.openai.com/v1/chat/completions'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { model, messages, max_tokens } = req.body

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[api/ai] OpenAI error:', data)
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI error' })
    }

    res.status(200).json(data)
  } catch (err) {
    console.error('[api/ai]', err.message)
    res.status(500).json({ error: err.message })
  }
}
