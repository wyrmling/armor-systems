'use client';

import { useState } from 'react';
import { roll3d6 } from '../../gurps/combat';
import { getDamageDistribution } from '../../gurps/analytics';

interface DiceResult {
  value: number;
  count: number;
  percentage: number;
  theoretical: number;
}

/**
 * Генерирует равномерное распределение от 3 до 18 (НЕПРАВИЛЬНО для GURPS!)
 * Оставлено для сравнения и демонстрации разницы
 * @returns Результат равномерного распределения
 */
function rollFlat3to18(): number {
  return Math.floor(Math.random() * 16) + 3;
}

/**
 * Генерирует бросок 1d20 (как в D&D)
 * @returns Результат броска одной двадцатигранной кости
 */
function roll1d20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Генерирует бросок 2d10 (как в некоторых системах)
 * @returns Результат броска двух десятигранных костей
 */
function roll2d10(): number {
  const die1 = Math.floor(Math.random() * 10) + 1;
  const die2 = Math.floor(Math.random() * 10) + 1;
  return die1 + die2;
}

/**
 * Генерирует бросок 1d100 (процентильные кости)
 * @returns Результат броска процентильных костей (1-100)
 */
function roll1d100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

// Теоретические вероятности для 3d6 через analytics
const theoretical3d6Distribution = getDamageDistribution({ dice: 3, sides: 6, modifier: 0 });
const theoretical3d6 = new Map(theoretical3d6Distribution.map(d => [d.value, d.probability]));

// Теоретические вероятности для равномерного распределения (1d16+2)
const theoreticalFlatDistribution = getDamageDistribution({ dice: 1, sides: 16, modifier: 2 });
const theoreticalFlat = new Map(theoreticalFlatDistribution.map(d => [d.value, d.probability]));

export default function DiceAnalysis() {
  const [results3d6, setResults3d6] = useState<DiceResult[]>([]);
  const [resultsFlat, setResultsFlat] = useState<DiceResult[]>([]);
  const [sampleSize, setSampleSize] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);

  const runAnalysis = async (samples: number) => {
    setIsRunning(true);

    // Счетчики для результатов
    const counts3d6: { [key: number]: number } = {};
    const countsFlat: { [key: number]: number } = {};

    // Инициализация счетчиков
    for (let i = 3; i <= 18; i++) {
      counts3d6[i] = 0;
      countsFlat[i] = 0;
    }

    // Генерация выборки
    for (let i = 0; i < samples; i++) {
      const result3d6 = roll3d6();
      const resultFlat = rollFlat3to18();

      counts3d6[result3d6]++;
      countsFlat[resultFlat]++;

      // Обновляем UI каждые 1000 бросков для показа прогресса
      if (i % 1000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Преобразование в результаты
    const results3d6Data: DiceResult[] = [];
    const resultsFlatData: DiceResult[] = [];

    for (let i = 3; i <= 18; i++) {
      results3d6Data.push({
        value: i,
        count: counts3d6[i],
        percentage: (counts3d6[i] / samples) * 100,
        theoretical: (theoretical3d6.get(i) || 0) * 100
      });

      resultsFlatData.push({
        value: i,
        count: countsFlat[i],
        percentage: (countsFlat[i] / samples) * 100,
        theoretical: (theoreticalFlat.get(i) || 0) * 100
      });
    }

    setResults3d6(results3d6Data);
    setResultsFlat(resultsFlatData);
    setIsRunning(false);
  };

  const getDifferenceColor = (actual: number, theoretical: number) => {
    const diff = Math.abs(actual - theoretical);
    if (diff < 0.5) return 'text-green-400';
    if (diff < 1.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarHeight = (percentage: number, maxPercentage: number) => {
    return Math.max(2, (percentage / maxPercentage) * 100);
  };

  const max3d6Percentage = Math.max(...results3d6.map(r => Math.max(r.percentage, r.theoretical)));
  const maxFlatPercentage = Math.max(...resultsFlat.map(r => Math.max(r.percentage, r.theoretical)));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          🎲 Анализ распределений вероятностей костей
        </h1>
        <p className="text-text-secondary">
          Сравнение правильного броска 3d6 с неправильным равномерным распределением.
          Демонстрация важности корректной реализации бросков в игровых системах.
        </p>
      </div>

      {/* Контроли */}
      <div className="bg-surface p-4 rounded-lg border border-border mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Размер выборки:</label>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              disabled={isRunning}
              className="p-2 border border-border rounded bg-background"
            >
              <option value={1000}>1,000</option>
              <option value={10000}>10,000</option>
              <option value={100000}>100,000</option>
              <option value={1000000}>1,000,000</option>
            </select>
          </div>
          <button
            onClick={() => runAnalysis(sampleSize)}
            disabled={isRunning}
            className={`px-6 py-2 rounded font-medium ${
              isRunning
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? 'Анализ...' : 'Запустить анализ'}
          </button>
        </div>

        {/* Ключевые метрики */}
        {results3d6.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-background p-3 rounded border">
              <div className="font-medium text-text-primary">Критические попадания (3-4)</div>
              <div className="text-green-400">3d6: {(results3d6[0].percentage + results3d6[1].percentage).toFixed(2)}%</div>
              <div className="text-red-400">Равномерно: {(resultsFlat[0].percentage + resultsFlat[1].percentage).toFixed(2)}%</div>
              <div className="text-text-secondary text-xs">Теория: 1.85%</div>
            </div>
            <div className="bg-background p-3 rounded border">
              <div className="font-medium text-text-primary">Критические промахи (17-18)</div>
              <div className="text-green-400">3d6: {(results3d6[14].percentage + results3d6[15].percentage).toFixed(2)}%</div>
              <div className="text-red-400">Равномерно: {(resultsFlat[14].percentage + resultsFlat[15].percentage).toFixed(2)}%</div>
              <div className="text-text-secondary text-xs">Теория: 1.85%</div>
            </div>
            <div className="bg-background p-3 rounded border">
              <div className="font-medium text-text-primary">Средние броски (10-11)</div>
              <div className="text-green-400">3d6: {(results3d6[7].percentage + results3d6[8].percentage).toFixed(2)}%</div>
              <div className="text-red-400">Равномерно: {(resultsFlat[7].percentage + resultsFlat[8].percentage).toFixed(2)}%</div>
              <div className="text-text-secondary text-xs">Теория: 25.0%</div>
            </div>
            <div className="bg-background p-3 rounded border">
              <div className="font-medium text-text-primary">Выборка</div>
              <div className="text-text-primary">{sampleSize.toLocaleString()}</div>
              <div className="text-text-secondary text-xs">бросков</div>
            </div>
          </div>
        )}
      </div>

      {/* Результаты */}
      {results3d6.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3d6 - ПРАВИЛЬНОЕ распределение */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-green-400">
              ✅ 3d6 (Правильное распределение)
            </h3>
            <div className="space-y-2 mb-4">
              {results3d6.map((result) => (
                <div key={result.value} className="flex items-center gap-2 text-sm">
                  <div className="w-6 text-center font-mono">{result.value}</div>
                  <div className="flex-1 bg-background rounded overflow-hidden h-6 relative">
                    <div
                      className="h-full bg-green-600/70 transition-all duration-300"
                      style={{ width: `${getBarHeight(result.percentage, max3d6Percentage)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full border-r-2 border-yellow-400 transition-all duration-300"
                      style={{ left: `${getBarHeight(result.theoretical, max3d6Percentage)}%` }}
                      title="Теоретическое значение"
                    />
                  </div>
                  <div className="w-16 text-right font-mono">
                    <span className={getDifferenceColor(result.percentage, result.theoretical)}>
                      {result.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-16 text-right font-mono text-text-secondary text-xs">
                    {result.theoretical.toFixed(2)}%
                  </div>
                  <div className="w-12 text-right font-mono text-text-secondary text-xs">
                    {result.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-text-secondary">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-2 bg-green-600/70"></div>
                <span>Фактическое распределение</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 border-r-2 border-yellow-400"></div>
                <span>Теоретическое распределение</span>
              </div>
            </div>
          </div>

          {/* Равномерное - НЕПРАВИЛЬНОЕ распределение */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-red-400">
              ❌ Равномерное (Неправильное распределение)
            </h3>
            <div className="space-y-2 mb-4">
              {resultsFlat.map((result) => (
                <div key={result.value} className="flex items-center gap-2 text-sm">
                  <div className="w-6 text-center font-mono">{result.value}</div>
                  <div className="flex-1 bg-background rounded overflow-hidden h-6 relative">
                    <div
                      className="h-full bg-red-600/70 transition-all duration-300"
                      style={{ width: `${getBarHeight(result.percentage, maxFlatPercentage)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full border-r-2 border-yellow-400 transition-all duration-300"
                      style={{ left: `${getBarHeight(result.theoretical, maxFlatPercentage)}%` }}
                      title="Теоретическое значение"
                    />
                  </div>
                  <div className="w-16 text-right font-mono">
                    <span className={getDifferenceColor(result.percentage, result.theoretical)}>
                      {result.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-16 text-right font-mono text-text-secondary text-xs">
                    {result.theoretical.toFixed(2)}%
                  </div>
                  <div className="w-12 text-right font-mono text-text-secondary text-xs">
                    {result.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-text-secondary">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-2 bg-red-600/70"></div>
                <span>Фактическое распределение</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 border-r-2 border-yellow-400"></div>
                <span>Теоретическое распределение</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Объяснение */}
      <div className="mt-6 bg-surface p-4 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-3">📚 Почему это важно?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-400 mb-2">✅ Правильный 3d6:</h4>
            <ul className="space-y-1 text-text-secondary">
              <li>• Средние результаты (10-11) встречаются ~25% времени</li>
              <li>• Критические события (3-4, 17-18) редки (~1.85% каждый)</li>
              <li>• Колоколообразное распределение</li>
              <li>• Предсказуемые вероятности</li>
              <li>• Соответствует правилам GURPS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-400 mb-2">❌ Неправильное равномерное:</h4>
            <ul className="space-y-1 text-text-secondary">
              <li>• Все результаты равновероятны (6.25%)</li>
              <li>• Критические события в 3-4 раза чаще!</li>
              <li>• Плоское распределение</li>
              <li>• Нарушает баланс игры</li>
              <li>• Не соответствует правилам GURPS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}