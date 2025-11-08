'use client';

import { useState, useMemo } from 'react';
import { rangedWeapons, meleeWeapons } from '@/gurps/data/weapons';
import { analyzeWeapons, WeaponAnalysisData } from '@/gurps/analytics';
import { DamageDistributionChart } from '@/components/DamageDistributionChart';
import { CompareDamageChart } from '@/components/CompareDamageChart';

function WeaponCard({
  weapon,
  onCompareToggle,
  isSelected,
}: {
  weapon: WeaponAnalysisData;
  onCompareToggle: (weapon: WeaponAnalysisData) => void;
  isSelected: boolean;
}) {
  return (
    <div className={`bg-surface p-4 rounded-lg border ${isSelected ? 'border-blue-500' : 'border-border'} flex flex-col`}>
      <div>
        <h3 className="font-bold text-lg text-text-primary">{weapon.name}</h3>
        <p className="text-sm text-text-secondary mb-1">
          Урон: {weapon.damage} ({weapon.damageType})
        </p>
        <p className="text-xs text-text-secondary mb-2">Категория: {weapon.category}</p>
        <div className="text-sm text-text-primary">
          <p>Средний урон: {weapon.stats.mean.toFixed(2)}</p>
          <p>Ст. отклонение: {weapon.stats.stdDev.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 flex-grow">
        <DamageDistributionChart distribution={weapon.distribution} />
      </div>
      <button
        onClick={() => onCompareToggle(weapon)}
        className={`mt-4 px-4 py-2 rounded font-medium text-white ${isSelected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isSelected ? 'Убрать из сравнения' : 'Сравнить'}
      </button>
    </div>
  );
}

export default function WeaponsPage() {
  const [strength, setStrength] = useState(10);
  const [selectedWeaponsForComparison, setSelectedWeaponsForComparison] = useState<WeaponAnalysisData[]>([]);

  const handleCompareToggle = (weaponToToggle: WeaponAnalysisData) => {
    setSelectedWeaponsForComparison(prevSelected => {
      if (prevSelected.some(w => w.name === weaponToToggle.name)) {
        return prevSelected.filter(w => w.name !== weaponToToggle.name);
      } else {
        return [...prevSelected, weaponToToggle];
      }
    });
  };

  const rangedAnalysis = useMemo(() => analyzeWeapons(rangedWeapons, strength), [strength]);
  const meleeAnalysis = useMemo(() => analyzeWeapons(meleeWeapons, strength), [strength]);

  const allWeapons = useMemo(() => [...rangedAnalysis, ...meleeAnalysis], [rangedAnalysis, meleeAnalysis]);

  const weaponsToCompare = useMemo(() => {
    return selectedWeaponsForComparison.map(selectedWeapon => {
      // Find the latest analysis data for the selected weapon based on current strength
      return allWeapons.find(aw => aw.name === selectedWeapon.name) || selectedWeapon;
    });
  }, [selectedWeaponsForComparison, allWeapons]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          ⚔️ Анализ Оружия GURPS
        </h1>
        <p className="text-text-secondary">
          Визуализация и сравнение распределения урона для различного оружия.
        </p>
      </div>

      <div className="bg-surface p-4 rounded-lg border border-border mb-6 sticky top-4 z-10">
        <label htmlFor="strength-slider" className="block text-lg font-medium mb-2">
          Сила (ST): {strength}
        </label>
        <input
          id="strength-slider"
          type="range"
          min="1"
          max="20"
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <p className="text-sm text-text-secondary mt-2">
          Этот параметр влияет на урон оружия ближнего боя (основанного на thr/sw).
        </p>
      </div>

      {weaponsToCompare.length > 0 && (
        <div className="bg-surface p-4 rounded-lg border border-border mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Сравнение оружия</h2>
          <CompareDamageChart weapons={weaponsToCompare} />
          <div className="mt-4 flex flex-wrap gap-2">
            {weaponsToCompare.map(w => (
              <span key={w.name} className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {w.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Дальнобойное оружие</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rangedAnalysis.map(weapon => (
            <WeaponCard
              key={weapon.name}
              weapon={weapon}
              onCompareToggle={handleCompareToggle}
              isSelected={selectedWeaponsForComparison.some(w => w.name === weapon.name)}
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Оружие ближнего боя</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {meleeAnalysis.map(weapon => (
            <WeaponCard
              key={weapon.name}
              weapon={weapon}
              onCompareToggle={handleCompareToggle}
              isSelected={selectedWeaponsForComparison.some(w => w.name === weapon.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
