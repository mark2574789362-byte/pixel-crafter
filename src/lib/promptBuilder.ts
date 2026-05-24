import type { PixelStyle, AssetType } from '@/types'

export interface PromptParams {
  style: PixelStyle
  assetType: AssetType
  characterName: string
  frameType: 'idle' | 'attack' | 'death'
}

export interface StylePalette {
  name: string
  colors: string[]
  description: string
}

export const STYLE_PALETTES: Record<PixelStyle, StylePalette> = {
  'pixel-fantasy': {
    name: 'Pixel Fantasy',
    colors: ['#4a90d9', '#2d5a87', '#f4d03f', '#e74c3c', '#27ae60', '#9b59b6'],
    description: 'Vibrant fantasy RPG palette, saturated blues and golds',
  },
  'dark-dungeon': {
    name: 'Dark Dungeon',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#94a3b8'],
    description: 'Dark moody dungeon crawler, deep purples and reds',
  },
  'neon-cyberpunk': {
    name: 'Neon Cyberpunk',
    colors: ['#00ffff', '#ff00ff', '#00ff00', '#ff6600', '#0000ff', '#ffff00'],
    description: 'Neon cyberpunk, bright cyan and magenta glow',
  },
  'anime-rpg': {
    name: 'Anime RPG',
    colors: ['#ff6b9d', '#c059cb', '#4ecdc4', '#ffe66d', '#6c5ce7', '#fd79a8'],
    description: 'Anime JRPG style, pastel pinks and teals',
  },
  'retro-8bit': {
    name: 'Retro 8-bit',
    colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'],
    description: 'NES authentic limited palette, 6 colors only',
  },
}

export const ASSET_CONTEXTS: Record<AssetType, { prefix: string; frames: string[] }> = {
  enemy: {
    prefix: 'enemy monster creature, hostile, roguelike game asset',
    frames: ['idle breathing animation front view', 'attack striking pose combat ready', 'death defeat animation fallen'],
  },
  character: {
    prefix: 'player character hero adventurer',
    frames: ['idle standing pose front view', 'attack pose weapon ready', 'death fallen defeated'],
  },
  npc: {
    prefix: 'NPC villager friendly character game asset',
    frames: ['idle standing', 'talk gesture dialogue', 'walk animation'],
  },
  tileset: {
    prefix: 'game tile dungeon terrain pixel art',
    frames: ['floor walkable tile', 'wall solid tile', 'object decoration tile'],
  },
  ui: {
    prefix: 'game UI element button panel HUD',
    frames: ['normal state', 'highlighted state', 'disabled state'],
  },
  props: {
    prefix: 'game item prop collectible treasure',
    frames: ['idle item', 'sparkle highlight', 'collection animation'],
  },
}

export function buildGenerationRequest(params: PromptParams): {
  prompt: string
  negative_prompt: string
  style: PixelStyle
  assetType: AssetType
  characterName: string
  frameType: string
} {
  const palette = STYLE_PALETTES[params.style]
  const context = ASSET_CONTEXTS[params.assetType]
  const frameDesc = context.frames[params.frameType === 'idle' ? 0 : params.frameType === 'attack' ? 1 : 2]
  
  const paletteConstraint = `color palette locked: ${palette.colors.join(', ')}`
  const styleTags = getStyleTags(params.style)
  
  const fullPrompt = `${context.prefix}, ${params.characterName}, ${frameDesc}, ${styleTags}, ${paletteConstraint}, pixel art, transparent background, game asset, crisp pixels, no anti-aliasing`
  const negativePrompt = `photorealistic, blurry, low quality, modern UI elements, watermark, signature, text overlay, dithering artifacts, ${palette.colors.map(c => `not ${c}`).join(', ')}`

  return {
    prompt: fullPrompt,
    negative_prompt: negativePrompt,
    style: params.style,
    assetType: params.assetType,
    characterName: params.characterName,
    frameType: params.frameType,
  }
}

function getStyleTags(style: PixelStyle): string {
  const tags: Record<PixelStyle, string> = {
    'pixel-fantasy': 'fantasy RPG vibrant colors 16-bit era classic JRPG',
    'dark-dungeon': 'dark dungeon moody lighting torchlight stone textures',
    'neon-cyberpunk': 'neon cyberpunk glowing lights dark city rain reflections retrofuturistic',
    'anime-rpg': 'anime RPG style expressive characters colorful JRPG aesthetic',
    'retro-8bit': '8-bit NES style limited color palette authentic retro gaming',
  }
  return tags[style]
}