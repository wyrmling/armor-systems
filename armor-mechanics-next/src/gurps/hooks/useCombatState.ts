import { useState } from 'react';

export interface HitLocation {
  name: string;
  penalty: number;
  vitality: number;
  armorDivisor: number;
}

export const HIT_LOCATIONS: HitLocation[] = [
  { name: 'Череп', penalty: -7, vitality: 4, armorDivisor: 1 },
  { name: 'Лицо', penalty: -5, vitality: 1, armorDivisor: 1 },
  { name: 'Шея', penalty: -5, vitality: 2, armorDivisor: 1 },
  { name: 'Торс', penalty: 0, vitality: 1, armorDivisor: 1 },
  { name: 'Пах', penalty: -3, vitality: 1, armorDivisor: 1 },
  { name: 'Рука', penalty: -2, vitality: 0.5, armorDivisor: 1 },
  { name: 'Нога', penalty: -2, vitality: 0.5, armorDivisor: 1 },
  { name: 'Кисть', penalty: -4, vitality: 0.25, armorDivisor: 1 },
  { name: 'Стопа', penalty: -4, vitality: 0.25, armorDivisor: 1 }
];

export interface CombatState {
  // Базовые параметры атакующего
  attackerSkill: number;
  setAttackerSkill: (value: number) => void;
  baseDamage: string;
  setBaseDamage: (value: string) => void;

  // Параметры цели
  armorValue: number;
  setArmorValue: (value: number) => void;
  targetLocation: HitLocation;
  setTargetLocation: (location: HitLocation) => void;
  isRandomLocation: boolean;
  setIsRandomLocation: (value: boolean) => void;

  // HP система
  targetMaxHP: number;
  setTargetMaxHP: (value: number) => void;
  targetCurrentHP: number;
  setTargetCurrentHP: (value: number) => void;

  // Результаты боя
  combatResults: any[];
  setCombatResults: (results: any[]) => void;

  // Функции управления
  runSimulation: (count: number) => void;
  clearResults: () => void;
  fullHeal: () => void;
}

export function useCombatState<T>(simulateAttack: (currentHP: number) => T): CombatState {
  const [attackerSkill, setAttackerSkill] = useState(12);
  const [baseDamage, setBaseDamage] = useState("2d+1");
  const [armorValue, setArmorValue] = useState(4);
  const [targetLocation, setTargetLocation] = useState(HIT_LOCATIONS[3]); // Торс по умолчанию
  const [isRandomLocation, setIsRandomLocation] = useState(false);
  const [targetMaxHP, setTargetMaxHP] = useState(10);
  const [targetCurrentHP, setTargetCurrentHP] = useState(10);
  const [combatResults, setCombatResults] = useState<T[]>([]);

  const runSimulation = (count: number = 1) => {
    const results: T[] = [];
    let currentHP = targetCurrentHP; // Локальное отслеживание HP

    for (let i = 0; i < count; i++) {
      const result = simulateAttack(currentHP) as any;
      results.push(result);

      // Если результат содержит информацию о новых HP, обновляем локальную переменную
      if (result && result.injuryResult && typeof result.injuryResult.newHP === 'number') {
        currentHP = result.injuryResult.newHP;
      }
    }

    // Обновляем состояние только один раз в конце
    setTargetCurrentHP(currentHP);
    setCombatResults(prev => [...prev, ...results].slice(-20)); // Показываем последние 20
  };

  const clearResults = () => {
    setCombatResults([]);
  };

  const fullHeal = () => {
    setTargetCurrentHP(targetMaxHP);
  };

  return {
    attackerSkill,
    setAttackerSkill,
    baseDamage,
    setBaseDamage,
    armorValue,
    setArmorValue,
    targetLocation,
    setTargetLocation,
    isRandomLocation,
    setIsRandomLocation,
    targetMaxHP,
    setTargetMaxHP,
    targetCurrentHP,
    setTargetCurrentHP,
    combatResults,
    setCombatResults,
    runSimulation,
    clearResults,
    fullHeal,
  };
}