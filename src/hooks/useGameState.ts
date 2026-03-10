'use client';
/**
 * Central game state hook using useReducer.
 * Handles all transitions: rolling, selecting a token, AI turns, win detection.
 */
import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  GameConfig,
  PlayerColor,
} from '@/types/game';
import {
  rollDice,
  getMovableTokenIds,
  applyMove,
  resolveCaptures,
  checkWinner,
  nextPlayerIndex,
  buildPlayers,
  finishedCount,
} from '@/lib/gameLogic';
import { chooseAIMove } from '@/lib/aiLogic';
import { PLAYER_ORDER, FINISHED_POSITION } from '@/lib/constants';

// ─── Action types ────────────────────────────────────────────────────────────
type Action =
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'ROLL_DICE' }
  | { type: 'DICE_RESULT'; value: number }
  | { type: 'SELECT_TOKEN'; tokenId: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' };

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_STATE: GameState = {
  players: [],
  activePlayerIndex: 0,
  diceValue: null,
  isRolling: false,
  phase: 'setup',
  winner: null,
  consecutiveSixes: 0,
  movableTokenIds: [],
  roundNumber: 1,
  lastCapture: null,
  prePhase: null,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { playerCount, difficulty, playerName } = action.config;
      const colors = PLAYER_ORDER.slice(0, playerCount) as PlayerColor[];
      const aiColors = colors.filter((c) => c !== 'red');
      const players = buildPlayers(colors, aiColors, difficulty, playerName);
      return {
        ...INITIAL_STATE,
        players,
        phase: 'rolling',
      };
    }

    case 'ROLL_DICE': {
      if (state.phase !== 'rolling') return state;
      return { ...state, isRolling: true, phase: 'animating' };
    }

    case 'DICE_RESULT': {
      const { value } = action;
      const player = state.players[state.activePlayerIndex];
      const movable = getMovableTokenIds(player, value);

      // Triple six penalty — forfeit turn
      const newConsec = value === 6 ? state.consecutiveSixes + 1 : 0;
      if (newConsec >= 3) {
        const nextIdx = nextPlayerIndex(
          state.activePlayerIndex,
          state.players,
          state.players.length,
        );
        return {
          ...state,
          diceValue: value,
          isRolling: false,
          consecutiveSixes: 0,
          movableTokenIds: [],
          activePlayerIndex: nextIdx,
          phase: 'rolling',
          lastCapture: null,
        };
      }

      if (movable.length === 0) {
        // No valid moves — pass turn (unless rolled 6 which still ends with pass)
        const nextIdx = nextPlayerIndex(
          state.activePlayerIndex,
          state.players,
          state.players.length,
        );
        return {
          ...state,
          diceValue: value,
          isRolling: false,
          consecutiveSixes: value === 6 ? newConsec : 0,
          movableTokenIds: [],
          activePlayerIndex: nextIdx,
          phase: 'rolling',
          lastCapture: null,
        };
      }

      // Exactly one movable token — auto-select
      if (movable.length === 1 && player.isAI === false && value !== 6) {
        // Still let the player confirm even with 1 option (better UX)
      }

      return {
        ...state,
        diceValue: value,
        isRolling: false,
        consecutiveSixes: newConsec,
        movableTokenIds: movable,
        phase: 'selecting',
        lastCapture: null,
      };
    }

    case 'SELECT_TOKEN': {
      if (state.phase !== 'selecting') return state;
      const { tokenId } = action;
      if (!state.movableTokenIds.includes(tokenId)) return state;

      const player = state.players[state.activePlayerIndex];
      const token = player.tokens[tokenId];
      const diceValue = state.diceValue!;

      // Apply move
      const movedToken = applyMove(token, diceValue);

      // Update this player's tokens
      const updatedTokens = player.tokens.map((t) =>
        t.id === tokenId ? movedToken : t,
      );
      const updatedPlayer = { ...player, tokens: updatedTokens };
      let updatedPlayers = state.players.map((p) =>
        p.color === player.color ? updatedPlayer : p,
      );

      // Resolve captures
      const { players: afterCapture, captured } = resolveCaptures(
        updatedPlayers,
        movedToken,
      );
      updatedPlayers = afterCapture;

      // Check win
      const winner = checkWinner(updatedPlayers);
      if (winner) {
        return { ...state, players: updatedPlayers, winner, phase: 'gameover' };
      }

      // Determine next state
      const rolledSix = diceValue === 6;
      const enteredHome = movedToken.position === FINISHED_POSITION;
      const getExtraTurn = rolledSix || (captured && !enteredHome);

      const lastCapture = captured
        ? { by: player.color, victim: getVictimColor(updatedPlayers, state.players, player.color) ?? player.color }
        : null;

      if (getExtraTurn) {
        return {
          ...state,
          players: updatedPlayers,
          diceValue: null,
          movableTokenIds: [],
          phase: 'rolling',
          lastCapture,
          roundNumber: state.roundNumber,
        };
      }

      const nextIdx = nextPlayerIndex(
        state.activePlayerIndex,
        updatedPlayers,
        updatedPlayers.length,
      );

      return {
        ...state,
        players: updatedPlayers,
        diceValue: null,
        movableTokenIds: [],
        activePlayerIndex: nextIdx,
        consecutiveSixes: 0,
        phase: 'rolling',
        lastCapture,
        roundNumber: state.activePlayerIndex === updatedPlayers.length - 1
          ? state.roundNumber + 1
          : state.roundNumber,
      };
    }

    case 'PAUSE':
      if (state.phase === 'gameover' || state.phase === 'setup') return state;
      return { ...state, prePhase: state.phase, phase: 'paused' };

    case 'RESUME':
      if (state.phase !== 'paused') return state;
      return { ...state, phase: state.prePhase ?? 'rolling', prePhase: null };

    case 'RESTART':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

/** Helper: find whose token was just captured */
function getVictimColor(
  after: typeof INITIAL_STATE['players'],
  before: typeof INITIAL_STATE['players'],
  mover: PlayerColor,
): PlayerColor | null {
  for (const p of after) {
    if (p.color === mover) continue;
    const beforeP = before.find((b) => b.color === p.color)!;
    for (const t of p.tokens) {
      const beforeT = beforeP.tokens.find((bt) => bt.id === t.id)!;
      if (beforeT.position !== -1 && t.position === -1) return p.color;
    }
  }
  return null;
}

// ─── Public hook ─────────────────────────────────────────────────────────────
export function useGameState(onSound?: (s: string) => void) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback((config: GameConfig) => {
    dispatch({ type: 'START_GAME', config });
  }, []);

  const rollDiceAction = useCallback(() => {
    if (state.phase !== 'rolling') return;
    dispatch({ type: 'ROLL_DICE' });
    onSound?.('roll');

    // Simulate rolling animation then set result
    setTimeout(() => {
      const val = rollDice();
      dispatch({ type: 'DICE_RESULT', value: val });
    }, 700);
  }, [state.phase, onSound]);

  const selectToken = useCallback(
    (tokenId: number) => {
      if (state.phase !== 'selecting') return;
      onSound?.('move');
      dispatch({ type: 'SELECT_TOKEN', tokenId });
    },
    [state.phase, onSound],
  );

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  // ── AI turn automation ──────────────────────────────────────────────────────
  useEffect(() => {
    const player = state.players[state.activePlayerIndex];
    if (!player?.isAI) return;

    if (state.phase === 'rolling') {
      aiTimerRef.current = setTimeout(() => {
        dispatch({ type: 'ROLL_DICE' });
        onSound?.('roll');
        setTimeout(() => {
          const val = rollDice();
          dispatch({ type: 'DICE_RESULT', value: val });
        }, 700);
      }, 900);
    }

    if (state.phase === 'selecting') {
      const tokenId = chooseAIMove(
        player,
        state.diceValue!,
        state.players,
        player.difficulty ?? 'easy',
      );
      aiTimerRef.current = setTimeout(() => {
        if (tokenId >= 0) {
          onSound?.('move');
          dispatch({ type: 'SELECT_TOKEN', tokenId });
        }
      }, 600);
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [state.phase, state.activePlayerIndex, state.players, state.diceValue, onSound]);

  return {
    state,
    startGame,
    rollDice: rollDiceAction,
    selectToken,
    pause,
    resume,
    restart,
  };
}
