const REPLICATE_API_BASE = 'https://api.replicate.com'

export interface Env {
  REPLICATE_KEY?: string
  STYLE_PALETTE_LOCK?: string // 'true' to enable palette lock
}

// Style Palette Definitions
const STYLE_PALETTES: Record<string, string[]> = {
  'pixel-fantasy': ['#4a90d9', '#2d5a87', '#f4d03f', '#e74c3c', '#27ae60', '#9b59b6'],
  'dark-dungeon': ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#94a3b8'],
  'neon-cyberpunk': ['#0ff', '#ff00ff', '#00ff00', '#ff6600', '#0000ff', '#ffff00'],
  'anime-rpg': ['#ff6b9d', '#c059cb', '#4ecdc4', '#ffe66d', '#6c5ce7', '#fd79a8'],
  'retro-8bit': ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'],
}

// Asset Type Prompt Templates
const ASSET_CONTEXT: Record<string, { prefix: string; actions: string[] }> = {
  character: {
    prefix: 'player character, hero, adventurer',
    actions: [
      'standing idle pose, front view',
      'attack pose, weapon ready',
      'death animation, fallen pose',
    ],
  },
  enemy: {
    prefix: 'enemy monster creature, hostile, roguelike',
    actions: [
      'idle animation, breathing, front view',
      'attack animation, striking pose',
      'death animation, defeat pose',
    ],
  },
  tileset: {
    prefix: 'game tile, dungeon terrain',
    actions: [
      'floor tile, walkable',
      'wall tile, solid',
      'object tile, decoration',
    ],
  },
  npc: {
    prefix: 'NPC villager, friendly character',
    actions: ['idle, standing', 'talk gesture', 'idle walking'],
  },
}

type FrameType = 'idle' | 'attack' | 'death'

interface RequestBody {
  style: string
  assetType: string
  characterName: string
  frameType?: FrameType
  width?: number
  height?: number
  guidance_scale?: number
  num_inference_steps?: number
  seed?: number
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

function buildPrompt(body: RequestBody): { prompt: string; negative_prompt: string } {
  const palette = STYLE_PALETTES[body.style]
  const assetCtx = ASSET_CONTEXT[body.assetType]
  const frameType: FrameType = body.frameType || 'idle'

  if (!palette) {
    throw new Error(`Unknown style: ${body.style}. Available: ${Object.keys(STYLE_PALETTES).join(', ')}`)
  }

  if (!assetCtx) {
    throw new Error(`Unknown assetType: ${body.assetType}. Available: ${Object.keys(ASSET_CONTEXT).join(', ')}`)
  }

  // Map frameType to action index
  const frameIndex = frameType === 'attack' ? 1 : frameType === 'death' ? 2 : 0
  const action = assetCtx.actions[frameIndex]

  // Build palette constraint string
  const paletteStr = palette.map(c => c).join(', ')

  // Construct prompt
  const prompt = `${assetCtx.prefix}, ${body.characterName}, ${action}, use only these colors: ${paletteStr}, pixel art, 16-bit RPG style, crisp edges, clean sprite`

  // Colors NOT in palette go to negative prompt
  const allColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000']
  const paletteSet = new Set(palette.map(c => c.toLowerCase()))
  const forbiddenColors = allColors.filter(c => !paletteSet.has(c.toLowerCase()))
  const negative_prompt = `avoid these colors: ${forbiddenColors.join(', ')}, watercolor, photograph, realistic, blurry, anti-aliased edges`

  return { prompt, negative_prompt }
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    let body: RequestBody
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const { style, assetType, characterName, frameType: _frameType, width = 1024, height = 1024, guidance_scale = 7.5, num_inference_steps = 30, seed } = body

    if (!style || !assetType || !characterName) {
      return new Response(JSON.stringify({ error: 'style, assetType, and characterName are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    let prompt: string
    let negative_prompt: string
    try {
      ({ prompt, negative_prompt } = buildPrompt(body))
    } catch (err) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Prompt building failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const createResponse = await fetch(`${REPLICATE_API_BASE}/v1/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          prompt,
          negative_prompt,
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const prediction: ReplicatePrediction = await createResponse.json()

    if (prediction.status === 'succeeded') {
      const result = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      return new Response(JSON.stringify({ imageUrl: result, prompt, negative_prompt }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      return new Response(JSON.stringify({ error: prediction.error || 'Prediction failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    try {
      const imageUrl = await pollPrediction(prediction.id, token)
      return new Response(JSON.stringify({ imageUrl, prompt, negative_prompt }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Polling failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
  },
}