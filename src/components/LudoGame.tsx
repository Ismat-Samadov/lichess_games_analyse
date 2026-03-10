'use client';
/**
 * LudoGame — top-level game component.
 * Composes board, dice, player cards, overlays, and wires up all interactions.
 */
import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import LudoBoard from './LudoBoard';
import Dice from './Dice';
import PlayerCard from './PlayerCard';
import WinScreen from './WinScreen';
import SetupScreen from './SetupScreen';
import { PLAYER_COLORS } from '@/lib/constants';
import clsx from 'clsx';

export default function LudoGame() {
  const { play, enabled: soundEnabled, setEnabled: setSoundEnabled } = useSound();

  const { state, startGame, rollDice, selectToken, pause, resume, restart } =
    useGameState((sound) => play(sound as Parameters<typeof play>[0]));

  const { phase, players, activePlayerIndex, diceValue, isRolling, winner, movableTokenIds, roundNumber, lastCapture } = state;

  const activePlayer = players[activePlayerIndex];
  const isHumanTurn = activePlayer?.isAI === false;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'rolling' && isHumanTurn) rollDice();
      }
      if (e.key === 'Escape') {
        if (phase === 'paused') resume();
        else pause();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, isHumanTurn, rollDice, pause, resume]);

  const handleTokenClick = useCallback(
    (tokenId: number) => {
      if (phase === 'selecting' && isHumanTurn) {
        selectToken(tokenId);
      }
    },
    [phase, isHumanTurn, selectToken],
  );

  if (phase === 'setup') {
    return <SetupScreen onStart={startGame} />;
  }

  const activeColor = activePlayer?.color ?? 'red';
  const { primary: activePrimary, neon: activeNeon } = PLAYER_COLORS[activeColor];

  return (
    <div
      className="min-h-screen bg-[#050510] flex flex-col items-center justify-start py-4 px-3 relative overflow-hidden no-select"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,243,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-widest uppercase"
            style={{
              background: 'linear-gradient(90deg, #ff2d55, #bf00ff, #00f3ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px #00f3ff50)',
            }}>
            LUDO
          </h1>
          <span className="text-white/20 text-xs font-mono hidden sm:inline">
            Round {roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Capture notification */}
          <AnimatePresence>
            {lastCapture && (
              <motion.span
                key={`${lastCapture.by}-${lastCapture.victim}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-bold"
                style={{ color: PLAYER_COLORS[lastCapture.by].primary }}
              >
                💥 Captured!
              </motion.span>
            )}
          </AnimatePresence>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white/40 hover:text-white/80 transition-colors text-lg px-1"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Pause */}
          <button
            onClick={phase === 'paused' ? resume : pause}
            className="text-white/40 hover:text-white/80 transition-colors text-sm px-2 py-1 rounded border border-white/10"
          >
            {phase === 'paused' ? '▶ Resume' : '⏸ Pause'}
          </button>

          {/* Restart */}
          <button
            onClick={restart}
            className="text-white/30 hover:text-white/70 transition-colors text-sm px-2 py-1 rounded border border-white/10"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row gap-4 items-start justify-center">
        {/* Left panel: players 1 & 4 */}
        <div className="hidden lg:flex flex-col gap-3 w-40 shrink-0 pt-2">
          {players.slice(0, 2).map((p, i) => (
            <PlayerCard
              key={p.color}
              player={p}
              isActive={activePlayerIndex === i}
              isWinner={winner === p.color}
            />
          ))}
        </div>

        {/* Board */}
        <div className="relative flex-1 min-w-0 max-w-[min(90vw,90vh,560px)] w-full mx-auto">
          <LudoBoard
            players={players}
            activePlayerIndex={activePlayerIndex}
            movableTokenIds={phase === 'selecting' && isHumanTurn ? movableTokenIds : []}
            onTokenClick={handleTokenClick}
            phase={phase}
          />

          {/* Pause overlay */}
          <AnimatePresence>
            {phase === 'paused' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-40"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">⏸</div>
                  <div className="text-white/60 text-sm mb-4 font-mono uppercase tracking-widest">Paused</div>
                  <button
                    onClick={resume}
                    className="px-6 py-2 rounded-lg text-sm font-bold"
                    style={{ background: activePrimary, color: '#000' }}
                  >
                    Resume
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Win screen */}
          <AnimatePresence>
            {phase === 'gameover' && winner && (
              <WinScreen winner={winner} players={players} onRestart={restart} />
            )}
          </AnimatePresence>
        </div>

        {/* Right panel: players 3 & 2 */}
        <div className="hidden lg:flex flex-col gap-3 w-40 shrink-0 pt-2">
          {players.slice(2).map((p, i) => (
            <PlayerCard
              key={p.color}
              player={p}
              isActive={activePlayerIndex === i + 2}
              isWinner={winner === p.color}
            />
          ))}
        </div>
      </div>

      {/* Bottom panel (mobile player cards + dice) */}
      <div className="relative z-10 w-full max-w-4xl mt-4">
        {/* Mobile: player cards row */}
        <div className="flex lg:hidden gap-2 mb-3 overflow-x-auto pb-1">
          {players.map((p, i) => (
            <div key={p.color} className="shrink-0 w-36">
              <PlayerCard
                player={p}
                isActive={activePlayerIndex === i}
                isWinner={winner === p.color}
              />
            </div>
          ))}
        </div>

        {/* Dice + turn info */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-4"
          style={{
            background: 'rgba(10,10,31,0.9)',
            border: `1px solid ${activePrimary}40`,
            boxShadow: `0 0 20px ${activeNeon}15`,
          }}
        >
          {/* Turn indicator */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="text-xs text-white/30 font-mono uppercase tracking-widest">
              {phase === 'selecting' && isHumanTurn
                ? 'Select a token'
                : isHumanTurn
                ? 'Your turn'
                : `${activePlayer?.name}'s turn`}
            </div>
            <div className="text-lg font-black" style={{ color: activePrimary }}>
              {activePlayer?.name}
            </div>
            {diceValue !== null && (
              <div className="text-xs text-white/30 font-mono">
                Rolled: <span style={{ color: activePrimary }}>{diceValue}</span>
                {diceValue === 6 && (
                  <span className="text-yellow-400 ml-1">+1 turn!</span>
                )}
              </div>
            )}
          </div>

          {/* Dice */}
          <div className="shrink-0">
            <Dice
              value={diceValue}
              isRolling={isRolling || phase === 'animating'}
              canRoll={phase === 'rolling' && isHumanTurn}
              onRoll={rollDice}
              color={activePrimary}
            />
          </div>

          {/* Move hint for human */}
          <div className="text-right min-w-0">
            {phase === 'selecting' && isHumanTurn && movableTokenIds.length > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-xs text-white/50 font-mono"
              >
                {movableTokenIds.length} token{movableTokenIds.length > 1 ? 's' : ''}
                <br />
                <span style={{ color: activePrimary }}>can move</span>
              </motion.div>
            )}
            <div className="text-[10px] text-white/20 font-mono mt-1">
              Space/Enter to roll
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
