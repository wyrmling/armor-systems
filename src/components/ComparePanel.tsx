'use client';

import { useState, useEffect } from 'react';
import { mechanics } from '@/data/mechanics';
import { Input } from '@/components/ui/Input';
import { ChartCanvas } from '@/components/ChartCanvas';
import { createComparisonData } from '@/utils/analytics';
import type { ChartSeries } from '@/types/mechanics';

export function ComparePanel() {
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>(['flatdr', 'percentdr', 'diminish']);
  const [commonParams, setCommonParams] = useState({
    damage: 30,
    armor: 10,
    drp: 25,
    dt: 5,
    k: 100,
    baseAC: 10,
    attackBonus: 10
  });
  const [results, setResults] = useState<Array<{key: string, name: string, result: string}>>([]);
  const [chartSeries, setChartSeries] = useState<ChartSeries[]>([]);

  const handleMechanicToggle = (key: string) => {
    setSelectedMechanics(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleCompare = () => {
    const newResults: Array<{key: string, name: string, result: string}> = [];

    selectedMechanics.forEach(key => {
      const mechanic = mechanics.find(m => m.key === key);
      if (!mechanic) return;

      let result = '';
      try {
        let params: any = {};

        switch (key) {
          case 'flatdr':
            params = { damage: commonParams.damage, dr: commonParams.armor, min1: false };
            break;
          case 'percentdr':
            params = { damage: commonParams.damage, drp: commonParams.drp };
            break;
          case 'diminish':
            params = { damage: commonParams.damage, armor: commonParams.armor, k: commonParams.k };
            break;
          case 'dt_dr':
            params = { damage: commonParams.damage, dt: commonParams.dt, drp: commonParams.drp, min1: false };
            break;
          case 'ac':
            params = { attackBonus: 10, ac: 10 + commonParams.armor/2, baseDamage: commonParams.damage, d20: true };
            break;
          case 'soak':
            params = { dv: commonParams.damage, body: 2, armor: Math.round(commonParams.armor/3), poolMod: 0, pSuccess: 33.3, trials: 0 };
            break;
          default:
            result = '(нет адаптера для этой механики)';
        }

        if (result === '') {
          const res = mechanic.compute(params);
          result = typeof res === 'string' ? res : res.text || '';
        }
      } catch (e) {
        result = `Ошибка: ${e instanceof Error ? e.message : 'Неизвестная ошибка'}`;
      }

      newResults.push({ key, name: mechanic.name, result });
    });

    setResults(newResults);

    // Update chart data
    const series = createComparisonData(selectedMechanics, commonParams, [0, commonParams.armor * 2]);
    setChartSeries(series);
  };

  useEffect(() => {
    handleCompare();
  }, [selectedMechanics, commonParams]);

  const comparableMechanics = mechanics.filter(m => m.key !== 'compare' && ['flatdr', 'percentdr', 'diminish', 'dt_dr', 'ac', 'shield'].includes(m.key));

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-accent mb-4">
          Общие параметры
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Входящий урон"
            type="number"
            value={commonParams.damage}
            onChange={(e) => setCommonParams(prev => ({ ...prev, damage: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Armor/DR"
            type="number"
            value={commonParams.armor}
            onChange={(e) => setCommonParams(prev => ({ ...prev, armor: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="DR %"
            type="number"
            value={commonParams.drp}
            onChange={(e) => setCommonParams(prev => ({ ...prev, drp: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="DT (порог)"
            type="number"
            value={commonParams.dt}
            onChange={(e) => setCommonParams(prev => ({ ...prev, dt: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="K (для убывающей)"
            type="number"
            value={commonParams.k}
            onChange={(e) => setCommonParams(prev => ({ ...prev, k: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Базовый AC"
            type="number"
            value={commonParams.baseAC}
            onChange={(e) => setCommonParams(prev => ({ ...prev, baseAC: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Бонус атаки"
            type="number"
            value={commonParams.attackBonus}
            onChange={(e) => setCommonParams(prev => ({ ...prev, attackBonus: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-accent mb-4">
          Выберите механики для сравнения
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {comparableMechanics.map(mechanic => (
            <label key={mechanic.key} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border hover:border-text-accent/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMechanics.includes(mechanic.key)}
                onChange={() => handleMechanicToggle(mechanic.key)}
                className="w-4 h-4 text-text-accent bg-background border-border rounded focus:ring-text-accent/50"
              />
              <div>
                <div className="text-sm font-medium text-text-primary">{mechanic.name}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-accent mb-4">
            Результаты сравнения
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(({ key, name, result }) => (
              <div key={key} className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">{name}</h4>
                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                  {result}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartSeries.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-accent mb-4">
            График: Урон vs Броня
          </h3>
          <ChartCanvas
            type="multiline"
            series={chartSeries}
            height={300}
            options={{
              xLabel: 'Броня',
              yLabel: 'Оставшийся урон'
            }}
          />
        </div>
      )}
    </div>
  );
}
