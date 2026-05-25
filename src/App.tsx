// PixelCrafter — AI-powered pixel art sprite generator
import { useState } from 'react'
import { Sparkles, Download, History, Palette, AlertCircle, Globe, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type PixelStyle } from '@/types'
import { createSpriteSheet, downloadSpriteSheet } from '@/lib/spriteSheetExporter'

const WORKER_URL_KEY = 'pixel-crafter-worker-url'
const WORKER_URL = 'https://pixel-crafter-worker.mark2574789362.workers.dev'

const STYLE_PRESETS: Record<PixelStyle, { name: string }> = {
  'pixel-fantasy': { name: 'Pixel Fantasy' },
  'dark-dungeon': { name: 'Dark Dungeon' },
  'neon-cyberpunk': { name: 'Neon Cyberpunk' },
  'anime-rpg': { name: 'Anime RPG' },
  'retro-8bit': { name: 'Retro 8-bit' },
} 

const FRAME_TYPES = ['idle', 'attack', 'death'] as const
const FRAME_LABELS: Record<string, string> = {
  idle: 'Idle',
  attack: 'Attack',
  death: 'Death',
}
const FRAME_DESCRIPTIONS: Record<string, string> = {
  idle: 'Breathing animation, front view',
  attack: 'Striking pose, combat ready',
  death: 'Defeat animation, fallen',
}

function App() {
  const [selectedStyle, setSelectedStyle] = useState<PixelStyle>('pixel-fantasy')
  const [characterName, setCharacterName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentFrame, setCurrentFrame] = useState<string>('')
  const [generatedFrames, setGeneratedFrames] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [showWorkerInput, setShowWorkerInput] = useState(false)
  const [workerUrl, setWorkerUrl] = useState(() => localStorage.getItem(WORKER_URL_KEY) || WORKER_URL)

  const handleGenerate = async () => {
    if (!characterName.trim()) return
    if (!workerUrl.trim()) {
      setError('Please configure the Worker URL first')
      setShowWorkerInput(true)
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedFrames({})

    const allFrames: Record<string, string> = {}

    try {
      for (const frameType of FRAME_TYPES) {
        setCurrentFrame(frameType)

        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            style: selectedStyle,
            assetType: 'enemy',
            characterName: characterName.trim(),
            frameType,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Generation failed for ${frameType}`)
        }

        allFrames[frameType] = data.imageUrl
      }

      setGeneratedFrames(allFrames)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
      setCurrentFrame('')
    }
  }

  const handleWorkerUrlSave = (url: string) => {
    setWorkerUrl(url)
    localStorage.setItem(WORKER_URL_KEY, url)
    setShowWorkerInput(false)
  }

  const handleExportSpriteSheet = async () => {
    const imageUrls = FRAME_TYPES.map(ft => generatedFrames[ft]).filter(Boolean)
    if (imageUrls.length === 0) return

    try {
      const exportData = await createSpriteSheet(imageUrls, characterName)
      downloadSpriteSheet(exportData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    }
  }

  const hasAllFrames = FRAME_TYPES.every(ft => generatedFrames[ft])

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
            <Button variant="ghost" size="sm" onClick={handleExportSpriteSheet} disabled={!hasAllFrames}>
              <Download className="mr-2 h-4 w-4" />
              Export Sprite Sheet
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enemy Sprite Generator</CardTitle>
                <CardDescription>
                  Generate animated enemy sprites with idle, attack, and death frames
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
                  <label className="text-sm font-medium">Enemy Type</label>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="font-medium">Enemy</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Monsters, bosses, hostile creatures
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Character Name</label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={e => setCharacterName(e.target.value)}
                    placeholder="e.g. Skeleton Warrior, Dark Slime, Flame Demon"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Animation Frames</label>
                  <div className="space-y-2">
                    {FRAME_TYPES.map(ft => (
                      <div
                        key={ft}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          currentFrame === ft
                            ? 'border-primary bg-primary/10'
                            : generatedFrames[ft]
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-border'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{FRAME_LABELS[ft]}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {FRAME_DESCRIPTIONS[ft]}
                          </div>
                        </div>
                        <div className="text-sm">
                          {currentFrame === ft ? (
                            <span className="animate-spin">⟳</span>
                          ) : generatedFrames[ft] ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  disabled={isGenerating || !characterName.trim() || !workerUrl.trim()}
                >
                  {isGenerating ? (
                    <>
                      <span className="mr-2 animate-spin">⟳</span>
                      Generating {currentFrame ? `${FRAME_LABELS[currentFrame]}` : ''} frame...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate All Frames
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
                <CardDescription>Idle | Attack | Death</CardDescription>
              </CardHeader>
              <CardContent>
                {hasAllFrames ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {FRAME_TYPES.map(ft => (
                        <div key={ft} className="flex-1 text-center">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            {FRAME_LABELS[ft]}
                          </div>
                          <img
                            src={generatedFrames[ft]}
                            alt={`${ft} frame`}
                            className="w-full rounded-lg border border-border"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExportSpriteSheet}
                        className="flex-1"
                        size="sm"
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        Export Sprite Sheet
                      </Button>
                      <a
                        href={generatedFrames.idle}
                        download={`${characterName.toLowerCase().replace(/\s+/g, '-')}-idle.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PNG
                      </a>
                    </div>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Sparkles className="mb-4 h-12 w-12 opacity-50 animate-pulse" />
                    <p className="text-sm">
                      {currentFrame
                        ? `Generating ${FRAME_LABELS[currentFrame]} frame...`
                        : 'Preparing...'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Sparkles className="mb-4 h-12 w-12 opacity-50" />
                    <p className="text-sm">Enter a character name and generate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasAllFrames && (
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
                      <span className="ml-2 font-medium">Enemy</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frames:</span>
                      <span className="ml-2 font-medium">3 (Idle/Attack/Death)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2 font-medium">128×128</span>
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
