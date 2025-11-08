'use client';

import { DamageDistribution, WeaponAnalysisData } from '@/gurps/analytics';

interface CompareDamageChartProps {
  weapons: WeaponAnalysisData[];
}

const COLORS = [
  '#7dc4ff', // Blue
  '#a6e3a1', // Green
  '#f38ba8', // Pink
  '#f9e2af', // Yellow
  '#cba6f7', // Purple
  '#fab387', // Orange
  '#89b4fa', // Light Blue
  '#b4befe', // Lavender
];

export function CompareDamageChart({ weapons }: CompareDamageChartProps) {
  if (!weapons || weapons.length === 0) {
    return <p className="text-text-secondary">Выберите оружие для сравнения.</p>;
  }

  // Определяем общий диапазон урона и максимальную вероятность
  let maxDamageValue = 0;
  let maxProbability = 0;

  weapons.forEach(weapon => {
    weapon.distribution.forEach(d => {
      if (d.value > maxDamageValue) maxDamageValue = d.value;
      if (d.probability > maxProbability) maxProbability = d.probability;
    });
  });

  const fullRange = Array.from({ length: maxDamageValue + 1 }, (_, i) => i);

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        {fullRange.map(value => (
          <div key={value} className="flex items-center gap-2 text-sm">
            <div className="w-8 text-right font-mono text-text-secondary">{value}</div>
            <div className="flex-1 bg-background rounded h-5 relative">
              {weapons.map((weapon, index) => {
                const probability = weapon.distribution.find(d => d.value === value)?.probability || 0;
                const barWidth = maxProbability > 0 ? (probability / maxProbability) * 100 : 0;
                const color = COLORS[index % COLORS.length];

                return (
                  <div
                    key={`${weapon.name}-${value}`}
                    className="absolute top-0 left-0 h-full rounded transition-all duration-300 opacity-70"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: color,
                      zIndex: weapons.length - index, // Чтобы верхние графики были поверх нижних
                    }}
                    title={`${weapon.name}: ${(probability * 100).toFixed(2)}%`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Легенда */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {weapons.map((weapon, index) => (
          <div key={weapon.name} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span>{weapon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
