import React from 'react';

interface TilakLoaderProps {
  size?: number;
  className?: string;
  mode?: 'default' | 'audio' | 'summary';
}

export const TilakLoader: React.FC<TilakLoaderProps> = ({ size = 40, className = '', mode = 'default' }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.2 }}
    >
      <svg 
        viewBox="0 0 50 60" 
        className="w-full h-full overflow-visible"
        style={{ filter: mode === 'summary' ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))' : 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' }}
      >
        <defs>
          <linearGradient id="saffronGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        
        {/* U-Shape Base */}
        <path
          d="M 25 50 C 15 50 15 45 15 35 L 15 10"
          fill="none"
          stroke={mode === 'summary' ? "url(#goldGradient)" : "url(#saffronGradient)"}
          strokeWidth="4"
          strokeLinecap="round"
          className={mode === 'summary' ? "animate-[drawTilakFast_1.5s_ease-out_infinite]" : "animate-[drawTilak_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite]"}
          strokeDasharray="60"
          strokeDashoffset="60"
        />

        <path
          d="M 25 50 C 35 50 35 45 35 35 L 35 10"
          fill="none"
          stroke={mode === 'summary' ? "url(#goldGradient)" : "url(#saffronGradient)"}
          strokeWidth="4"
          strokeLinecap="round"
          className={mode === 'summary' ? "animate-[drawTilakFast_1.5s_ease-out_infinite]" : "animate-[drawTilak_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite]"}
          strokeDasharray="60"
          strokeDashoffset="60"
        />
        
        {/* Central Mark */}
        <line
          x1="25"
          y1={mode === 'audio' ? "40" : "45"}
          x2="25"
          y2={mode === 'audio' ? "15" : "20"}
          stroke={mode === 'summary' ? "#fef3c7" : "#fed7aa"} 
          strokeWidth="3"
          strokeLinecap="round"
          className={`
            ${mode === 'audio' ? 'animate-[audioWave_0.8s_ease-in-out_infinite]' : ''}
            ${mode === 'default' ? 'animate-[drawLine_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite_0.2s] opacity-0' : ''}
            ${mode === 'summary' ? 'animate-[pulseGlow_2s_ease-in-out_infinite]' : ''}
          `}
          strokeDasharray={mode === 'default' ? "30" : "0"}
          strokeDashoffset={mode === 'default' ? "30" : "0"}
        />
        
        {/* Bindu */}
        <circle
          cx="25"
          cy="50"
          r="3"
          fill={mode === 'summary' ? "#d97706" : "#dc2626"}
          className={mode === 'default' ? "animate-[fadeInBindu_2.5s_ease-in-out_infinite_0.4s] opacity-0" : "opacity-100"}
        />
      </svg>
      
      <style>{`
        @keyframes drawTilak {
          0% { stroke-dashoffset: 60; opacity: 0; }
          10% { opacity: 1; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes drawTilakFast {
          0% { stroke-dashoffset: 60; opacity: 0; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes drawLine {
          0% { stroke-dashoffset: 30; opacity: 0; }
          10% { opacity: 1; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes fadeInBindu {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.3); }
          65% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes audioWave {
          0%, 100% { transform: scaleY(0.7); transform-origin: bottom; stroke: #fb923c; }
          50% { transform: scaleY(1.2); transform-origin: bottom; stroke: #fed7aa; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; stroke-width: 3; }
          50% { opacity: 1; stroke-width: 4; }
        }
      `}</style>
    </div>
  );
};
