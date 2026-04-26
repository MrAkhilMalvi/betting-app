import React from 'react';
import { GameState } from '../types/types';

interface Props {
  multiplier: number;
  gameState: GameState;
}

export const GameGraph: React.FC<Props> = ({ multiplier, gameState }) => {
  // Calculate dynamic X and Y coordinates to make the curve feel alive
  // As multiplier increases, line draws out further and higher
  const progressX = Math.min(100, (multiplier - 1) * 10); // Caps at 100% width
  const progressY = Math.min(100, (multiplier - 1) * 20); // Caps at 100% height
  
  const pathData = `M 0 100 Q ${progressX * 0.6} 100, ${progressX} ${100 - progressY}`;

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {gameState !== 'waiting' && (
          <>
            {/* Fill under the curve */}
            <path
              d={`${pathData} L ${progressX} 100 L 0 100 Z`}
              fill="url(#fillGrad)"
              className="transition-all duration-75 ease-linear"
            />
            {/* Main Rocket Line */}
            <path
              d={pathData}
              fill="none"
              stroke={gameState === 'crashed' ? '#EF4444' : 'url(#lineGrad)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              className="transition-all duration-75 ease-linear drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
            />
            {/* Glowing Dot at the tip */}
            {gameState === 'running' && (
              <circle
                cx={progressX}
                cy={100 - progressY}
                r="1.5"
                fill="#fff"
                className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
};