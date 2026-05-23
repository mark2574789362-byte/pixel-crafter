# pixel-crafter

AI-powered 2D game asset pipeline for Roguelike pixel art generation.

## Overview

PixelCrafter is a web-based tool that helps 2D game developers (particularly Roguelike and indie game creators) generate consistent, high-quality pixel art assets using AI. The tool outputs game-ready assets compatible with Unity, Godot, and other mainstream 2D game engines.

## Target Users

- **Indie game developers** working on 2D Roguelike games
- **Small studios** needing bulk pixel art assets
- **Solo creators** who want to produce game assets without pixel art skills

## Core Problem

- Hiring pixel artists is expensive ($50-200/hour)
- Style inconsistency when sourcing assets from multiple places
- Time-consuming sprite sheet creation and engine import

## Core Features

- [ ] Style-locked generation (maintain visual consistency across all assets)
- [ ] Multiple asset type support: characters, enemies, tilesets, UI, props, NPCs
- [ ] Sprite sheet auto-generation
- [ ] One-click export to Unity/Godot compatible formats
- [ ] Generation history and parameter memory

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS 4
- **AI Generation**: Stable Diffusion via Replicate API
- **Image Processing**: rembg (background removal)
- **Animation**: Framer Motion

## Project Structure

```
pixel-crafter/
├── src/
│   ├── components/     # UI components
│   ├── hooks/          # React hooks
│   ├── types/          # TypeScript type definitions
│   ├── lib/            # Utility functions
│   └── pages/          # Page components
├── docs/               # Documentation
└── public/             # Static assets
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Dependencies

### Core Dependencies
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons
- [Replicate](https://replicate.com/) - AI image generation API

### UI Utilities
- [clsx](https://github.com/lukeed/clsx) - Conditional className utility
- [tailwind-merge](https://github.com/RickCochrane/tailwind-merge) - Tailwind class merging
- [class-variance-authority](https://github.com/joeatt/cva) - Component variant styles

### Build Tools
- [@tailwindcss/vite](https://tailwindcss.com/) - Tailwind Vite plugin
- [@types/node](https://www.npmjs.com/package/@types/node) - TypeScript type definitions

### Component Library
- shadcn/ui (Button, Card components) - Implementation follows [shadcn/ui patterns](https://ui.shadcn.com/). Original design and implementation is custom for this project.

> **Note**: Button and Card components are custom implementations following shadcn/ui design guidelines. They are not installed as an npm package — source code is in `src/components/ui/`.

## License

MIT

## Author

mark2574789362-byte