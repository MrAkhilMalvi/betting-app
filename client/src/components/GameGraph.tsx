import React, { useMemo } from 'react';
import { Rocket } from 'lucide-react';

// Assuming you have this defined, or just use strings if preferred.
type GameState = "waiting" | "running" | "crashed";

interface Props {
  multiplier: number;
  gameState: GameState;
}

export const GameGraph: React.FC<Props> = ({ multiplier, gameState }) => {

  // ✅ Advanced smooth scaling (true exponential curve feeling)
  const { x, y, angle } = useMemo(() => {
    // If waiting, lock it to the start line
    if (gameState === 'waiting') return { x: 0, y: 0, angle: 0 };

    // Use Math.log for time (X) to stretch it out, and pow for Y to curve it up
    const rawX = Math.log(multiplier) * 45; 
    const rawY = Math.pow(Math.log(multiplier), 1.6) * 40;

    // Cap at 100 to stay within SVG bounds (viewBox 0 0 100 100)
    const progressX = Math.min(100, rawX);
    const progressY = Math.min(100, rawY);

    // Control point logic for the Bezier curve
    const cX = progressX * 0.6;
    const cY = 100 - progressY * 0.05;

    // Calculate tangent angle to rotate the rocket accurately
    const dx = progressX - cX;
    const dy = (100 - progressY) - cY;
    let rot = Math.atan2(dy, dx) * (180 / Math.PI);

    // Cap the upward rotation so the rocket doesn't flip backward
    if (rot < -85) rot = -85;

    return { x: progressX, y: progressY, angle: rot };
  }, [multiplier, gameState]);

  // ✅ SVG Curve Data
  const pathData = useMemo(() => {
    // Start at (0, 100) -> Quad curve to (x, 100 - y)
    const cX = x * 0.6;
    const cY = 100 - y * 0.05;
    return `M 0 100 Q ${cX} ${cY}, ${x} ${100 - y}`;
  }, [x, y]);

  // Dynamic colors based on state
  const isCrashed = gameState === 'crashed';
  const lineColor = isCrashed ? '#f43f5e' : '#10b981'; // Rose for crash, Emerald for running

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none p-4">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full drop-shadow-xl"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Running Line Gradient */}
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" /> {/* emerald-600 */}
            <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
          </linearGradient>

          {/* Fill Gradient Area under the curve */}
          <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity={isCrashed ? "0.2" : "0.5"} />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Glow filter for the rocket/dot */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ✅ Subtle Chart Grid Background */}
        <g stroke="#1e293b" strokeWidth="0.5" opacity="0.4">
          <line x1="0" y1="25" x2="100" y2="25" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="0" y1="75" x2="100" y2="75" />
          <line x1="25" y1="0" x2="25" y2="100" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="75" y1="0" x2="75" y2="100" />
        </g>

        {/* ✅ The Graph Itself */}
        {gameState !== 'waiting' && (
          <g>
            {/* Fill under the curve */}
            <path
              d={`${pathData} L ${x} 100 L 0 100 Z`}
              fill="url(#fillGrad)"
              className="transition-all duration-75 ease-linear"
            />

            {/* The actual line curve */}
            <path
              d={pathData}
              fill="none"
              stroke={isCrashed ? '#f43f5e' : 'url(#lineGrad)'}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-75 ease-linear"
              style={{
                filter: isCrashed ? 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.8))' : 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))'
              }}
            />
            
            {/* ✅ Moving Element at the Tip */}
            <g
              style={{
                transform: `translate(${x}px, ${100 - y}px) rotate(${angle}deg)`,
                transition: 'transform 75ms linear',
                transformOrigin: 'center'
              }}
            >
              {gameState === 'running' ? (
                // 🚀 Flying Rocket Icon when Running
                <g transform="translate(-4, -4) rotate(45)">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                  </svg>
                  {/* Rocket Engine Flame effect */}
                  <circle cx="2" cy="22" r="2" fill="#f59e0b" filter="url(#glow)">
                    <animate attributeName="r" values="1;2.5;1" dur="0.2s" repeatCount="indefinite" />
                  </circle>
                </g>
              ) : (
                // 💥 Crash Explosion / Dot
                <circle
                  cx="0"
                  cy="0"
                  r="3"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="1"
                  filter="url(#glow)"
                  className="animate-ping"
                  style={{ animationDuration: '1s', animationIterationCount: 1 }}
                />
              )}
            </g>
          </g>
        )}

        {/* ✅ Idle / Waiting State Flat Line */}
        {gameState === 'waiting' && (
          <path
            d="M 0 100 L 100 100"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};