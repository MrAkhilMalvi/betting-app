import React, { useMemo } from 'react';

interface Props {
  multiplier: number;
  gameState: string;
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
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl bg-background shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]">
      
      {/* Dynamic ambient background glow mapping to status */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        isCrashed 
          ? "bg-gradient-to-tr from-danger/5 via-transparent to-transparent opacity-60" 
          : "bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40"
      }`} />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Running Line Gradient (Neon Green - theme.primary) */}
          <linearGradient id="lineGradRunning" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803d" /> 
            <stop offset="50%" stopColor="#22c55e" /> 
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>

          {/* Crashed Line Gradient (Neon Red/Orange - theme.danger) */}
          <linearGradient id="lineGradCrashed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" /> 
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Running Fill Area Gradient */}
          <linearGradient id="fillGradRunning" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.0" />
          </linearGradient>

          {/* Crashed Fill Area Gradient */}
          <linearGradient id="fillGradCrashed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur1" />
            <feGaussianBlur stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur1" />
            <feGaussianBlur stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ✅ Analytical Graph Grid Background */}
        <g className="opacity-20">
          {/* Horizontal Grid Lines */}
          {[20, 40, 60, 80].map((lineY) => (
            <line key={`h-${lineY}`} x1="0" y1={lineY} x2="100" y2={lineY} stroke="#334155" strokeWidth="0.2" strokeDasharray="1 3" />
          ))}
          {/* Vertical Grid Lines */}
          {[20, 40, 60, 80].map((lineX) => (
            <line key={`v-${lineX}`} x1={lineX} y1="0" x2={lineX} y2="100" stroke="#334155" strokeWidth="0.2" strokeDasharray="1 3" />
          ))}
          
          {/* Axis borders */}
          <line x1="0" y1="100" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="0" y2="100" stroke="#1e293b" strokeWidth="0.8" />
        </g>

        {/* ✅ The Active Graph Path & Fill */}
        {gameState !== 'waiting' && (
          <g>
            {/* Smooth transition fill gradient under path */}
            <path
              d={`${pathData} L ${x} 100 L 0 100 Z`}
              fill={isCrashed ? "url(#fillGradCrashed)" : "url(#fillGradRunning)"}
              className="transition-all duration-100 ease-linear"
            />

            {/* Glowing Main Curve Line */}
            <path
              d={pathData}
              fill="none"
              stroke={isCrashed ? 'url(#lineGradCrashed)' : 'url(#lineGradRunning)'}
              strokeWidth="1"
              strokeLinecap="round"
              filter={isCrashed ? 'url(#glowRed)' : 'url(#glowGreen)'}
              className="transition-all duration-100 ease-linear"
            />
            
            {/* ✅ Tip Vector Indicator (Comet Head) */}
            <g
              style={{
                transform: `translate(${x}px, ${100 - y}px) rotate(${angle}deg)`,
                transition: 'transform 100ms linear',
                transformOrigin: 'center'
              }}
            >
              {gameState === 'running' ? (
                /* Engine Core Pulse (Neon Green Theme) */
                <g>
                  {/* Pulsing Core Ring */}
                  <circle cx="0" cy="0" r="3" fill="#4ade80" opacity="0.3" filter="url(#glowGreen)">
                    <animate attributeName="r" values="2;4.5;2" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="1.2" fill="#ffffff" filter="url(#glowGreen)" />
                </g>
              ) : (
                /* Explosion Shatter (Neon Red Danger Theme) */
                <g filter="url(#glowRed)">
                  <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                  <circle cx="0" cy="0" r="4.5" fill="#ef4444" opacity="0.8" />
                  
                  {/* Interactive Micro Particles */}
                  <line x1="0" y1="0" x2="-5" y2="-4" stroke="#ef4444" strokeWidth="0.6" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="6" y2="-1" stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="-1" y2="6" stroke="#fca5a5" strokeWidth="0.4" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="5" y2="4" stroke="#fca5a5" strokeWidth="0.6" strokeLinecap="round" />
                </g>
              )}
            </g>
          </g>
        )}

        {/* ✅ Loading Data Flowing Line (Idle Waiting State) */}
        {gameState === 'waiting' && (
          <g>
            <path
              d="M 0 100 L 100 100"
              stroke="#475569"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeDasharray="3 5"
            >
              <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
            </path>
            
            {/* Start Beacon */}
            <circle cx="0" cy="100" r="1.2" fill="#64748b">
               <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
};