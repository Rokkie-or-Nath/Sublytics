import { useState } from 'react';
import { getBrandLogo } from '../../utils/brand-logos';

interface SubscriptionLogoProps {
  /** The subscription name — used to look up a brand logo. */
  name: string;
  /** The subscription's own logo URL (from the user's data). */
  logoUrl?: string;
  /** The brand color for the fallback circle. */
  color: string;
  /** Optional size class override (default w-11 h-11). */
  size?: 'sm' | 'md' | 'lg';
  /** Optional className override. */
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
};

const fontSizes = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-2xl',
};

export function SubscriptionLogo({ name, logoUrl, color, size = 'md', className = '' }: SubscriptionLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Priority: 1) subscription's own logoUrl, 2) brand lookup, 3) fallback letter
  const brandLogo = getBrandLogo(name);
  const src = logoUrl || brandLogo;

  if (src && !imgError) {
    return (
      <div
        className={`${sizes[size]} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
        style={{ backgroundColor: `${color}18` }}
      >
        <img
          src={src}
          alt={name}
          className="w-5/6 h-5/6 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: colored circle with first letter
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: `${color}18` }}
    >
      <span className={`${fontSizes[size]} font-bold`} style={{ color }}>
        {name.charAt(0)}
      </span>
    </div>
  );
}