'use client';
/**
 * Game setup / main menu screen.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameConfig, Difficulty } from '@/types/game';

interface SetupScreenProps {
  onStart: (config: GameConfig) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [playerName, setPlayerName] = useState('Player 1');

  const handleStart = () => {
    onStart({ playerCount, difficulty, playerName: playerName.trim() || 'Player 1' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050510] p-4">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,243,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl font-black tracking-widest uppercase"
            style={{
              background: 'linear-gradient(90deg, #ff2d55, #bf00ff, #00f3ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 20px #00f3ff80)',
            }}
          >
            LUDO
          </motion.h1>
          <p className="text-white/30 text-xs tracking-[0.3em] mt-1 uppercase font-mono">
            Neon Edition
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: 'rgba(10,10,31,0.95)',
            border: '1px solid rgba(0,243,255,0.2)',
            boxShadow: '0 0 40px rgba(0,243,255,0.1)',
          }}
        >
          {/* Player name */}
          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">
              Your Name
            </label>
            <input
              type="text"
              maxLength={16}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f3ff] transition-colors"
              placeholder="Enter name…"
            />
          </div>

          {/* Players */}
          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">
              Players
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className="py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: playerCount === n ? '#00f3ff20' : 'transparent',
                    border: `1px solid ${playerCount === n ? '#00f3ff' : 'rgba(255,255,255,0.1)'}`,
                    color: playerCount === n ? '#00f3ff' : 'rgba(255,255,255,0.5)',
                    boxShadow: playerCount === n ? '0 0 10px #00f3ff40' : 'none',
                  }}
                >
                  {n} Players
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty */}
          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">
              AI Difficulty
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['easy', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="py-2 rounded-lg text-sm font-bold transition-all capitalize"
                  style={{
                    background: difficulty === d ? (d === 'hard' ? '#ff2d5520' : '#39ff1420') : 'transparent',
                    border: `1px solid ${difficulty === d ? (d === 'hard' ? '#ff2d55' : '#39ff14') : 'rgba(255,255,255,0.1)'}`,
                    color: difficulty === d ? (d === 'hard' ? '#ff2d55' : '#39ff14') : 'rgba(255,255,255,0.5)',
                    boxShadow: difficulty === d ? `0 0 10px ${d === 'hard' ? '#ff2d5540' : '#39ff1440'}` : 'none',
                  }}
                >
                  {d === 'easy' ? '🤖 Easy' : '⚡ Hard'}
                </button>
              ))}
            </div>
          </div>

          {/* Player legend */}
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { color: '#ff2d55', label: 'You (Red)' },
              { color: '#00f3ff', label: 'Blue AI' },
              ...(playerCount >= 3 ? [{ color: '#39ff14', label: 'Green AI' }] : []),
              ...(playerCount >= 4 ? [{ color: '#fff700', label: 'Yellow AI' }] : []),
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                />
                <span className="text-white/40 text-[11px] font-mono">{label}</span>
              </div>
            ))}
          </div>

          {/* Start button */}
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff2d55, #bf00ff, #00f3ff)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(0,243,255,0.4)',
            }}
          >
            Start Game
          </motion.button>
        </div>

        {/* Controls hint */}
        <p className="text-center text-white/20 text-xs mt-4 font-mono">
          Click tokens to move · Space to roll dice
        </p>
      </motion.div>
    </div>
  );
}
