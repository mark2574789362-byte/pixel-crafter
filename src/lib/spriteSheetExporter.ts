export interface SpriteSheetExport {
  imageDataUrl: string
  metadata: {
    characterName: string
    frameCount: number
    frameWidth: number
    frameHeight: number
    totalWidth: number
    totalHeight: number
    frames: { name: string; x: number; y: number; width: number; height: number }[]
  }
}

export function createSpriteSheet(imageUrls: string[], characterName: string): Promise<SpriteSheetExport> {
  return new Promise((resolve, reject) => {
    const FRAME_WIDTH = 128
    const FRAME_HEIGHT = 128
    const frames = imageUrls.length
    
    const canvas = document.createElement('canvas')
    canvas.width = FRAME_WIDTH * frames
    canvas.height = FRAME_HEIGHT
    const ctx = canvas.getContext('2d')!
    
    let loaded = 0
    
    imageUrls.forEach((url, index) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, index * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT)
        loaded++
        if (loaded === frames) {
          const imageDataUrl = canvas.toDataURL('image/png')
          resolve({
            imageDataUrl,
            metadata: {
              characterName,
              frameCount: frames,
              frameWidth: FRAME_WIDTH,
              frameHeight: FRAME_HEIGHT,
              totalWidth: canvas.width,
              totalHeight: canvas.height,
              frames: ['idle', 'attack', 'death'].map((name, i) => ({
                name,
                x: i * FRAME_WIDTH,
                y: 0,
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
              })),
            },
          })
        }
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image ${index}`))
      }
      img.src = url
    })
  })
}

export function downloadSpriteSheet(exportData: SpriteSheetExport) {
  // Download PNG
  const link = document.createElement('a')
  link.download = `${exportData.metadata.characterName.toLowerCase().replace(/\s+/g, '-')}-spritesheet.png`
  link.href = exportData.imageDataUrl
  link.click()
  
  // Download metadata JSON
  const jsonBlob = new Blob([JSON.stringify(exportData.metadata, null, 2)], { type: 'application/json' })
  const jsonLink = document.createElement('a')
  jsonLink.download = `${exportData.metadata.characterName.toLowerCase().replace(/\s+/g, '-')}-spritesheet.json`
  jsonLink.href = URL.createObjectURL(jsonBlob)
  jsonLink.click()
}