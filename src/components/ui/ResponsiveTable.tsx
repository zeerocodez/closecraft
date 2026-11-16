'use client';

import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-high/40 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80 select-none">
              {columns.map((col) => (
                <th key={col.key} className={`py-3.5 px-4 font-semibold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-sm">
            {data.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-surface-container-high/40'
                      : 'hover:bg-surface-container-high/20'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 text-on-surface ${col.className || ''}`}>
                      {col.render(item, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => {
          const rowKey = keyExtractor(item, index);
          return (
            <div
              key={rowKey}
              onClick={() => onRowClick && onRowClick(item)}
              className={`p-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest space-y-2.5 transition-all ${
                onRowClick ? 'active:scale-[0.99] cursor-pointer' : ''
              }`}
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => {
                  const label = col.mobileLabel || (typeof col.header === 'string' ? col.header : col.key);
                  return (
                    <div key={col.key} className="flex items-start justify-between gap-3 text-xs">
                      <span className="text-on-surface-variant font-medium shrink-0 pt-0.5">
                        {label}
                      </span>
                      <div className="text-right text-on-surface font-normal break-words">
                        {col.render(item, index)}
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResponsiveTable;
