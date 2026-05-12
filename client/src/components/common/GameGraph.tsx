import React, { useMemo } from 'react';

type GameState = "waiting" | "running" | "crashed";

interface Props {
  multiplier: number;
  gameState: GameState;
}

export const GameGraph: React.FC<Props> = ({ multiplier, gameState }) => {

  // ✅ Advanced smooth scaling (true exponential curve feeling)
  const { x, y, angle } = useMemo(() => {
    if (gameState === 'waiting') return { x: 0, y: 0, angle: 0 };

    // Logarithmic X (time) and Exponential Y (height) for the classic crash curve
    const rawX = Math.log(multiplier) * 45; 
    const rawY = Math.pow(Math.log(multiplier), 1.6) * 40;

    // Cap at 100 to stay within SVG bounds (viewBox 0 0 100 100)
    const progressX = Math.min(100, rawX);
    const progressY = Math.min(100, rawY);

    // Control point logic for the Bezier curve
    const cX = progressX * 0.6;
    const cY = 100 - progressY * 0.05;

    // Calculate tangent angle to rotate the head accurately
    const dx = progressX - cX;
    const dy = (100 - progressY) - cY;
    let rot = Math.atan2(dy, dx) * (180 / Math.PI);

    if (rot < -85) rot = -85;

    return { x: progressX, y: progressY, angle: rot };
  }, [multiplier, gameState]);

  // ✅ SVG Curve Data
  const pathData = useMemo(() => {
    const cX = x * 0.6;
    const cY = 100 - y * 0.05;
    return `M 0 100 Q ${cX} ${cY}, ${x} ${100 - y}`;
  }, [x, y]);

  const isCrashed = gameState === 'crashed';

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl bg-[#0B0E14] shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]">
      
      {/* Subtle overlay vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-transparent opacity-50"></div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Running Line Gradient (Neon Green) */}
          <linearGradient id="lineGradRunning" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" /> 
            <stop offset="50%" stopColor="#10b981" /> 
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Crashed Line Gradient (Neon Red/Orange) */}
          <linearGradient id="lineGradCrashed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#be123c" /> 
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          {/* Running Fill Area Gradient */}
          <linearGradient id="fillGradRunning" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>

          {/* Crashed Fill Area Gradient */}
          <linearGradient id="fillGradCrashed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>

          {/* Outer Glow Filters */}
          <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ✅ High-Tech Chart Grid Background */}
        <g className="opacity-30">
          {/* Horizontal Grid Lines */}
          {[20, 40, 60, 80].map((lineY) => (
            <line key={`h-${lineY}`} x1="0" y1={lineY} x2="100" y2={lineY} stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 2" />
          ))}
          {/* Vertical Grid Lines */}
          {[20, 40, 60, 80].map((lineX) => (
            <line key={`v-${lineX}`} x1={lineX} y1="0" x2={lineX} y2="100" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 2" />
          ))}
          {/* Axis Base Lines (Glowing) */}
          <line x1="0" y1="100" x2="100" y2="100" stroke="#334155" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="100" stroke="#334155" strokeWidth="1" />
        </g>

        {/* ✅ The Active Graph */}
        {gameState !== 'waiting' && (
          <g>
            {/* Fill under the curve */}
            <path
              d={`${pathData} L ${x} 100 L 0 100 Z`}
              fill={isCrashed ? "url(#fillGradCrashed)" : "url(#fillGradRunning)"}
              className="transition-all duration-100 ease-linear"
            />

            {/* The main glowing line curve */}
            <path
              d={pathData}
              fill="none"
              stroke={isCrashed ? 'url(#lineGradCrashed)' : 'url(#lineGradRunning)'}
              strokeWidth="1.2"
              strokeLinecap="round"
              filter={isCrashed ? 'url(#glowRed)' : 'url(#glowGreen)'}
              className="transition-all duration-100 ease-linear"
            />
            
            {/* ✅ Moving Element at the Tip (Comet Head) */}
            <g
              style={{
                transform: `translate(${x}px, ${100 - y}px) rotate(${angle}deg)`,
                transition: 'transform 100ms linear',
                transformOrigin: 'center'
              }}
            >
              {gameState === 'running' ? (
                // 🚀 Sleek "Engine Core" (Glowing Dot)
                <g>
                  {/* Outer pulsing ring */}
                  <circle cx="0" cy="0" r="2.5" fill="#34d399" opacity="0.3" filter="url(#glowGreen)">
                    <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1s" repeatCount="indefinite" />
                  </circle>
                  {/* Inner intense bright core */}
                  <circle cx="0" cy="0" r="1" fill="#ffffff" filter="url(#glowGreen)" />
                </g>
              ) : (
                // 💥 Crash Explosion Fragment Effect
                <g filter="url(#glowRed)">
                  {/* Core blast */}
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  <circle cx="0" cy="0" r="4" fill="#f43f5e" opacity="0.8" />
                  
                  {/* Shattered Particles */}
                  <line x1="0" y1="0" x2="-4" y2="-4" stroke="#f43f5e" strokeWidth="0.8" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="5" y2="-2" stroke="#f43f5e" strokeWidth="0.6" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="-2" y2="5" stroke="#fca5a5" strokeWidth="0.5" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="4" y2="4" stroke="#fca5a5" strokeWidth="0.8" strokeLinecap="round" />
                </g>
              )}
            </g>
          </g>
        )}

        {/* ✅ Idle / Waiting State - Tech Loading Line */}
        {gameState === 'waiting' && (
          <g>
            <path
              d="M 0 100 L 100 100"
              stroke="#475569"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="4 6"
            >
              {/* Moves the dashes to look like data flowing */}
              <animate attributeName="stroke-dashoffset" values="10;0" dur="0.8s" repeatCount="indefinite" />
            </path>
            {/* Pulsing Start Dot */}
            <circle cx="0" cy="100" r="1.5" fill="#94a3b8">
               <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
};