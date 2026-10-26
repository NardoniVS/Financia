import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export interface BalancePoint {
  date: string;
  fullDate: string;
  balance: number;
  flow: number; // Fluxo diário
}

interface RechartsBalanceLineProps {
  data: BalancePoint[];
  privacyMode?: boolean;
  onHoverPoint?: (point: BalancePoint | null) => void;
}

export const RechartsBalanceLine: React.FC<RechartsBalanceLineProps> = ({
  data,
  privacyMode = false,
  onHoverPoint,
}) => {
  const minVal = Math.min(...data.map(d => d.balance)) * 0.95;
  const maxVal = Math.max(...data.map(d => d.balance)) * 1.05;

  return (
    <div className="w-full h-[120px] relative select-none">
      <ResponsiveContainer width="100%" height="100%" minHeight={90}>
        <AreaChart
          data={data}
          margin={{ top: 12, right: 6, left: 6, bottom: 0 }}
          onMouseMove={(e: any) => {
            if (e?.activePayload && e.activePayload.length > 0 && onHoverPoint) {
              onHoverPoint(e.activePayload[0].payload as BalancePoint);
            }
          }}
          onMouseLeave={() => {
            if (onHoverPoint) onHoverPoint(null);
          }}
          onTouchMove={(e: any) => {
            if (e?.activePayload && e.activePayload.length > 0 && onHoverPoint) {
              onHoverPoint(e.activePayload[0].payload as BalancePoint);
            }
          }}
          onTouchEnd={() => {
            if (onHoverPoint) onHoverPoint(null);
          }}
        >
          <defs>
            <linearGradient id="rechartsBalanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.38} />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
            </linearGradient>
            <filter id="rechartsGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="0.4" />
            </filter>
          </defs>

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255, 255, 255, 0.75)', fontSize: 10, fontWeight: 500 }}
            dy={4}
          />

          <YAxis domain={[minVal, maxVal]} hide />

          <Tooltip
            cursor={{
              stroke: 'rgba(255, 255, 255, 0.5)',
              strokeWidth: 1.5,
              strokeDasharray: '3 3',
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as BalancePoint;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs px-3 py-2 rounded-2xl shadow-2xl border border-white/20 pointer-events-none transform -translate-y-2">
                    <div className="text-[10px] text-blue-200 font-medium mb-0.5">
                      {item.fullDate}
                    </div>
                    <div className="font-extrabold text-sm tracking-tight text-white tabular-nums">
                      {privacyMode ? '••••••••' : formatCurrency(item.balance)}
                    </div>
                    {item.flow !== 0 && (
                      <div className="text-[10px] text-emerald-300 font-semibold mt-0.5 flex items-center gap-1">
                        <span>{item.flow > 0 ? '+' : ''}{privacyMode ? '•••' : formatCurrency(item.flow)} no dia</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="balance"
            stroke="#FFFFFF"
            strokeWidth={3}
            fill="url(#rechartsBalanceGradient)"
            animationDuration={800}
            activeDot={{
              r: 6,
              fill: '#FFFFFF',
              stroke: '#1A5CFF',
              strokeWidth: 3,
              className: 'filter drop-shadow-md',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
