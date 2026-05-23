import { useState } from 'react'
import { Sparkles, Download, History, Palette, AlertCircle, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type PixelStyle, type AssetType } from '@/types'
import { generateAsset } from '@/lib/api'

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

const STORAGE_KEY = 'pixel-crafter-api-token'

function App() {
  const [selectedStyle, setSelectedStyle] = useState<PixelStyle>('pixel-fantasy')
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>('character')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [apiToken, setApiToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!apiToken.trim()) {
      setError('Please enter your Replicate API token first')
      setShowTokenInput(true)
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const imageUrl = await generateAsset(
        {
          style: selectedStyle,
          assetType: selectedAssetType,
          prompt,
          width: 1024,
          height: 1024,
          guidanceScale: 7.5,
          steps: 30,
        },
        apiToken
      )
      setGeneratedImage(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTokenSave = (token: string) => {
    setApiToken(token)
    localStorage.setItem(STORAGE_KEY, token)
    setShowTokenInput(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">PixelCrafter</span>
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Palette className="mr-2 h-4 w-4" />
              Style Library
            </Button>
            <Button variant="ghost" size="sm">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Input Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Generator</CardTitle>
                <CardDescription>
                  Generate pixel art assets for your 2D game in seconds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Token */}
                {!apiToken && !showTokenInput && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">API Token Required</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Enter your Replicate API token to start generating assets.
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 h-auto p-0 text-primary"
                          onClick={() => setShowTokenInput(true)}
                        >
                          <Key className="mr-1 h-3 w-3" />
                          Configure Token
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {showTokenInput && (
                  <TokenInput onSave={handleTokenSave} onCancel={() => setShowTokenInput(false)} />
                )}

                {/* Style Selection */}
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

                {/* Asset Type Selection */}
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

                {/* Prompt Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`Describe the ${ASSET_TYPE_LABELS[selectedAssetType].toLowerCase()} you want to generate...`}
                    className="min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Error Display */}
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
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

          {/* Right: Preview Panel */}
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
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download PNG
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Sprite Sheet
                      </Button>
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

            {/* Parameter Summary */}
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

interface TokenInputProps {
  onSave: (token: string) => void
  onCancel: () => void
}

function TokenInput({ onSave, onCancel }: TokenInputProps) {
  const [token, setToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      onSave(token.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <label className="text-sm font-medium">Replicate API Token</label>
        <p className="mt-1 text-xs text-muted-foreground">
          Get your token from{' '}
          <a
            href="https://replicate.com/account/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            replicate.com/account/api-tokens
          </a>
        </p>
      </div>
      <input
        type="password"
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder="r8_..."
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!token.trim()}>
          Save Token
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default App