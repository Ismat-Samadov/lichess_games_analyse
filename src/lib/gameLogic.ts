/**
 * Core Ludo game logic — pure functions, no side effects.
 */
import {
  GameState,
  Token,
  Player,
  PlayerColor,
} from '@/types/game';
import {
  MAIN_PATH,
  HOME_COLUMNS,
  PLAYER_ENTRY,
  SAFE_SQUARES,
  HOME_COL_LENGTH,
  FINISHED_POSITION,
  PLAYER_ORDER,
} from './constants';

/** Roll a fair six-sided die */
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Convert a token's relative position to absolute board cell [row, col].
 * Returns null if the token is still in the home base (position === -1).
 */
export function tokenToCell(
  token: Token,
): [number, number] | null {
  const { position, player } = token;

  if (position === -1) return null; // in base
  if (position === FINISHED_POSITION) return [7, 7]; // centre

  const entryOffset = PLAYER_ENTRY[player];

  if (position <= 51) {
    // On the main path
    const absIdx = (entryOffset + position) % 52;
    return MAIN_PATH[absIdx];
  }

  // In home column (positions 52-56)
  const homeStep = position - 52; // 0-4
  const homeCol = HOME_COLUMNS[player];
  return homeCol[homeStep] ?? null;
}

/**
 * Return the absolute MAIN_PATH index for a token currently on the main path.
 * Returns -1 if the token is not on the main path (in base, home col, or finished).
 */
export function absPathIndex(token: Token): number {
  if (token.position < 0 || token.position > 51) return -1;
  return (PLAYER_ENTRY[token.player] + token.position) % 52;
}

/**
 * Determine which of the active player's tokens can legally move
 * given a dice roll value.
 */
export function getMovableTokenIds(
  player: Player,
  diceValue: number,
): number[] {
  return player.tokens
    .filter((token) => canMove(token, diceValue))
    .map((t) => t.id);
}

/** Can a single token move with this dice value? */
function canMove(token: Token, diceValue: number): boolean {
  const { position } = token;

  // Already finished
  if (position === FINISHED_POSITION) return false;

  // Still in base — needs a 6 to enter
  if (position === -1) return diceValue === 6;

  // In home column — can't overshoot the end
  if (position >= 52) {
    const newPos = position + diceValue;
    return newPos <= FINISHED_POSITION;
  }

  // On main path — always movable (can enter home column correctly)
  return true;
}

/**
 * Apply a dice move to a token.
 * Returns a NEW token object (immutable).
 * Does NOT handle captures; caller must do that afterwards.
 */
export function applyMove(token: Token, diceValue: number): Token {
  const { position, player } = token;

  if (position === -1 && diceValue === 6) {
    // Enter the main path
    return { ...token, position: 0 };
  }

  if (position >= 0 && position <= 51) {
    const newPos = position + diceValue;

    if (newPos > 51) {
      // Would enter home column
      const homeSteps = newPos - 51 - 1; // steps into home column (0-indexed)
      const homePos = 52 + homeSteps;

      if (homePos > FINISHED_POSITION) {
        // Overshoot — this move should not have been allowed
        return token;
      }
      return { ...token, position: homePos };
    }

    return { ...token, position: newPos };
  }

  // In home column
  const newPos = position + diceValue;
  if (newPos > FINISHED_POSITION) return token; // overshoot guard
  return { ...token, position: newPos };
}

/**
 * After a token moves, check if it landed on opponent tokens and send them home.
 * Returns updated players array.
 * No captures in the home column or on safe squares.
 */
export function resolveCaptures(
  players: Player[],
  movedToken: Token,
): { players: Player[]; captured: boolean } {
  const { position, player: mover } = movedToken;

  // Can't capture in home column, base, or at finish
  if (position < 0 || position >= 52) {
    return { players, captured: false };
  }

  const absIdx = absPathIndex(movedToken);
  if (SAFE_SQUARES.has(absIdx)) {
    return { players, captured: false };
  }

  let captured = false;

  const updated = players.map((p) => {
    if (p.color === mover) return p; // skip own player

    const updatedTokens = p.tokens.map((t) => {
      if (t.position < 0 || t.position >= 52) return t; // skip finished/home-col tokens
      const tAbs = absPathIndex(t);
      if (tAbs === absIdx) {
        captured = true;
        return { ...t, position: -1 }; // send back to base
      }
      return t;
    });

    return { ...p, tokens: updatedTokens };
  });

  return { players: updated, captured };
}

/** Has this player won (all 4 tokens at finished position)? */
export function isWinner(player: Player): boolean {
  return player.tokens.every((t) => t.position === FINISHED_POSITION);
}

/** Check all players and return the winning color, or null. */
export function checkWinner(players: Player[]): PlayerColor | null {
  for (const p of players) {
    if (isWinner(p)) return p.color;
  }
  return null;
}

/** Get the next active player index (skip players with 0 active options — they still roll). */
export function nextPlayerIndex(
  current: number,
  players: Player[],
  activeCount: number,
): number {
  const total = players.length;
  let next = (current + 1) % total;
  // Skip players whose colour isn't in the game (for 2/3 player mode)
  // — they are excluded at setup, so all players[] are active.
  return next % activeCount;
}

/**
 * Build fresh players array for a new game.
 */
export function buildPlayers(
  colors: PlayerColor[],
  aiColors: PlayerColor[],
  difficulty: import('@/types/game').Difficulty,
  playerName: string,
): Player[] {
  return colors.map((color) => ({
    color,
    name: color === 'red' ? playerName : color.charAt(0).toUpperCase() + color.slice(1) + ' AI',
    isAI: aiColors.includes(color),
    difficulty: aiColors.includes(color) ? difficulty : undefined,
    tokens: [0, 1, 2, 3].map((id) => ({ id, player: color, position: -1 })),
  }));
}

/** Number of tokens a player has finished */
export function finishedCount(player: Player): number {
  return player.tokens.filter((t) => t.position === FINISHED_POSITION).length;
}

/** Count tokens on the board (not in base, not finished) */
export function activeTokenCount(player: Player): number {
  return player.tokens.filter((t) => t.position >= 0 && t.position < FINISHED_POSITION).length;
}
