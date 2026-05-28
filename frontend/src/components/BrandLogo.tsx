import React from 'react';
import { cn } from '../lib/utils';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
}

const dots = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const x = 28 + Math.cos(angle) * 20;
  const y = 28 + Math.sin(angle) * 20;
  return { x, y, i };
});

const BrandLogo: React.FC<BrandLogoProps> = ({ className, showTagline = false }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-label="Momentum mark" className="shrink-0">
        {dots.map((dot) => (
          <circle key={dot.i} cx={dot.x} cy={dot.y} r="1.35" fill="#0b2a3f" />
        ))}
      </svg>

      <div className="leading-none">
        <div className="text-[28px] font-extrabold tracking-tight text-[#0b2a3f] dark:text-slate-100">
          m<span className="text-[#f97316]">o</span>mentum
        </div>
        {showTagline && (
          <div className="mt-1 text-[11px] font-medium tracking-[0.12em] text-slate-500 dark:text-slate-400 uppercase">
            Productivity OS
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
