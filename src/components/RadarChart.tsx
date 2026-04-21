import React from 'react';

interface RadarChartProps {
  scores: number[];
  onPointClick: (index: number) => void;
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores, onPointClick }) => {
  const labels = ['배산', '임수', '안정', '현대', '균형'];
  
  const points = scores.map((score, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = (score / 100) * 35;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-72 h-72 relative mb-2 group">
      {/* 5A & 4: Clipping 방지를 위해 viewBox 확장 및 overflow-visible */}
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
        <defs>
          <filter id="glow" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {[10, 20, 30, 40].map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: 5 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
              return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
            }).join(' ')}
            className="fill-none stroke-white/10 stroke-[0.3]"
          />
        ))}

        <polygon 
          points={points} 
          className="fill-fengshui-gold/20 stroke-fengshui-gold stroke-[1.5] transition-all duration-1000" 
          filter="url(#glow)"
        />
        
        {scores.map((score, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const r = 48; 
          const x = 50 + r * Math.cos(angle);
          const y = 50 + r * Math.sin(angle);
          
          return (
            <g key={i} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onPointClick(i)}>
              <circle cx={50 + (score / 100 * 35) * Math.cos(angle)} cy={50 + (score / 100 * 35) * Math.sin(angle)} r="1.2" className="fill-fengshui-gold" />
              <text x={x} y={y - 3} className="fill-fengshui-gold text-[5px] font-[900]" textAnchor="middle">{labels[i]}</text>
              <text x={x} y={y + 3} className="fill-white/50 text-[3.5px] font-bold" textAnchor="middle">{score}점</text>
              <circle cx={x} cy={y} r="15" className="fill-transparent" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
