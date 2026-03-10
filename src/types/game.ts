/** All core TypeScript types for the Ludo game */

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';
export type TokenState = 'home' | 'active' | 'finished';
export type GamePhase = 'setup' | 'rolling' | 'animating' | 'selecting' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'hard';

/** A single token belonging to a player */
export interface Token {
  /** 0-3 index within the player */
  id: number;
  player: PlayerColor;
  /**
   * Position along the path:
   *  -1   = in home base (not yet entered the board)
   *  0-51 = on the main 52-cell path (relative to that player's entry)
   *  52-56 = in the home column (5 cells)
   *  57   = finished (in the centre)
   */
  position: number;
}

export interface Player {
  color: PlayerColor;
  name: string;
  isAI: boolean;
  difficulty?: Difficulty;
  tokens: Token[];
}

export interface GameConfig {
  playerCount: 2 | 3 | 4;
  difficulty: Difficulty;
  playerName: string;
}

export interface GameState {
  players: Player[];
  activePlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  phase: GamePhase;
  winner: PlayerColor | null;
  consecutiveSixes: number;
  /** token ids (0-3) of the active player that can legally move */
  movableTokenIds: number[];
  roundNumber: number;
  lastCapture: { by: PlayerColor; victim: PlayerColor } | null;
  prePhase: GamePhase | null;
}
