'use client';
/**
 * PlayerCard — shows player name, colour, token status, and turn indicator.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@/types/game';
import { PLAYER_COLORS, FINISHED_POSITION } from '@/lib/constants';
import clsx from 'clsx';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isWinner: boolean;
}

export default function PlayerCard({ player, isActive, isWinner }: PlayerCardProps) {
  const { primary, neon } = PLAYER_COLORS[player.color];

  const finished = player.tokens.filter((t) => t.position === FINISHED_POSITION).length;
  const onBoard  = player.tokens.filter((t) => t.position >= 0 && t.position < FINISHED_POSITION).length;
  const inBase   = player.tokens.filter((t) => t.position === -1).length;

  return (
    <motion.div
      animate={isActive ? { borderColor: primary, boxShadow: `0 0 12px ${neon}40` } : {}}
      className={clsx(
        'rounded-xl p-3 border transition-all duration-300',
        isActive ? 'bg-white/5' : 'bg-white/2 opacity-70',
        isWinner ? 'border-yellow-400' : 'border-white/10',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Colour swatch */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: primary, boxShadow: `0 0 6px ${neon}` }}
          />
          <span className="text-sm font-bold text-white/90 truncate max-w-[80px]">
            {player.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {player.isAI && (
            <span className="text-[10px] text-white/40 font-mono">
              {player.difficulty === 'hard' ? '⚡AI' : '🤖AI'}
            </span>
          )}
          {isActive && !isWinner && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-2 rounded-full"
              style={{ background: primary }}
            />
          )}
          {isWinner && <span className="text-yellow-400 text-sm">👑</span>}
        </div>
      </div>

      {/* Token status pips */}
      <div className="flex gap-1 flex-wrap">
        {player.tokens.map((token) => {
          const isFinished = token.position === FINISHED_POSITION;
          const isOnBoard  = token.position >= 0 && !isFinished;
          const isInBase   = token.position === -1;
          return (
            <div
              key={token.id}
              className="w-5 h-5 rounded-full border flex items-center justify-center"
              style={{
                borderColor: primary,
                background: isFinished ? primary : isOnBoard ? `${primary}60` : 'transparent',
                boxShadow: isFinished ? `0 0 6px ${neon}` : 'none',
              }}
            >
              <span className="text-[8px] font-black text-black/80 select-none">
                {isFinished ? '✓' : isOnBoard ? token.id + 1 : '·'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: primary }}
          animate={{ width: `${(finished / 4) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="text-[10px] text-white/30 mt-1 font-mono">
        {finished}/4 home · {onBoard} active · {inBase} waiting
      </div>
    </motion.div>
  );
}
