'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ data, currency }: { data: any[], currency: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-on-surface-variant font-medium">No data available</p>
        <p className="text-xs text-on-surface-muted mt-1">There is no closed-won data in the selected period.</p>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    notation: 'compact'
  });

  return (
    <div className="w-full h-full relative" aria-label="Closed-won value over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#45BFAE" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#45BFAE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#293B4C" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A9CAE', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A9CAE', fontSize: 12 }}
            tickFormatter={(value) => formatter.format(value)} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#172431', borderColor: '#293B4C', borderRadius: '8px', color: '#F3F7FA' }}
            itemStyle={{ color: '#45BFAE' }}
            formatter={(value: any) => [new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0), 'Revenue']}
            labelStyle={{ color: '#8A9CAE', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#45BFAE" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={650}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
