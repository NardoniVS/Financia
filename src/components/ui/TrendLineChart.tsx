import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface TrendLineChartProps {
  data?: number[];
  labels?: string[];
  height?: number;
  strokeColor?: string;
  fillGradientFrom?: string;
  fillGradientTo?: string;
  highlightIndex?: number;
  highlightLabel?: string;
  interactive?: boolean;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data = [8200, 8350, 8100, 8450, 8600, 8520, 8720.76],
  labels = ['01 Out', '05 Out', '10 Out', '15 Out', '20 Out', '23 Out', 'Hoje'],
  height = 90,
  strokeColor = '#FFFFFF',
  fillGradientFrom = 'rgba(255, 255, 255, 0.35)',
  fillGradientTo = 'rgba(255, 255, 255, 0.0)',
  highlightIndex = 5,
  highlightLabel = 'R$ 1.090,33',
  interactive = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(highlightIndex);

  const min = Math.min(...data) * 0.98;
  const max = Math.max(...data) * 1.02;
  const range = max - min || 1;
  const width = 320;

  // Convert points to SVG coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 24) + 12;
    const y = height - ((val - min) / range) * (height - 30) - 15;
    return { x, y, val, label: labels[idx] };
  });

  // Build smooth bezier curve
  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="relative w-full select-none" style={{ height: `${height}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillGradientFrom} />
            <stop offset="100%" stopColor={fillGradientTo} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Gradient fill underneath curve */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Smooth line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Highlight / Hover circle */}
        {activePoint && (
          <g className="transition-all duration-200">
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="6"
              fill={strokeColor}
              className="drop-shadow-md animate-pulse"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="2.5"
              fill="#1A5CFF"
            />
          </g>
        )}
      </svg>

      {/* Floating Price Tag on active point */}
      {activePoint && (
        <div
          className="absolute transform -translate-x-1/2 pointer-events-none transition-all duration-150"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${Math.max(0, activePoint.y - 28)}px`,
          }}
        >
          <div className="px-2 py-0.5 rounded-full bg-white text-blue-900 text-[11px] font-bold shadow-lg flex items-center gap-1 border border-blue-100 whitespace-nowrap">
            <span>{hoveredIdx === highlightIndex && highlightLabel ? highlightLabel : formatCurrency(activePoint.val)}</span>
          </div>
        </div>
      )}

      {/* Invisible touch hotspots */}
      {interactive && (
        <div className="absolute inset-0 flex justify-between">
          {points.map((pt, idx) => (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setHoveredIdx(idx)}
              onTouchStart={() => setHoveredIdx(idx)}
              className="h-full flex-1 cursor-pointer focus:outline-none"
              aria-label={`Ver valor em ${pt.label}: ${formatCurrency(pt.val)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
