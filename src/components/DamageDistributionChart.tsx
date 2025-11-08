'use client';

import { DamageDistribution } from '@/gurps/analytics';

interface DamageDistributionChartProps {
  distribution: DamageDistribution[];
}

export function DamageDistributionChart({ distribution }: DamageDistributionChartProps) {
  if (!distribution || distribution.length === 0) {
    return <p className="text-text-secondary">Нет данных для отображения.</p>;
  }

  // Находим максимальную вероятность для масштабирования полос
  const maxProbability = Math.max(...distribution.map(d => d.probability), 0);

  // Создаем полный диапазон значений от 0 до максимального урона
  const maxDamageValue = Math.max(...distribution.map(d => d.value), 0);
  const fullRange = Array.from({ length: maxDamageValue + 1 }, (_, i) => i);

  const distributionMap = new Map(distribution.map(d => [d.value, d.probability]));

  return (
    <div className="mt-4 space-y-1">
      {fullRange.map(value => {
        const probability = distributionMap.get(value) || 0;
        const barWidth = maxProbability > 0 ? (probability / maxProbability) * 100 : 0;

        return (
          <div key={value} className="flex items-center gap-2 text-sm">
            <div className="w-8 text-right font-mono text-text-secondary">{value}</div>
            <div className="flex-1 bg-background rounded h-5">
              <div
                className="h-full bg-blue-600/70 rounded transition-all duration-300"
                style={{ width: `${barWidth}%` }}
                title={`Вероятность: ${(probability * 100).toFixed(2)}%`}
              />
            </div>
            <div className="w-16 text-left font-mono text-text-primary">
              {(probability * 100).toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
