# PixelCrafter — AI Pixel Asset Pipeline

> Turn enemy names into game-ready sprite sheets. One input. Three frames. Ready for Unity.

[![Deploy Status](https://github.com/mark2574789362-byte/pixel-crafter/actions/workflows/worker.yml/badge.svg)](https://github.com/mark2574789362-byte/pixel-crafter/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 What It Does

PixelCrafter generates **consistent pixel art sprite sheets** for Roguelike games — from a single enemy name to a production-ready asset in seconds.

```
Skeleton Warrior → [idle] [attack] [death] → spritesheet.png + unity-meta.json
```

## 🔥 Features

### Style Palette Lock
Each style has a **locked color palette** (6 colors). Generated assets are constrained to the style palette, ensuring visual consistency across all characters in your game.

### Multi-Frame Generation
One enemy name → three animation frames:
- **Idle** — breathing, alert stance
- **Attack** — strike/cast pose
- **Death** — defeat animation

### Sprite Sheet Export
Automatic horizontal Sprite Sheet assembly. Download as PNG + JSON metadata for Unity/Godot import.

### Style Presets
- 🎨 **Pixel Fantasy** — Vibrant 16-bit JRPG
- 🏴 **Dark Dungeon** — Moody torchlit dungeon
- 🌃 **Neon Cyberpunk** — Glowing retrowave city
- 🎌 **Anime RPG** — Pastel JRPG aesthetic
- 👾 **Retro 8-bit** — Authentic NES palette

## 📐 Architecture

```
User Input: "Skeleton Warrior"
    ↓
Prompt Engineering Pipeline
  - Style Palette Lock (6-color constraint)
  - Asset Type Context (enemy template)
  - Frame Action Template (idle/attack/death)
  - Seed Tracking (reproducibility)
    ↓
Cloudflare Worker (API Proxy)
  - Bypasses CORS
  - Manages Replicate API
  - Handles async prediction polling
    ↓
Stability AI SDXL (via Replicate)
    ↓
Sprite Sheet Assembly (Canvas API)
    ↓
PNG + JSON Export
```

## 🛠 Tech Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS 4
- **Animation**: Framer Motion
- **API Proxy**: Cloudflare Worker (edge-deployed)
- **Image Gen**: Stability AI SDXL via Replicate
- **Deployment**: GitHub Actions → Cloudflare Pages + Workers

## 📁 Project Structure

```
pixel-crafter/
├── src/
│   ├── App.tsx              # Main app UI
│   ├── components/ui/      # Shadcn/ui components
│   ├── lib/
│   │   ├── promptBuilder.ts # Prompt engineering + style palettes
│   │   └── spriteSheetExporter.ts # Canvas-based sprite sheet assembly
│   ├── worker/
│   │   └── index.ts         # Cloudflare Worker proxy
│   └── types/
│       └── index.ts         # TypeScript types
├── wrangler.toml           # Cloudflare Worker config
└── .github/workflows/
    └── worker.yml          # Auto-deploy Worker
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Replicate account + API token
- Cloudflare account (free tier works)

### Local Development

```bash
git clone https://github.com/mark2574789362-byte/pixel-crafter
cd pixel-crafter
npm install
npm run dev
```

### Environment Setup

1. Get Replicate API token: [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Get Cloudflare API token: [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
3. Add secrets to GitHub repo:
   - `REPLICATE_API_TOKEN` — Replicate API key
   - `CLOUDFLARE_API_TOKEN` — Cloudflare Workers edit permission

### Deployment

Push to `main` branch — GitHub Actions auto-deploys:
- Frontend → Cloudflare Pages
- Worker → Cloudflare Workers

## 📊 Current Status

| Feature | Status |
|---------|--------|
| Style Palette Lock | ✅ Implemented |
| Multi-Frame Generation | ✅ Implemented |
| Sprite Sheet Export | ✅ Implemented |
| Cloudflare Worker Proxy | ✅ Deployed |
| Seed Tracking | 🔜 Next |
| Unity/Godot Meta Export | 🔜 Next |

## 🎯 Roadmap

- [ ] Seed tracking + history
- [ ] Reference image upload (style consistency)
- [ ] LoRA fine-tuning integration
- [ ] Unity/Godot one-click import meta files
- [ ] Batch generation (full enemy roster)

## 📝 License

MIT