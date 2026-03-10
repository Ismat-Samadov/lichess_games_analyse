# LUDO NEON — Cyber Board Game

A futuristic, neon-themed Ludo board game built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**.

![Ludo Neon](public/favicon.svg)

## Features

- **Full Ludo rules** — roll a 6 to enter, captures, safe squares, home column, win detection
- **2–4 players** — always you (Red) vs 1–3 AI opponents
- **Two AI difficulty tiers** — Easy (random) and Hard (heuristic: prefers captures, home column, advancing)
- **Neon/Glassmorphism aesthetic** — dark background, glowing borders, neon player colours
- **Framer Motion animations** — smooth token movement, dice rolling, confetti win screen
- **Web Audio API sound effects** — no external files; dice rolls, moves, captures, victory fanfare
- **Sound toggle** — mute/unmute at any time
- **Pause / Resume** — via button or `Esc` key
- **Responsive & mobile-first** — works on all screen sizes; touch + on-screen controls
- **Keyboard controls** — `Space`/`Enter` to roll, `Esc` to pause
- **Round counter** — tracks game progress
- **Capture notifications** — visual feedback when a token is sent home
- **Vercel ready** — zero-config deploy

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Sound | Web Audio API (no files needed) |
| Deploy | Vercel |

## Controls

### Desktop
| Action | Control |
|--------|---------|
| Roll dice | Click dice **or** `Space` / `Enter` |
| Move token | Click the glowing token |
| Pause / Resume | `Esc` or Pause button |
| Restart | ↺ button (top-right) |

### Mobile / Touch
| Action | Control |
|--------|---------|
| Roll dice | Tap the dice |
| Move token | Tap the glowing token |
| Pause | Tap ⏸ button |

## Game Rules

1. **Enter the board** — must roll a **6** to move a token out of the base
2. **Extra turn** — rolling a **6** grants another roll; capturing an opponent also grants a bonus turn
3. **Triple six penalty** — rolling three 6s in a row forfeits the turn
4. **Captures** — landing on an opponent's token sends it back to its base (except on ★ safe squares)
5. **Safe squares** — marked with ★; entry squares of each player are always safe
6. **Home column** — enter only your coloured column; cannot overshoot the final square
7. **Win** — first player to get all 4 tokens to the centre wins

## Running Locally

```bash
git clone <repo-url>
cd ludo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
# Option 1 — Vercel CLI
npm i -g vercel
vercel

# Option 2 — Push to GitHub and import at vercel.com/new
```

No environment variables required. Zero configuration.

## Project Structure

```
src/
  types/
    game.ts          # TypeScript interfaces & types
  lib/
    constants.ts     # Board paths, colours, safe squares
    gameLogic.ts     # Pure game rules (move, capture, win)
    aiLogic.ts       # AI decision-making (easy / hard)
  hooks/
    useGameState.ts  # Central game state (useReducer)
    useSound.ts      # Web Audio API sound effects
  components/
    LudoGame.tsx     # Top-level game controller
    LudoBoard.tsx    # 15×15 CSS Grid board + tokens
    Dice.tsx         # Animated neon dice
    PlayerCard.tsx   # Player info & token status
    WinScreen.tsx    # Victory overlay with confetti
    SetupScreen.tsx  # Game setup / main menu
  app/
    page.tsx         # Entry point
    layout.tsx       # Root layout & metadata
    globals.css      # Global styles
```
