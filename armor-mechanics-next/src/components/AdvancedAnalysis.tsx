'use client';

import { useState } from 'react';
import type { Mechanic, VariabilityStats, OptimalArmorResult } from '@/types/mechanics';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChartCanvas } from '@/components/ChartCanvas';
import {
  createDamageFunction,
  findOptimalArmor,
  analyzeVariability,
  calculateEfficiencyMetrics
} from '@/utils/analytics';

interface AdvancedAnalysisProps {
  mechanic: Mechanic;
}

export function AdvancedAnalysis({ mechanic }: AdvancedAnalysisProps) {
  const [analysisParams, setAnalysisParams] = useState({
    minArmor: 0,
    maxArmor: 50,
    testDamage: 30,
    armorCost: 1,
    // Параметры для различных механик
    k: 100, // для diminish
    dt: 5,  // для dt_dr
    drp: 25, // для dt_dr и percent
    attackBonus: 10, // для ac
    baseAC: 10 // для ac
  });

  const [variabilityParams, setVariabilityParams] = useState({
    trials: 1000
  });

  const [analysisResult, setAnalysisResult] = useState<OptimalArmorResult | null>(null);
  const [variabilityResult, setVariabilityResult] = useState<VariabilityStats | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [variabilityText, setVariabilityText] = useState('');

  const handleAnalysisParamChange = (key: string, value: number) => {
    setAnalysisParams(prev => ({ ...prev, [key]: value }));
  };

  const handleVariabilityParamChange = (key: string, value: number) => {
    setVariabilityParams(prev => ({ ...prev, [key]: value }));
  };

  const runEfficiencyAnalysis = () => {
    try {
      const { minArmor, maxArmor, testDamage, armorCost, k, dt, drp, attackBonus, baseAC } = analysisParams;

      // Создаем функцию урона для текущей механики
      const damageFunction = createDamageFunction(mechanic.key, {
        k, dt, drp, attackBonus, baseAC
      });

      const data = calculateEfficiencyMetrics(
        damageFunction,
        [minArmor, maxArmor],
        testDamage
      );

      const result = findOptimalArmor(data);
      setAnalysisResult(result);

      // Расчет дополнительных метрик для отчета
      const costAtOptimal = result.optimal * armorCost;
      const diminishingCost = result.diminishingPoint * armorCost;
      const effectivenessYs = result.data.map(d => d.effectiveness * 100);
      const survivabilityYs = result.data.map(d => Math.min(d.survivability, 100));
      const avgEffectiveness = effectivenessYs.reduce((a, b) => a + b, 0) / effectivenessYs.length;
      const maxSurvivability = Math.max(...survivabilityYs);

      const report = `🎯 РЕЗУЛЬТАТЫ АНАЛИЗА:

💡 Оптимальная броня: ${result.optimal} ед. (эффективность: ${(result.maxEfficiency * 100).toFixed(1)}%)
💰 Стоимость оптимального билда: ${costAtOptimal.toFixed(1)} ед.

📉 Точка убывающей отдачи: ${result.diminishingPoint} ед. брони
💸 Стоимость до точки убывания: ${diminishingCost.toFixed(1)} ед.

📊 Средняя эффективность в диапазоне: ${avgEffectiveness.toFixed(1)}%
🛡️ Максимальная выживаемость: ${maxSurvivability.toFixed(0)} ударов

💎 РЕКОМЕНДАЦИИ:
• Для бюджетного билда: ${Math.min(result.optimal, result.diminishingPoint)} ед. брони
• Для максимальной эффективности: ${result.optimal} ед. брони
• Не рекомендуется превышать: ${result.diminishingPoint} ед. брони`;

      setAnalysisText(report);
    } catch (error) {
      setAnalysisText(`Ошибка анализа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const runVariabilityAnalysis = () => {
    try {
      // Получаем текущие значения параметров механики
      const defaultParams: Record<string, any> = {};
      mechanic.inputs.forEach(input => {
        defaultParams[input.key] = input.value;
      });

      const result = analyzeVariability(mechanic, defaultParams, variabilityParams.trials);
      setVariabilityResult(result);

      // Формируем текстовый отчет
      const report = [
        `📊 Анализ вариативности для "${mechanic.name}"`,
        `Симуляций: ${variabilityParams.trials}`,
        ``,
        `📈 Статистика урона:`,
        `• Среднее: ${result.mean.toFixed(2)}`,
        `• Медиана: ${result.median.toFixed(2)}`,
        `• Стандартное отклонение: ${result.stdDev.toFixed(2)}`,
        `• Коэффициент вариации: ${(result.cv * 100).toFixed(1)}%`,
        ``,
        `📊 Распределение:`,
        `• Минимум: ${result.min.toFixed(2)}`,
        `• Q25: ${result.q25.toFixed(2)}`,
        `• Q75: ${result.q75.toFixed(2)}`,
        `• Максимум: ${result.max.toFixed(2)}`,
        `• IQR: ${result.iqr.toFixed(2)}`,
        ``,
        `💡 Интерпретация:`,
        result.cv < 0.1
          ? `• Низкая вариативность - предсказуемый урон`
          : result.cv < 0.3
          ? `• Умеренная вариативность - есть элемент случайности`
          : `• Высокая вариативность - значительный разброс результатов`
      ];

      setVariabilityText(report.join('\n'));
    } catch (error) {
      setVariabilityText(`Ошибка анализа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Проверяем, поддерживается ли расширенная аналитика для данной механики
  const supportedForAnalysis = ['flatdr', 'percentdr', 'diminish', 'dt_dr', 'ac', 'shield'];
  const supportedForVariability = ['soak', 'ac'];

  const supportsEfficiencyAnalysis = supportedForAnalysis.includes(mechanic.key);
  const supportsVariabilityAnalysis = supportedForVariability.includes(mechanic.key);

  if (!supportsEfficiencyAnalysis && !supportsVariabilityAnalysis) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-text-accent mb-4">
        📊 Расширенный анализ
      </h3>

      {supportsEfficiencyAnalysis && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-text-primary mb-3">
            🎯 Анализ эффективности брони
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              label="Мин. броня"
              type="number"
              value={analysisParams.minArmor}
              onChange={(e) => handleAnalysisParamChange('minArmor', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Макс. броня"
              type="number"
              value={analysisParams.maxArmor}
              onChange={(e) => handleAnalysisParamChange('maxArmor', parseFloat(e.target.value) || 50)}
            />
            <Input
              label="Тестовый урон"
              type="number"
              value={analysisParams.testDamage}
              onChange={(e) => handleAnalysisParamChange('testDamage', parseFloat(e.target.value) || 30)}
            />
            <Input
              label="Стоимость за ед."
              type="number"
              value={analysisParams.armorCost}
              onChange={(e) => handleAnalysisParamChange('armorCost', parseFloat(e.target.value) || 1)}
            />
          </div>

          {/* Дополнительные параметры в зависимости от механики */}
          {(mechanic.key === 'diminish' || mechanic.key === 'dt_dr' || mechanic.key === 'ac' || mechanic.key === 'percentdr') && (
            <div className="bg-background border border-border rounded-lg p-4 mb-4">
              <h5 className="text-sm font-medium text-text-primary mb-3">⚙️ Параметры механики</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mechanic.key === 'diminish' && (
                  <Input
                    label="K (константа убывания)"
                    type="number"
                    value={analysisParams.k}
                    onChange={(e) => handleAnalysisParamChange('k', parseFloat(e.target.value) || 100)}
                  />
                )}
                {mechanic.key === 'dt_dr' && (
                  <>
                    <Input
                      label="DT (порог урона)"
                      type="number"
                      value={analysisParams.dt}
                      onChange={(e) => handleAnalysisParamChange('dt', parseFloat(e.target.value) || 5)}
                    />
                    <Input
                      label="DR % (процент снижения)"
                      type="number"
                      value={analysisParams.drp}
                      onChange={(e) => handleAnalysisParamChange('drp', parseFloat(e.target.value) || 25)}
                    />
                  </>
                )}
                {mechanic.key === 'percentdr' && (
                  <Input
                    label="DR % (процент снижения)"
                    type="number"
                    value={analysisParams.drp}
                    onChange={(e) => handleAnalysisParamChange('drp', parseFloat(e.target.value) || 25)}
                  />
                )}
                {mechanic.key === 'ac' && (
                  <>
                    <Input
                      label="Базовый AC"
                      type="number"
                      value={analysisParams.baseAC}
                      onChange={(e) => handleAnalysisParamChange('baseAC', parseFloat(e.target.value) || 10)}
                    />
                    <Input
                      label="Бонус атаки"
                      type="number"
                      value={analysisParams.attackBonus}
                      onChange={(e) => handleAnalysisParamChange('attackBonus', parseFloat(e.target.value) || 10)}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          <Button onClick={runEfficiencyAnalysis} className="mb-4">
            🔍 Анализировать эффективность
          </Button>

          {analysisText && (
            <div className="bg-background border border-border rounded-lg p-4 mb-4">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">
                {analysisText}
              </pre>
            </div>
          )}

          {analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartCanvas
                type="multiline"
                height={300}
                series={[
                  {
                    label: 'Эффективность %',
                    xs: analysisResult.data.map(d => d.armor),
                    ys: analysisResult.data.map(d => d.effectiveness * 100),
                    color: '#7dc4ff',
                  },
                  {
                    label: 'Выживаемость (удары)',
                    xs: analysisResult.data.map(d => d.armor),
                    ys: analysisResult.data.map(d => Math.min(d.survivability, 100)),
                    color: '#a6e3a1',
                  }
                ]}
                options={{
                  yLabel: 'Эффективность / Выживаемость',
                  xLabel: 'Броня',
                  showOptimal: true,
                  optimalPoint: {
                    x: analysisResult.optimal,
                    y: (analysisResult.data.find(d => d.armor === analysisResult.optimal)?.effectiveness || 0) * 100
                  }
                }}
              />
              <ChartCanvas
                type="line"
                height={300}
                xs={analysisResult.data.map(d => d.armor)}
                ys={analysisResult.data.map(d => d.efficiency * 100)}
                options={{
                  color: '#f9e2af',
                  yLabel: 'Эффективность на ед. брони %',
                  showPoints: true
                }}
              />
            </div>
          )}
        </div>
      )}

      {supportsVariabilityAnalysis && (
        <div>
          <h4 className="text-md font-medium text-text-primary mb-3">
            📊 Анализ вариативности урона
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Количество симуляций"
              type="number"
              value={variabilityParams.trials}
              onChange={(e) => handleVariabilityParamChange('trials', parseFloat(e.target.value) || 1000)}
            />
          </div>

          <Button onClick={runVariabilityAnalysis} className="mb-4">
            📊 Анализировать вариативность
          </Button>

          {variabilityText && (
            <div className="bg-background border border-border rounded-lg p-4">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">
                {variabilityText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}