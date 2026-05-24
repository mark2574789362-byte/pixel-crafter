import Replicate from 'replicate'
import type { PixelStyle } from '@/types'

const STYLE_PROMPTS: Record<PixelStyle, { prompt: string; negativePrompt: string }> = {
  'pixel-fantasy': {
    prompt: 'pixel art, fantasy RPG, vibrant colors, crisp pixels, 16-bit era style',
    negativePrompt: 'photorealistic, blurry, low quality, modern, 3D render',
  },
  'dark-dungeon': {
    prompt: 'pixel art, dark dungeon crawler, moody lighting, stone textures, torchlight glow',
    negativePrompt: 'bright, sunny, cartoon, low quality, modern UI elements',
  },
  'neon-cyberpunk': {
    prompt: 'pixel art, neon cyberpunk, glowing lights, dark city, rain reflections, retrofuturistic',
    negativePrompt: 'natural lighting, medieval, fantasy, low quality, blurry',
  },
  'anime-rpg': {
    prompt: 'pixel art, anime RPG style, expressive characters, colorful, JRPG aesthetic',
    negativePrompt: 'western cartoon, realistic, dark souls, low quality, blurry pixels',
  },
  'retro-8bit': {
    prompt: '8-bit pixel art, NES style, limited color palette, authentic retro gaming',
    negativePrompt: '16-bit, smooth gradients, high resolution, modern, 3D',
  },
}

const ASSET_TYPE_PROMPTS: Record<string, string> = {
  character: 'player character, hero, adventurer, standing pose',
  enemy: 'monster creature, hostile enemy, boss, combat ready',
  tileset: 'game tile, dungeon floor, stone wall, terrain element',
  ui: 'game UI element, button, panel, HUD component',
  props: 'game item, weapon, potion, treasure chest, collectible',
  npc: 'NPC, villager, merchant, quest giver, friendly character',
}

export interface GenerateOptions {
  style: PixelStyle
  assetType: string
  prompt: string
  width?: number
  height?: number
  seed?: number
  guidanceScale?: number
  steps?: number
}

export async function generateAsset(
  options: GenerateOptions,
  apiToken: string
): Promise<string> {
  const { style, assetType, prompt, width = 1024, height = 1024, seed, guidanceScale = 7.5, steps = 30 } = options

  const replicate = new Replicate({ auth: apiToken })

  const styleConfig = STYLE_PROMPTS[style]
  const assetContext = ASSET_TYPE_PROMPTS[assetType] || ''

  const fullPrompt = `${styleConfig.prompt}, ${assetContext}, ${prompt}`.trim()
  const negativePrompt = `${styleConfig.negativePrompt}, watermark, signature, text overlay`

  const model = 'stability-ai/sdxl:da77bc8f9041c6709f4c94be22e1b47229c4c2f5eb04604c47b3cd9e4b4ad6e'

  const input: Record<string, unknown> = {
    prompt: fullPrompt,
    negative_prompt: negativePrompt,
    width,
    height,
    guidance_scale: guidanceScale,
    num_inference_steps: steps,
  }

  if (seed !== undefined) {
    input.seed = seed
  }

  try {
    const output = await replicate.run(model, { input }) as string | string[]
    if (Array.isArray(output)) {
      return output[0]
    }
    return output
  } catch (err) {
    console.error('Replicate error:', err)
    throw new Error(`Generation failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function generateSpriteSheet(
  options: GenerateOptions,
  frameCount: number = 4,
  apiToken: string
): Promise<string[]> {
  const frames = await Promise.all(
    Array.from({ length: frameCount }, (_, i) => {
      const frameOptions = {
        ...options,
        seed: options.seed ? options.seed + i : undefined,
      }
      return generateAsset(frameOptions, apiToken)
    })
  )
  return frames
}