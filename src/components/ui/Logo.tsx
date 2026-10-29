import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LogoProps {
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark'; // 'light' has white text for dark backgrounds (default), 'dark' has dark text
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  href?: string;
  priority?: boolean;
  alt?: string;
}

const SIZES = {
  full: {
    xs: { height: 20, width: 55 },
    sm: { height: 26, width: 71 },
    md: { height: 32, width: 87 },
    lg: { height: 40, width: 109 },
    xl: { height: 48, width: 131 },
  },
  icon: {
    xs: { height: 18, width: 26 },
    sm: { height: 24, width: 35 },
    md: { height: 32, width: 47 },
    lg: { height: 40, width: 59 },
    xl: { height: 48, width: 70 },
  },
};

export function Logo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  href,
  priority = false,
  alt = 'Closecraft Logo',
}: LogoProps) {
  const dimensions = SIZES[variant][size];
  
  let src = '/images/closecraft-logo.png';
  if (variant === 'icon') {
    src = '/images/closecraft-icon.png';
  } else if (theme === 'dark') {
    src = '/images/closecraft-logo-dark.png';
  }

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={`inline-block select-none object-contain ${className}`}
      style={{ height: `${dimensions.height}px`, width: 'auto' }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group transition-opacity hover:opacity-90">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}

export default Logo;
