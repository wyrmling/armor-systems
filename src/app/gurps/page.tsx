'use client';

import { useState } from 'react';
import RangedCombat from '../../gurps/components/RangedCombat';
import MeleeCombat from '../../gurps/components/MeleeCombat';

type CombatMode = 'ranged' | 'melee';

export default function GurpsPage() {
  const [combatMode, setCombatMode] = useState<CombatMode>('ranged');

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            ⚔️ GURPS 4ed Боевые Системы
          </h1>
          <p className="text-text-secondary">
            Симуляция боевых действий согласно правилам GURPS 4th Edition.
            Выберите тип боя для детального анализа механик.
          </p>
        </div>

        {/* Навигация между типами боя */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setCombatMode('ranged')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                combatMode === 'ranged'
                  ? 'bg-blue-600 text-white'
                  : 'bg-surface text-text-primary border border-border hover:bg-surface-secondary'
              }`}
            >
              🏹 Дальний бой
            </button>
            <button
              onClick={() => setCombatMode('melee')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                combatMode === 'melee'
                  ? 'bg-red-600 text-white'
                  : 'bg-surface text-text-primary border border-border hover:bg-surface-secondary'
              }`}
            >
              ⚔️ Ближний бой
            </button>
          </div>
        </div>

        {/* Информация о выбранном режиме */}
        <div className="mb-6 bg-surface p-4 rounded-lg border border-border">
          {combatMode === 'ranged' ? (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-text-primary">🏹 Дальний бой</h2>
              <p className="text-text-secondary mb-2">
                Полная реализация правил дальнего боя GURPS 4ed с учетом:
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• <strong>Дистанционные модификаторы</strong> - точная таблица Range and Speed/Range Table</li>
                <li>• <strong>Скорость цели</strong> - от неподвижной до спринта</li>
                <li>• <strong>Размер цели (SM)</strong> - от микроскопического до колоссального</li>
                <li>• <strong>Прицеливание (Aim)</strong> - бонус Accuracy оружия</li>
                <li>• <strong>1/2D и Max range</strong> - снижение урона и максимальная дальность</li>
                <li>• <strong>Типы урона</strong> - pi-, pi, pi+, pi++, cr с правильными модификаторами</li>
              </ul>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-text-primary">⚔️ Ближний бой</h2>
              <p className="text-text-secondary mb-2">
                Полная реализация правил ближнего боя GURPS 4ed с учетом:
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• <strong>Досягаемость оружия</strong> - взаимодействие между разными типами оружия</li>
                <li>• <strong>Типы атак</strong> - всесторонние, осторожные, обманные удары</li>
                <li>• <strong>Положение бойцов</strong> - стоя, сидя, лёжа с соответствующими модификаторами</li>
                <li>• <strong>Тактические ситуации</strong> - атаки сзади, фланг, схватка, теснота</li>
                <li>• <strong>Типы урона</strong> - cut, imp, cr, pi- с правильными множителями</li>
                <li>• <strong>Особые эффекты</strong> - критические травмы для разных локаций</li>
              </ul>
            </div>
          )}
        </div>

        {/* Компонент для выбранного режима */}
        {combatMode === 'ranged' ? <RangedCombat /> : <MeleeCombat />}
      </div>
    </div>
  );
}
