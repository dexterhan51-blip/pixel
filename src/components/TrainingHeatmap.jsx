import React, { useMemo, useState } from 'react';
import { aggregateByDate } from '../utils/gameData';

const CELL_SIZE = 11;
const CELL_GAP = 2;
const WEEKS = 53;
const DAYS = 7;

function getColor(minutes, baseColor) {
  if (minutes === 0) return '#F4F4F4';
  if (minutes <= 30) return `${baseColor}40`;  // 25% opacity
  if (minutes <= 60) return `${baseColor}80`;  // 50% opacity
  return baseColor;                             // full
}

export default function TrainingHeatmap({ logs, gearColor = '#2a9d8f' }) {
  const [tooltip, setTooltip] = useState(null);

  const { cells, monthLabels } = useMemo(() => {
    const dateMap = aggregateByDate(logs);
    const today = new Date();
    const cells = [];
    const monthLabels = [];

    // Start from 52 weeks ago, aligned to Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS - 1) * 7 - start.getDay());

    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < DAYS; day++) {
        const d = new Date(start);
        d.setDate(d.getDate() + week * 7 + day);
        if (d > today) continue;

        const dateStr = d.toISOString().split('T')[0];
        const minutes = dateMap.get(dateStr) || 0;

        // Track month labels
        if (d.getMonth() !== lastMonth) {
          lastMonth = d.getMonth();
          monthLabels.push({
            label: `${d.getMonth() + 1}월`,
            x: week * (CELL_SIZE + CELL_GAP),
          });
        }

        cells.push({
          x: week * (CELL_SIZE + CELL_GAP),
          y: day * (CELL_SIZE + CELL_GAP),
          dateStr,
          minutes,
          color: getColor(minutes, gearColor),
        });
      }
    }

    return { cells, monthLabels };
  }, [logs, gearColor]);

  const svgWidth = WEEKS * (CELL_SIZE + CELL_GAP);
  const svgHeight = DAYS * (CELL_SIZE + CELL_GAP) + 20; // extra for month labels

  return (
    <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
      <p className="text-[#191F28] text-base font-bold mb-1">지난 1년 훈련 현황</p>
      <p className="text-[#B0B8C1] text-xs mb-4">색이 진할수록 오래 운동했어요</p>
      <div className="overflow-x-auto -mx-2 px-2">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="block"
          onMouseLeave={() => setTooltip(null)}
          onTouchEnd={() => setTooltip(null)}
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={m.x}
              y={10}
              fontSize={9}
              fill="#B0B8C1"
              fontWeight="500"
            >
              {m.label}
            </text>
          ))}

          {/* Cells */}
          {cells.map((cell, i) => (
            <rect
              key={i}
              x={cell.x}
              y={cell.y + 16}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              fill={cell.color}
              className="cursor-pointer"
              onMouseEnter={() => setTooltip(cell)}
              onTouchStart={() => setTooltip(cell)}
            />
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 text-xs text-[#8B95A1]">
          {tooltip.dateStr} · {tooltip.minutes > 0 ? `${tooltip.minutes}분 운동` : '운동 없음'}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-[#B0B8C1] mr-1">적음</span>
        {[0, 30, 60, 90].map((min) => (
          <div
            key={min}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getColor(min, gearColor) }}
          />
        ))}
        <span className="text-[10px] text-[#B0B8C1] ml-1">많음</span>
      </div>
    </div>
  );
}
