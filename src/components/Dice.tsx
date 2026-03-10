'use client';
/**
 * Animated neon dice component.
 * Shows rolling animation then snaps to the result.
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [25, 75], [75, 25], [75, 75]],
  5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
  6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
};

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  color: string;
}

export default function Dice({ value, isRolling, canRoll, onRoll, color }: DiceProps) {
  const [displayValue, setDisplayValue] = useState<number>(1);

  // While rolling, show random faces cycling fast
  useEffect(() => {
    if (!isRolling) {
      if (value !== null) setDisplayValue(value);
      return;
    }
    const id = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
    }, 80);
    return () => clearInterval(id);
  }, [isRolling, value]);

  const dots = DOTS[displayValue] ?? [];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice face */}
      <motion.div
        onClick={canRoll ? onRoll : undefined}
        animate={
          isRolling
            ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.1, 0.95, 1.05, 1] }
            : canRoll
            ? { scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 1.5 } }
            : { scale: 1 }
        }
        transition={{ duration: 0.6 }}
        className={clsx(
          'relative w-16 h-16 md:w-20 md:h-20 rounded-xl',
          'bg-[#0a0a1f] border-2',
          canRoll && !isRolling ? 'cursor-pointer hover:scale-110' : '',
        )}
        style={{
          borderColor: color,
          boxShadow: canRoll
            ? `0 0 12px ${color}, 0 0 24px ${color}50, inset 0 0 8px ${color}20`
            : `0 0 4px ${color}40`,
          transition: 'box-shadow 0.3s',
        }}
        whileHover={canRoll && !isRolling ? { scale: 1.1 } : {}}
        whileTap={canRoll ? { scale: 0.9 } : {}}
      >
        {dots.map(([x, y], i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="absolute w-[18%] h-[18%] rounded-full"
            style={{
              left: `${x - 9}%`,
              top: `${y - 9}%`,
              background: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        ))}
      </motion.div>

      {/* Roll label */}
      <motion.span
        animate={canRoll ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.4 }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color }}
      >
        {isRolling ? 'Rolling…' : canRoll ? 'Tap to Roll' : ''}
      </motion.span>
    </div>
  );
}
