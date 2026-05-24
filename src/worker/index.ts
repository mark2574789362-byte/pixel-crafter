const REPLICATE_API_BASE = 'https://api.replicate.com'

export interface Env {
  REPLICATE_KEY?: string
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string | string[]
  error?: string
}

async function pollPrediction(predictionId: string, token: string): Promise<string> {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${REPLICATE_API_BASE}/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`)
    }

    const prediction: ReplicatePrediction = await response.json()

    if (prediction.status === 'succeeded') {
      if (Array.isArray(prediction.output)) {
        return prediction.output[0]
      }
      return prediction.output as string
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(prediction.error || 'Prediction failed')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error('Prediction timed out')
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    if (request.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 })
    }

    const token = env.REPLICATE_KEY || ''
    if (!token) {
      return new Response(JSON.stringify({ error: 'REPLICATE_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let body: { prompt?: string; negative_prompt?: string; width?: number; height?: number; guidance_scale?: number; num_inference_steps?: number; seed?: number }
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { prompt, negative_prompt, width = 1024, height = 1024, guidance_scale = 7.5, num_inference_steps = 30, seed } = body

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const createResponse = await fetch(`${REPLICATE_API_BASE}/v1/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'da77bc8f9041c6709f4c94be22e1b47229c4c2f5eb04604c47b3cd9e4b4ad6e',
        input: {
          prompt,
          negative_prompt: negative_prompt || '',
          width,
          height,
          guidance_scale,
          num_inference_steps,
          ...(seed !== undefined ? { seed } : {}),
        },
      }),
    })

    if (!createResponse.ok) {
      const err = await createResponse.text()
      return new Response(JSON.stringify({ error: `Replicate error: ${createResponse.status}`, details: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const prediction: ReplicatePrediction = await createResponse.json()

    if (prediction.status === 'succeeded') {
      const result = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      return new Response(JSON.stringify({ imageUrl: result }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      return new Response(JSON.stringify({ error: prediction.error || 'Prediction failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const imageUrl = await pollPrediction(prediction.id, token)
      return new Response(JSON.stringify({ imageUrl }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Polling failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
}