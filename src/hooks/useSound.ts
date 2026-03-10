'use client';
/**
 * Sound effects using the Web Audio API — no external files needed.
 */
import { useCallback, useRef, useState } from 'react';

type SoundType = 'roll' | 'move' | 'capture' | 'win' | 'enter' | 'home';

export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  /** Lazily create AudioContext on first use (browser requires user gesture) */
  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = 'square',
      gain = 0.15,
      startDelay = 0,
    ) => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startDelay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + startDelay + duration,
      );

      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    },
    [enabled, getCtx],
  );

  const play = useCallback(
    (sound: SoundType) => {
      switch (sound) {
        case 'roll':
          // Rapid high-pitched clicks
          for (let i = 0; i < 6; i++) {
            playTone(800 + i * 80, 0.05, 'square', 0.1, i * 0.04);
          }
          break;

        case 'move':
          playTone(440, 0.1, 'sine', 0.15);
          playTone(550, 0.1, 'sine', 0.1, 0.1);
          break;

        case 'capture':
          playTone(300, 0.05, 'sawtooth', 0.2);
          playTone(200, 0.1, 'sawtooth', 0.2, 0.05);
          playTone(100, 0.15, 'sawtooth', 0.2, 0.12);
          break;

        case 'enter':
          // Bright ascending chirp
          playTone(523, 0.08, 'sine', 0.15);
          playTone(659, 0.08, 'sine', 0.15, 0.09);
          playTone(784, 0.12, 'sine', 0.15, 0.18);
          break;

        case 'home':
          // Happy rising arpeggio
          [523, 659, 784, 1047].forEach((f, i) =>
            playTone(f, 0.15, 'sine', 0.18, i * 0.1),
          );
          break;

        case 'win':
          // Victory fanfare
          const fanfare = [523, 523, 523, 415, 523, 659, 784];
          fanfare.forEach((f, i) =>
            playTone(f, 0.2, 'sine', 0.2, i * 0.18),
          );
          break;
      }
    },
    [playTone],
  );

  return { play, enabled, setEnabled };
}
