'use client';
/**
 * LudoBoard — renders the 15×15 board grid and all tokens.
 * Uses CSS Grid + absolute positioning for crisp, scalable layout.
 */
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerColor, Player, Token } from '@/types/game';
import {
  MAIN_PATH,
  HOME_COLUMNS,
  HOME_BASE_POSITIONS,
  PLAYER_COLORS,
  SAFE_SQUARES,
  PLAYER_ENTRY,
  FINISHED_POSITION,
  PLAYER_ORDER,
} from '@/lib/constants';
import { tokenToCell, absPathIndex } from '@/lib/gameLogic';
import clsx from 'clsx';

// ─── Cell type classification ─────────────────────────────────────────────────
type CellType =
  | 'blank'
  | 'path'
  | 'safe'
  | 'home-red'
  | 'home-blue'
  | 'home-green'
  | 'home-yellow'
  | 'homebase-red'
  | 'homebase-blue'
  | 'homebase-green'
  | 'homebase-yellow'
  | 'homecol-red'
  | 'homecol-blue'
  | 'homecol-green'
  | 'homecol-yellow'
  | 'entry-red'
  | 'entry-blue'
  | 'entry-green'
  | 'entry-yellow'
  | 'centre';

interface CellInfo {
  type: CellType;
  pathIndex?: number; // absolute main path index
}

/** Build a 15×15 map of cell info for fast lookup */
function buildCellMap(): CellInfo[][] {
  const map: CellInfo[][] = Array.from({ length: 15 }, () =>
    Array.from({ length: 15 }, () => ({ type: 'blank' as CellType })),
  );

  // Home base zones
  const homeZones: [PlayerColor, [number, number], [number, number]][] = [
    ['red',    [0, 0], [5, 5]],
    ['blue',   [0, 9], [5, 14]],
    ['green',  [9, 9], [14, 14]],
    ['yellow', [9, 0], [14, 5]],
  ];
  for (const [color, [r1, c1], [r2, c2]] of homeZones) {
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        map[r][c] = { type: `homebase-${color}` as CellType };
      }
    }
  }

  // Main path
  MAIN_PATH.forEach(([r, c], idx) => {
    const isSafe = SAFE_SQUARES.has(idx);
    // Detect entry cells
    const entryColors = Object.entries(PLAYER_ENTRY) as [PlayerColor, number][];
    const entryMatch = entryColors.find(([, ei]) => ei === idx);
    if (entryMatch) {
      map[r][c] = { type: `entry-${entryMatch[0]}` as CellType, pathIndex: idx };
    } else if (isSafe) {
      map[r][c] = { type: 'safe', pathIndex: idx };
    } else {
      map[r][c] = { type: 'path', pathIndex: idx };
    }
  });

  // Home columns
  const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
  for (const color of colors) {
    for (const [r, c] of HOME_COLUMNS[color]) {
      map[r][c] = { type: `homecol-${color}` as CellType };
    }
  }

  // Centre
  map[7][7] = { type: 'centre' };

  return map;
}

const CELL_MAP = buildCellMap();

// ─── Cell background ──────────────────────────────────────────────────────────
function getCellStyle(cell: CellInfo): string {
  switch (cell.type) {
    case 'homebase-red':    return 'bg-[#ff2d5514] border border-[#ff2d5530]';
    case 'homebase-blue':   return 'bg-[#00f3ff14] border border-[#00f3ff30]';
    case 'homebase-green':  return 'bg-[#39ff1414] border border-[#39ff1430]';
    case 'homebase-yellow': return 'bg-[#fff70014] border border-[#fff70030]';
    case 'homecol-red':     return 'bg-[#ff2d5540]';
    case 'homecol-blue':    return 'bg-[#00f3ff40]';
    case 'homecol-green':   return 'bg-[#39ff1440]';
    case 'homecol-yellow':  return 'bg-[#fff70040]';
    case 'entry-red':       return 'bg-[#ff2d5570]';
    case 'entry-blue':      return 'bg-[#00f3ff70]';
    case 'entry-green':     return 'bg-[#39ff1470]';
    case 'entry-yellow':    return 'bg-[#fff70070]';
    case 'safe':            return 'bg-white/10';
    case 'path':            return 'bg-white/5 border border-white/10';
    case 'centre':          return 'bg-gradient-to-br from-[#ff2d55] via-[#bf00ff] to-[#00f3ff]';
    default:                return 'bg-[#050510]';
  }
}

// ─── Token component ──────────────────────────────────────────────────────────
interface TokenDotProps {
  token: Token;
  isMovable: boolean;
  isActive: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

const TokenDot = React.memo(function TokenDot({
  token,
  isMovable,
  isActive,
  onClick,
  style,
}: TokenDotProps) {
  const { primary, neon } = PLAYER_COLORS[token.player];

  return (
    <motion.div
      key={`${token.player}-${token.id}`}
      layoutId={`token-${token.player}-${token.id}`}
      onClick={isMovable ? onClick : undefined}
      style={{ ...style, background: primary, boxShadow: isMovable ? `0 0 8px ${neon}, 0 0 16px ${neon}` : `0 0 4px ${neon}` }}
      className={clsx(
        'absolute w-[70%] h-[70%] top-[15%] left-[15%] rounded-full z-10',
        'flex items-center justify-center text-black font-bold',
        isMovable && 'cursor-pointer z-20',
        isActive && 'z-30',
      )}
      animate={
        isMovable
          ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.8 } }
          : { scale: 1 }
      }
      whileHover={isMovable ? { scale: 1.2 } : {}}
      whileTap={isMovable ? { scale: 0.9 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="text-[0.45em] select-none pointer-events-none leading-none font-black">
        {token.id + 1}
      </span>
    </motion.div>
  );
});

// ─── Board component ──────────────────────────────────────────────────────────
interface LudoBoardProps {
  players: Player[];
  activePlayerIndex: number;
  movableTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
  phase: string;
}

export default function LudoBoard({
  players,
  activePlayerIndex,
  movableTokenIds,
  onTokenClick,
  phase,
}: LudoBoardProps) {
  const activePlayer = players[activePlayerIndex];

  // Build a map from "row-col" → list of tokens at that cell
  const tokensByCell = useMemo(() => {
    const map = new Map<string, { token: Token; playerIdx: number }[]>();

    players.forEach((player, pIdx) => {
      player.tokens.forEach((token) => {
        if (token.position === FINISHED_POSITION) {
          const key = '7-7';
          const arr = map.get(key) ?? [];
          arr.push({ token, playerIdx: pIdx });
          map.set(key, arr);
          return;
        }

        if (token.position === -1) {
          // In home base
          const basePos = HOME_BASE_POSITIONS[token.player][token.id];
          if (basePos) {
            const key = `${basePos[0]}-${basePos[1]}`;
            const arr = map.get(key) ?? [];
            arr.push({ token, playerIdx: pIdx });
            map.set(key, arr);
          }
          return;
        }

        const cell = tokenToCell(token);
        if (cell) {
          const key = `${cell[0]}-${cell[1]}`;
          const arr = map.get(key) ?? [];
          arr.push({ token, playerIdx: pIdx });
          map.set(key, arr);
        }
      });
    });

    return map;
  }, [players]);

  return (
    <div
      className="relative w-full aspect-square rounded-xl overflow-hidden"
      style={{ boxShadow: '0 0 40px rgba(0,243,255,0.2), inset 0 0 40px rgba(0,0,0,0.5)' }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: 'repeat(15, 1fr)',
          gridTemplateRows: 'repeat(15, 1fr)',
        }}
      >
        {Array.from({ length: 15 }, (_, row) =>
          Array.from({ length: 15 }, (_, col) => {
            const cell = CELL_MAP[row][col];
            const key = `${row}-${col}`;
            const tokensHere = tokensByCell.get(key) ?? [];

            return (
              <div
                key={key}
                className={clsx('relative flex items-center justify-center', getCellStyle(cell))}
              >
                {/* Safe star indicator */}
                {cell.type === 'safe' && (
                  <span className="absolute text-white/20 text-[0.5em] select-none pointer-events-none">★</span>
                )}

                {/* Centre triangle decoration */}
                {cell.type === 'centre' && (
                  <div className="w-full h-full opacity-80" />
                )}

                {/* Tokens */}
                <AnimatePresence>
                  {tokensHere.map(({ token }, slotIdx) => {
                    const isMovable =
                      phase === 'selecting' &&
                      token.player === activePlayer?.color &&
                      movableTokenIds.includes(token.id);
                    const isActive = token.player === activePlayer?.color;

                    // Offset when multiple tokens share a cell
                    const offsets = [
                      { top: '10%', left: '10%' },
                      { top: '10%', left: '55%' },
                      { top: '55%', left: '10%' },
                      { top: '55%', left: '55%' },
                    ];
                    const offset = tokensHere.length > 1 ? offsets[slotIdx % 4] : undefined;
                    const tokenStyle = offset
                      ? { top: offset.top, left: offset.left, width: '40%', height: '40%' }
                      : undefined;

                    return (
                      <TokenDot
                        key={`${token.player}-${token.id}`}
                        token={token}
                        isMovable={isMovable}
                        isActive={isActive}
                        onClick={() => onTokenClick(token.id)}
                        style={tokenStyle}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          }),
        )}
      </div>

      {/* Home area decorations — coloured circles for token slots */}
      {(['red', 'blue', 'green', 'yellow'] as PlayerColor[]).map((color) => (
        <HomeBaseDecoration key={color} color={color} />
      ))}
    </div>
  );
}

/** Decorative ring inside each home base area */
function HomeBaseDecoration({ color }: { color: PlayerColor }) {
  const { primary } = PLAYER_COLORS[color];
  const positions: Record<PlayerColor, { top: string; left: string; size: string }> = {
    red:    { top: '3%',  left: '3%',  size: '31%' },
    blue:   { top: '3%',  left: '63%', size: '31%' },
    green:  { top: '63%', left: '63%', size: '31%' },
    yellow: { top: '63%', left: '3%',  size: '31%' },
  };
  const pos = positions[color];

  return (
    <div
      className="absolute rounded-xl pointer-events-none"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.size,
        height: pos.size,
        border: `2px solid ${primary}40`,
        boxShadow: `inset 0 0 20px ${primary}15`,
      }}
    />
  );
}

