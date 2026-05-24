import { useState } from 'react'
import { Sparkles, Download, History, Palette, AlertCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type PixelStyle, type AssetType } from '@/types'

const STYLE_PRESETS: Record<PixelStyle, { name: string }> = {
  'pixel-fantasy': { name: 'Pixel Fantasy' },
  'dark-dungeon': { name: 'Dark Dungeon' },
  'neon-cyberpunk': { name: 'Neon Cyberpunk' },
  'anime-rpg': { name: 'Anime RPG' },
  'retro-8bit': { name: 'Retro 8-bit' },
}

const ASSET_TYPES: AssetType[] = ['character', 'enemy', 'tileset', 'ui', 'props', 'npc']

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  character: 'Character',
  enemy: 'Enemy',
  tileset: 'Tileset',
  ui: 'UI Element',
  props: 'Props',
  npc: 'NPC',
}

const ASSET_TYPE_DESCRIPTIONS: Record<AssetType, string> = {
  character: 'Player characters, heroes, adventurers',
  enemy: 'Monsters, bosses, hostile creatures',
  tileset: 'Terrain, floors, walls, architecture',
  ui: 'Buttons, panels, health bars, icons',
  props: 'Items, weapons, potions, treasure',
  npc: 'Merchants, villagers, quest givers',
}

const STYLE_CONTEXT: Record<PixelStyle, string> = {
  'pixel-fantasy': 'pixel art, fantasy RPG, vibrant colors, crisp pixels, 16-bit era style',
  'dark-dungeon': 'pixel art, dark dungeon crawler, moody lighting, stone textures, torchlight glow',
  'neon-cyberpunk': 'pixel art, neon cyberpunk, glowing lights, dark city, rain reflections, retrofuturistic',
  'anime-rpg': 'pixel art, anime RPG style, expressive characters, colorful, JRPG aesthetic',
  'retro-8bit': '8-bit pixel art, NES style, limited color palette, authentic retro gaming',
}

const ASSET_CONTEXT: Record<AssetType, string> = {
  character: 'player character, hero, adventurer, standing pose',
  enemy: 'monster creature, hostile enemy, boss, combat ready',
  tileset: 'game tile, dungeon floor, stone wall, terrain element',
  ui: 'game UI element, button, panel, HUD component',
  props: 'game item, weapon, potion, treasure chest, collectible',
  npc: 'NPC, villager, merchant, quest giver, friendly character',
}

const WORKER_URL_KEY = 'pixel-crafter-worker-url'

function App() {
  const [selectedStyle, setSelectedStyle] = useState<PixelStyle>('pixel-fantasy')
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>('character')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showWorkerInput, setShowWorkerInput] = useState(false)
  const [workerUrl, setWorkerUrl] = useState(() => localStorage.getItem(WORKER_URL_KEY) || '')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!workerUrl.trim()) {
      setError('Please configure the Worker URL first')
      setShowWorkerInput(true)
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const fullPrompt = `${STYLE_CONTEXT[selectedStyle]}, ${ASSET_CONTEXT[selectedAssetType]}, ${prompt}`

      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          negative_prompt: 'photorealistic, blurry, low quality, modern, 3D render, watermark, signature, text overlay',
          width: 1024,
          height: 1024,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWorkerUrlSave = (url: string) => {
    setWorkerUrl(url)
    localStorage.setItem(WORKER_URL_KEY, url)
    setShowWorkerInput(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">PixelCrafter</span>
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <Palette className="mr-2 h-4 w-4" />
              Style Library
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Generator</CardTitle>
                <CardDescription>
                  Generate pixel art assets for your 2D game in seconds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!workerUrl && !showWorkerInput && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Worker URL Required</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Configure the Cloudflare Worker endpoint to enable generation.
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 h-auto p-0 text-primary"
                          onClick={() => setShowWorkerInput(true)}
                        >
                          <Globe className="mr-1 h-3 w-3" />
                          Configure Worker
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {showWorkerInput && (
                  <WorkerUrlInput onSave={handleWorkerUrlSave} onCancel={() => setShowWorkerInput(false)} />
                )}

                <div className="space-y-3">
                  <label className="text-sm font-medium">Style</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(Object.keys(STYLE_PRESETS) as PixelStyle[]).map(style => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                          selectedStyle === style
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }`}
                      >
                        {STYLE_PRESETS[style].name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Asset Type</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ASSET_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedAssetType(type)}
                        className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                          selectedAssetType === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }`}
                      >
                        <div className="font-medium">{ASSET_TYPE_LABELS[type]}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {ASSET_TYPE_DESCRIPTIONS[type]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`Describe the ${ASSET_TYPE_LABELS[selectedAssetType].toLowerCase()} you want to generate...`}
                    className="min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || !workerUrl.trim()}
                >
                  {isGenerating ? (
                    <>
                      <span className="mr-2 animate-spin">⟳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Asset
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="min-h-[400px]">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Generated asset will appear here</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {generatedImage ? (
                  <div className="relative w-full">
                    <img
                      src={generatedImage}
                      alt="Generated asset"
                      className="w-full rounded-lg border border-border"
                    />
                    <div className="mt-4 flex gap-2">
                      <a
                        href={generatedImage}
                        download="pixel-crafter-asset.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PNG
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Sparkles className="mb-4 h-12 w-12 opacity-50" />
                    <p className="text-sm">Configure parameters and generate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {generatedImage && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Generation Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Style:</span>
                      <span className="ml-2 font-medium">{STYLE_PRESETS[selectedStyle].name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{ASSET_TYPE_LABELS[selectedAssetType]}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2 font-medium">1024×1024</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <span className="ml-2 font-medium">SDXL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

interface WorkerUrlInputProps {
  onSave: (url: string) => void
  onCancel: () => void
}

function WorkerUrlInput({ onSave, onCancel }: WorkerUrlInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (trimmed) {
      onSave(trimmed)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <label className="text-sm font-medium">Cloudflare Worker URL</label>
        <p className="mt-1 text-xs text-muted-foreground">
          Get your Worker URL after deploying. Format: https://pixel-crafter-worker.&lt;your-subdomain&gt;.workers.dev
        </p>
      </div>
      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://pixel-crafter-worker.xxx.workers.dev"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!url.trim()}>
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default App