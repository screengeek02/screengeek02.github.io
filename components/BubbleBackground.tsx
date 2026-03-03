import type { CSSProperties } from 'react';

type BubbleBackgroundProps = {
  count?: number;
  className?: string;
};

type BubbleStyle = CSSProperties & {
  '--size': string;
  '--left': string;
  '--duration': string;
  '--delay': string;
  '--blur': string;
  '--opacity': string;
};

export function BubbleBackground({ count = 16, className = '' }: BubbleBackgroundProps) {
  const bubbles = Array.from({ length: count }, (_, index) => {
    const size = 24 + ((index * 17) % 56);
    const left = (index * 7.3) % 100;
    const duration = 10 + (index % 6) * 1.8;
    const delay = (index % 8) * 0.7;
    const blur = (index % 3) * 0.6;
    const opacity = 0.22 + (index % 4) * 0.1;

    const style: BubbleStyle = {
      '--size': `${size}px`,
      '--left': `${left}%`,
      '--duration': `${duration}s`,
      '--delay': `${delay}s`,
      '--blur': `${blur}px`,
      '--opacity': `${opacity}`,
    };

    return <span key={index} className="helio-bubble" style={style} />;
  });

  return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>{bubbles}</div>;
}
