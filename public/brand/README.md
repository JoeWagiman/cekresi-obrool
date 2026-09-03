# Obrool brand

Original mark: **the Obrool Loop**.

A geometric O (conversation circuit) with a live agent node at 2 o’clock.
Not a chat bubble, not a robot, not derived from OpenAI / Intercom / Linear / Vercel.

## Production files

| File | Use |
|---|---|
| `mark.svg` | Primary symbol — ink ring + Signal Blue node |
| `mark-ink.svg` | Mono |
| `mark-white.svg` / `mark-white-signal.svg` | On dark |
| `lockup.svg` | Horizontal mark + wordmark |
| `lockup-white.svg` / `lockup-stacked.svg` | Inverse / stacked |
| `wordmark.svg` | Type only (Inter SemiBold, tracking −0.03em) |
| `icon-app.svg` | Rounded-square app icon |
| `favicon.svg` / `favicon.ico` | Browser icon |
| `apple-touch-icon.png` | iOS 180px |
| `og.png` | Open Graph 1200×630 |
| `logo-email.png` | Transactional email |
| `brand-board.html` | Full system sheet |

## Color

- Ink `#0A0A0B` — primary
- Signal `#2563EB` — live node (same as site `blue-600`)
- Live `#10B981` — status variant
- Paper `#FAFAFA`

## Rules

- Clear space = ¼ of mark height
- Minimum 24px (mark), 16px (app icon)
- Do not rotate the node to 12 o’clock (reads as a power button)
- Do not replace the node with a chat-bubble tail
- Do not recolor the node arbitrarily in the nav lockup

## Code

React: `src/components/Logo.tsx` (`ObroolLogo`, `ObroolMark`, `ObroolIcon`)
Rebuild rasters: `uv run --with pillow --with fonttools python3 scripts/generate-brand.py`
