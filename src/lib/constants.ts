import { PlayerColor } from '@/types/game';

/** The 15×15 board grid cell size in pixels (will be scaled via CSS) */
export const CELL_COUNT = 15;

/**
 * The 52-cell main path expressed as [row, col] pairs on a 15×15 grid.
 * Traversed clockwise; index 0 is Red's entry square.
 */
export const MAIN_PATH: [number, number][] = [
  // ─── left upward leg (Red enters here) ───────────────────────────────
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],   // 0-4  (row 6 rightward to col 5)
  // ─── top downward leg ──────────────────────────────────────────────
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],   // 5-10
  [0, 7],                                              // 11  (top-centre)
  [0, 8],                                              // 12
  // ─── Blue enters here ──────────────────────────────────────────────
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],   // 13-17
  // ─── right downward leg ─────────────────────────────────────────────
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],  // 18-23
  [7, 14],                                                 // 24  (right-centre)
  [8, 14],                                                 // 25
  // ─── Green enters here ──────────────────────────────────────────────
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],  // 26-30
  // ─── bottom upward leg ──────────────────────────────────────────────
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],  // 31-36
  [14, 7],                                                 // 37 (bottom-centre)
  [14, 6],                                                 // 38
  // ─── Yellow enters here ─────────────────────────────────────────────
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],  // 39-43
  // ─── left upward leg (return) ───────────────────────────────────────
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],  // 44-49
  [7, 0],                                              // 50 (left-centre)
  [6, 0],                                              // 51
];

/**
 * Home column: 5 cells each player travels through before reaching centre.
 * Index 0 = first cell entered, index 4 = last before centre.
 */
export const HOME_COLUMNS: Record<PlayerColor, [number, number][]> = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5]],
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7]],
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7]],
};

/** Centre finishing cell */
export const CENTRE_CELL: [number, number] = [7, 7];

/** Where tokens sit when still in the home base (4 per player) */
export const HOME_BASE_POSITIONS: Record<PlayerColor, [number, number][]> = {
  red:    [[1,1],[1,3],[3,1],[3,3]],
  blue:   [[1,11],[1,13],[3,11],[3,13]],
  green:  [[11,11],[11,13],[13,11],[13,13]],
  yellow: [[11,1],[11,3],[13,1],[13,3]],
};

/**
 * Which absolute MAIN_PATH index each player enters from.
 * Token position 0 = their own entry square = MAIN_PATH[PLAYER_ENTRY[color]].
 */
export const PLAYER_ENTRY: Record<PlayerColor, number> = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

/**
 * Absolute MAIN_PATH indices that are "safe" squares (star/shield cells).
 * Tokens on these cannot be captured.
 */
export const SAFE_SQUARES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

/** Neon-themed colours for each player */
export const PLAYER_COLORS: Record<PlayerColor, {
  primary: string;
  bg: string;
  home: string;
  neon: string;
  text: string;
}> = {
  red:    { primary: '#ff2d55', bg: '#2d0a12', home: '#ff2d5520', neon: '#ff2d55', text: 'text-[#ff2d55]' },
  blue:   { primary: '#00f3ff', bg: '#001a1f', home: '#00f3ff20', neon: '#00f3ff', text: 'text-[#00f3ff]' },
  green:  { primary: '#39ff14', bg: '#0d2000', home: '#39ff1420', neon: '#39ff14', text: 'text-[#39ff14]' },
  yellow: { primary: '#fff700', bg: '#202000', home: '#fff70020', neon: '#fff700', text: 'text-[#fff700]' },
};

/** Order players appear / take turns */
export const PLAYER_ORDER: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

/** Number of turns to wait (skip) for rolling 3 sixes in a row */
export const TRIPLE_SIX_PENALTY = true;

/** Home column length */
export const HOME_COL_LENGTH = 5;

/** Finished position index */
export const FINISHED_POSITION = 57;
