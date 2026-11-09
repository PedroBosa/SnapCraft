# SnapCraft ⚡

> **High-Fidelity Client-Side Code Presentation & Screenshot Studio.**  
> Zero-backend, zero-watermarks, procedural lighting engine, and 4K rasterization ready for GitHub Pages.

[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict_Mode-58DB91.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/Bundle_Gzip-~92_kB-9D4EDD.svg)](https://vitejs.dev/)
[![Zero Backend](https://img.shields.io/badge/Backend-100%25_Client--Side-22D3EE.svg)](#zero-backend-architecture)
[![Deploy to GitHub Pages](https://github.com/pedro/SnapCraft/actions/workflows/deploy.yml/badge.svg)](https://github.com/pedro/SnapCraft/actions/workflows/deploy.yml)

---

## 🎨 Overview

**SnapCraft** is an open-source, high-density desktop-class presentation tool engineered for software engineers, developer advocates, technical writers, and design teams. Inspired by the meticulous aesthetic of **Raycast (`ray.so`)**, **Linear**, **Figma**, and **CleanShot X**, SnapCraft delivers pixel-perfect presentations of source code and application screenshots without sending a single byte to external servers.

---

## ✨ Core Engineering Features

### 1. 🌌 Layered Ambient Occlusion (LAO) 5-Layer Shadow Engine
Physical light simulation through a composite CSS box-shadow matrix:
- **Layer 1 (Contact Umbra):** Sharp, high-opacity contact boundary.
- **Layer 2 (Penumbra Near):** Immediate diffuse edge softening.
- **Layer 3 (Ambient Dispersion):** Mid-field light decay.
- **Layer 4 (Wide Field Occlusion):** Deep ambient spatial falloff.
- **Layer 5 (Umbrella Boundary):** Atmospheric gradient aura.
- **Reactive Colored Glow:** Dynamically analyzes active background spectra (Hyper Indigo, Electric Violet, Emerald Core, Cyan Aurora) to project an emissive lighting aura behind the frame.
- **Specular Inset Rim:** Apple-grade `inset 0 1px 0 0 rgba(255, 255, 255, 0.16)` edge reflection.

### 2. ⚡ Zero-Latency Synchronous Syntax Tokenizer
- Powered by a synchronous lexical tokenizer with zero WebAssembly compilation lag.
- Supports **TypeScript, JavaScript, Python, Rust, Go, SQL, HTML, CSS, JSON, and Bash**.
- **Interactive Line Gutter:** Click any line number to cycle through states:
  $$\text{Normal} \longrightarrow \text{Highlighted (Indigo/Purple)} \longrightarrow \text{Diff Add (+ Emerald)} \longrightarrow \text{Diff Remove (- Rose)} \longrightarrow \text{Normal}$$
- **Focus Dimming:** Dramatically dims non-highlighted lines (`opacity: 0.35`, `blur(0.3px)`) to focus reader attention, with smooth hover restoration.

### 3. 📐 3D Perspective Tilt & Spatial Alignment
- Full 3D coordinate space with GPU hardware acceleration (`transform-style: preserve-3d`):
  - **Rotate X:** -20° to +20° (Tilt)
  - **Rotate Y:** -20° to +20° (Yaw)
  - **Rotate Z:** -10° to +10° (Roll)
  - **Perspective:** 800px to 2000px focal depth
- **1-Click Camera Presets:**
  - `Flat (0°, 0°, 0°)`
  - `Isometric Left (12°, -15°, 2°)`
  - `Isometric Right (12°, 15°, -2°)`
  - `Top Hero Tilt (16°, 0°, 0°)`
- **9-Point Spatial Alignment:** CleanShot X-style positioning matrix (`center`, `top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`) allowing components to bleed off stage boundaries for landing page heroes.

### 4. 🎯 Vector Annotation Layer
Overlay annotations rendered in stage space and rasterized directly into the final export:
- **Vector Arrow:** Directional vector arrow with independently draggable start $(x_1, y_1)$ and end $(x_2, y_2)$ handles.
- **Step Badge:** Numbered sequence badges (`1`, `2`, `3`...) with palette tinting for tutorials.
- **Text Pill / Label:** Frosted glass labels with inline double-click editing.
- **Redact / Blur Box:** Rectangular box with `backdrop-filter: blur(8px)` and technical 45° stripe pattern to obscure tokens, secrets, or API keys.
- **Filtered Export:** All drag handles and selection rings use `.stage-ignore-export` and are omitted during rasterization.

### 5. 🖨️ High-Density Industrial Exporter & `ClipboardItem` API
- Exports to **PNG**, **WebP**, and encapsulated vector **SVG**.
- Selectable resolution scaling:
  - `1x`: Standard 72 DPI display.
  - `2x`: Standard Retina pixel density.
  - `4x`: Industrial 4K / 300 DPI ultra-high-definition print grade.
- **Instant Clipboard Copy:** Generates an uncompressed in-memory PNG blob and invokes:
  ```typescript
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
  ```
  Paste directly into Figma, Slack, Discord, Linear, or Twitter via `⌘V`.

### 6. 🔗 Zero-Backend URL Compression (`?snap=...`)
- Full canvas configuration, code content, 3D rotations, and annotations are encoded into a compact, URL-safe Base64URL string supporting full UTF-8 Unicode characters (emojis, math symbols, non-Latin scripts).
- Share presets and code snippets instantly via URL without any backend database or account creation.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>⌘C</kbd> / <kbd>Ctrl+C</kbd> | Copy rendered image to clipboard | Global (when no text is selected) |
| <kbd>⌘S</kbd> / <kbd>Ctrl+S</kbd> | Quick export / download at active scale | Global |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> or <kbd>?</kbd> | Open Command Bar & shortcuts palette | Global (outside inputs) |
| <kbd>Tab</kbd> | Toggle between Code and Screenshot mode | Command Bar / Topbar |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete currently selected annotation | Global (outside inputs) |
| <kbd>Esc</kbd> | Close Command Bar / Deselect | Modal |

---

## 🛠️ Project Structure

```
SnapCraft/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated CI/CD for GitHub Pages
├── src/
│   ├── types/
│   │   └── snap.ts              # Domain contracts, configurations & presets
│   ├── core/
│   │   ├── shadows.ts           # 5-Layer Ambient Occlusion shadow math
│   │   ├── backgrounds.ts       # Studio gradients & procedural SVG noise
│   │   ├── tokenizer.ts         # Synchronous syntax tokenizer & diff parser
│   │   ├── exporter.ts          # High-density rasterization pipeline (1x-4K)
│   │   ├── aspectRatios.ts      # Stage dimension math & presets
│   │   ├── shortcuts.ts         # Global keyboard event orchestrator
│   │   ├── templates.ts         # 6 official studio template presets
│   │   └── urlState.ts          # Base64URL state serializer / deserializer
│   ├── store/
│   │   └── useSnapStore.ts      # Zustand store with LocalStorage persistence
│   └── modules/
│       ├── canvas/
│       │   ├── StageViewport.tsx    # Infinite viewport & interactive resize handles
│       │   ├── WindowFrame.tsx      # Window chrome (macOS, Windows, Browser, etc.)
│       │   ├── CodeEditor.tsx       # Live synchronized syntax editor
│       │   ├── ScreenshotView.tsx   # Drag-and-drop & clipboard paste view
│       │   ├── AnnotationLayer.tsx  # Vector arrows, badges, pills & blur boxes
│       │   └── Watermark.tsx        # Developer author handle
│       └── workbench/
│           ├── Topbar.tsx           # Navigation, aspect ratio, copy & export
│           ├── Sidebar.tsx          # 3D tilt, lighting, presets & typography controls
│           └── CommandPalette.tsx   # Raycast-style command bar modal
```

---

## 🚀 Quickstart & Development

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/SnapCraft.git
cd SnapCraft

# 2. Install dependencies
npm ci

# 3. Start local development server
npm run dev
```

### Production Build & Typecheck

```bash
# Strict TypeScript validation and optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

SnapCraft is pre-configured with `base: './'` in `vite.config.ts` and includes a GitHub Actions workflow:

1. Push your repository to GitHub.
2. In your repository settings, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically build and deploy the production app.

---

## 📄 License

SnapCraft is open-source software licensed under the [MIT License](LICENSE).
Built with passion for high-craft frontend engineering.
