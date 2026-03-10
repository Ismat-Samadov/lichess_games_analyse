/**
 * AI decision-making for Ludo.
 * Easy: random valid move.
 * Hard: prioritised heuristic (capture > enter board > advance furthest from home > progress).
 */
import { Player, Token, Difficulty } from '@/types/game';
import { applyMove, absPathIndex, getMovableTokenIds } from './gameLogic';
import { SAFE_SQUARES, FINISHED_POSITION } from './constants';

/** Score a potential move for heuristic AI */
function scoreMoveHard(
  token: Token,
  diceValue: number,
  allPlayers: Player[],
): number {
  const moved = applyMove(token, diceValue);
  let score = 0;

  // Huge bonus for finishing a token
  if (moved.position === FINISHED_POSITION) return 1000;

  // Bonus for entering home column
  if (moved.position >= 52) score += 50;

  // Bonus for entering from base
  if (token.position === -1) score += 30;

  // Bonus for capturing an opponent
  if (moved.position >= 0 && moved.position <= 51) {
    const movedAbs = absPathIndex(moved);
    if (!SAFE_SQUARES.has(movedAbs)) {
      for (const p of allPlayers) {
        if (p.color === token.player) continue;
        for (const t of p.tokens) {
          if (t.position < 0 || t.position >= 52) continue;
          const tAbs = absPathIndex(t);
          if (tAbs === movedAbs) score += 80;
        }
      }
    }
  }

  // Prefer advancing tokens that are further along
  score += moved.position * 0.5;

  // Small randomness to avoid always picking the same token
  score += Math.random() * 5;

  return score;
}

/** Pick the best token id to move given a dice value */
export function chooseAIMove(
  player: Player,
  diceValue: number,
  allPlayers: Player[],
  difficulty: Difficulty,
): number {
  const movable = getMovableTokenIds(player, diceValue);

  if (movable.length === 0) return -1;
  if (movable.length === 1) return movable[0];

  if (difficulty === 'easy') {
    // Random choice
    return movable[Math.floor(Math.random() * movable.length)];
  }

  // Hard: score each option and pick best
  let bestId = movable[0];
  let bestScore = -Infinity;

  for (const id of movable) {
    const token = player.tokens[id];
    const s = scoreMoveHard(token, diceValue, allPlayers);
    if (s > bestScore) {
      bestScore = s;
      bestId = id;
    }
  }

  return bestId;
}
