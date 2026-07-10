import React from 'react';
import appLogo from '@/assets/app-logo.png';

interface AppLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
  rounded?: string;
  alt?: string;
}

/**
 * Unified app logo with consistent dark-mode treatment.
 * Uses subtle brightness + hue-rotate boost in dark mode so the mark
 * stays legible and gold-toned against dark surfaces.
 */
const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  className = '',
  glow = false,
  rounded = 'rounded-2xl',
  alt = 'قلب القرآن',
}) => {
  return (
    <span
      className={`app-logo relative inline-flex items-center justify-center ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-[inherit] opacity-70 blur-lg dark:opacity-90 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)',
          }}
        />
      )}
      <img
        src={appLogo}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        className="relative w-full h-full object-contain app-logo-img"
        draggable={false}
      />
    </span>
  );
};

export default AppLogo;
