import React from 'react';

// Simple horizontal bar chart using SVG, no external libs
export default function Chart({ data }) {
  const max = Math.max(1, ...data.map(d => d.value));
  const width = 400;
  const barHeight = 20;
  const gap = 10;
  const height = data.length * (barHeight + gap) + gap;

  return (
    <svg width={width} height={height} role="img" aria-label="Statistics chart">
      {data.map((d, i) => {
        const w = (d.value / max) * (width - 100);
        const y = i * (barHeight + gap) + gap;
        return (
          <g key={d.label} transform={`translate(80, ${y})`}>
            <rect width={w} height={barHeight} rx="4" className="fill-accent" />
            <text x={-10} y={barHeight/2} dominantBaseline="middle" textAnchor="end" className="fill-gray-800 text-sm">{d.label}</text>
            <text x={w + 6} y={barHeight/2} dominantBaseline="middle" className="fill-gray-700 text-xs">{d.value.toFixed(2)}</text>
          </g>
        );
      })}
    </svg>
  );
}


