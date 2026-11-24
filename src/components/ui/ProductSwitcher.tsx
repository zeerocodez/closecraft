'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Sparkles, TrendingUp, GraduationCap, Check } from 'lucide-react';

export type ProductKey = 'closecraft' | 'revenue' | 'dss';

export interface ProductDefinition {
  key: ProductKey;
  name: string;
  tagline: string;
  href: string;
  icon: React.ReactNode;
  activeColor: string;
}

export const PRODUCTS: ProductDefinition[] = [
  {
    key: 'closecraft',
    name: 'CloseCraft',
    tagline: 'Growth Services, Concierge & Delivery',
    href: '/dashboard',
    icon: <Sparkles className="w-4 h-4 text-primary-fixed" />,
    activeColor: 'text-primary-fixed',
  },
  {
    key: 'revenue',
    name: 'Revenue Engine',
    tagline: 'Leads, Deal Pipeline & Closing',
    href: '/dashboard/revenue-engine',
    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    activeColor: 'text-emerald-400',
  },
  {
    key: 'dss',
    name: 'Digital Sales School',
    tagline: 'Practical Sales Academy & LMS',
    href: '/dss/dashboard',
    icon: <GraduationCap className="w-4 h-4 text-teal-300" />,
    activeColor: 'text-teal-300',
  },
];

export function getActiveProduct(pathname: string): ProductKey {
  if (pathname.startsWith('/dss')) return 'dss';
  if (
    pathname.startsWith('/leads') ||
    pathname.startsWith('/pipeline') ||
    pathname.startsWith('/appointments') ||
    pathname.startsWith('/revenue') ||
    pathname.startsWith('/dashboard/revenue-engine')
  ) {
    return 'revenue';
  }
  return 'revenue';
}

export interface ProductSwitcherProps {
  className?: string;
}

export const ProductSwitcher = ({ className = '' }: ProductSwitcherProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeKey = getActiveProduct(pathname || '');
  const activeProduct = PRODUCTS.find((p) => p.key === activeKey) || PRODUCTS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="p-1 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center">
          {activeProduct.icon}
        </span>
        <span className="font-bold tracking-tight">{activeProduct.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-72 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-outline-variant/20 mb-1">
            Switch Platform Experience
          </div>

          <div className="space-y-1">
            {PRODUCTS.map((prod) => {
              const isActive = prod.key === activeKey;
              return (
                <Link
                  key={prod.key}
                  href={prod.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors group ${
                    isActive
                      ? 'bg-surface-container-high border border-outline-variant/50'
                      : 'hover:bg-surface-container-high/60'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center shrink-0">
                      {prod.icon}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold leading-tight ${
                          isActive ? prod.activeColor : 'text-on-surface'
                        }`}
                      >
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                        {prod.tagline}
                      </div>
                    </div>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-primary-fixed shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSwitcher;

