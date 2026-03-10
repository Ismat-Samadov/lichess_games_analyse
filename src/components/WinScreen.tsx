'use client';
/**
 * Victory / Game Over overlay with animation.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { PlayerColor, Player } from '@/types/game';
import { PLAYER_COLORS } from '@/lib/constants';

interface WinScreenProps {
  winner: PlayerColor;
  players: Player[];
  onRestart: () => void;
}

const CONFETTI_COLORS = ['#ff2d55', '#00f3ff', '#39ff14', '#fff700', '#bf00ff'];

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: `${Math.random() * 100}%`,
            top: -10,
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default function WinScreen({ winner, players, onRestart }: WinScreenProps) {
  const { primary, neon } = PLAYER_COLORS[winner];
  const winnerPlayer = players.find((p) => p.color === winner);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <Confetti />

      <motion.div
        initial={{ scale: 0.5, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 rounded-2xl p-8 text-center max-w-xs w-full mx-4"
        style={{
          background: '#0a0a1f',
          border: `2px solid ${primary}`,
          boxShadow: `0 0 40px ${neon}60`,
        }}
      >
        {/* Trophy */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4 select-none"
        >
          🏆
        </motion.div>

        <motion.h2
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-3xl font-black mb-2 uppercase tracking-widest"
          style={{ color: primary, textShadow: `0 0 20px ${neon}` }}
        >
          {winnerPlayer?.color === 'red' && !winnerPlayer?.isAI ? 'You Win!' : `${winnerPlayer?.name} Wins!`}
        </motion.h2>

        <p className="text-white/50 text-sm mb-6">All 4 tokens reached home</p>

        {/* Ranking */}
        <div className="mb-6 space-y-1">
          {players
            .sort((a, b) => {
              const aFinished = a.tokens.filter((t) => t.position === 57).length;
              const bFinished = b.tokens.filter((t) => t.position === 57).length;
              return bFinished - aFinished;
            })
            .map((p, i) => {
              const { primary: pc } = PLAYER_COLORS[p.color];
              const finished = p.tokens.filter((t) => t.position === 57).length;
              const medals = ['🥇', '🥈', '🥉', '4️⃣'];
              return (
                <div key={p.color} className="flex items-center justify-between px-2 text-sm">
                  <span className="text-white/60">
                    {medals[i]} <span style={{ color: pc }}>{p.name}</span>
                  </span>
                  <span className="text-white/40 font-mono">{finished}/4</span>
                </div>
              );
            })}
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
          style={{
            background: primary,
            color: '#000',
            boxShadow: `0 0 16px ${neon}80`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 24px ${neon}`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 16px ${neon}80`)}
        >
          Play Again
        </button>
      </motion.div>
    </motion.div>
  );
}
