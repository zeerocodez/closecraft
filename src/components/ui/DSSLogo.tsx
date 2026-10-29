import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface DSSLogoProps {
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
    xs: { height: 20, width: 53 },
    sm: { height: 28, width: 74 },
    md: { height: 36, width: 95 },
    lg: { height: 44, width: 116 },
    xl: { height: 56, width: 147 },
  },
  icon: {
    xs: { height: 18, width: 26 },
    sm: { height: 24, width: 34 },
    md: { height: 32, width: 45 },
    lg: { height: 40, width: 57 },
    xl: { height: 48, width: 68 },
  },
};

export function DSSLogo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  href,
  priority = false,
  alt = 'Digital Sales School Logo',
}: DSSLogoProps) {
  const dimensions = SIZES[variant][size];

  let src = '/images/dss-logo.png';
  if (variant === 'icon') {
    src = '/images/dss-icon.png';
  } else if (theme === 'dark') {
    src = '/images/dss-logo-dark.png';
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

export default DSSLogo;
