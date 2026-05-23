export type AssetType = 'character' | 'enemy' | 'tileset' | 'ui' | 'props' | 'npc'

export type PixelStyle =
  | 'pixel-fantasy'
  | 'dark-dungeon'
  | 'neon-cyberpunk'
  | 'anime-rpg'
  | 'retro-8bit'

export interface GenerationParams {
  style: PixelStyle
  assetType: AssetType
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  seed?: number
  guidanceScale: number
  steps: number
}

export interface GeneratedAsset {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  params: GenerationParams
  createdAt: number
  metadata?: {
    transparent?: boolean
    spriteSheet?: boolean
    frameCount?: number
  }
}

export interface StylePreset {
  id: PixelStyle
  name: string
  description: string
  prompt: string
  negativePrompt: string
  palette?: string[]
}

export interface HistoryItem {
  id: string
  params: GenerationParams
  result?: GeneratedAsset
  status: 'pending' | 'generating' | 'success' | 'failed'
  error?: string
}