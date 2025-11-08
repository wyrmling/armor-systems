import React from 'react';
import { rangedWeapons, meleeWeapons, type RangedWeapon, type MeleeWeapon } from '../../data/weapons';
import { HitLocation } from '../../hooks/useCombatState';
import { getAverageDamage, parseDamageString } from '@/gurps/combat';

interface HPControlsProps {
  targetMaxHP: number;
  setTargetMaxHP: (value: number) => void;
  targetCurrentHP: number;
  setTargetCurrentHP: (value: number) => void;
  onFullHeal: () => void;
}

export function HPControls({
  targetMaxHP,
  setTargetMaxHP,
  targetCurrentHP,
  setTargetCurrentHP,
  onFullHeal
}: HPControlsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Макс HP</label>
        <input
          type="number"
          value={targetMaxHP}
          onChange={(e) => {
            const newMaxHP = Number(e.target.value);
            setTargetMaxHP(newMaxHP);
            if (targetCurrentHP > newMaxHP) {
              setTargetCurrentHP(newMaxHP);
            }
          }}
          className="w-full p-2 border border-border rounded bg-background"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Текущие HP
          <span className={`ml-2 font-bold ${
            targetCurrentHP <= 0 ? 'text-red-500' :
            targetCurrentHP < Math.ceil(targetMaxHP / 3) ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            ({targetCurrentHP}/{targetMaxHP})
          </span>
        </label>
        <input
          type="number"
          value={targetCurrentHP}
          onChange={(e) => setTargetCurrentHP(Number(e.target.value))}
          className="w-full p-2 border border-border rounded bg-background"
        />
        <button
          onClick={onFullHeal}
          className="w-full mt-1 text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
        >
          Полное исцеление
        </button>
      </div>
    </>
  );
}

interface LocationControlsProps {
  hitLocations: HitLocation[];
  targetLocation: HitLocation;
  setTargetLocation: (location: HitLocation) => void;
  isRandomLocation: boolean;
  setIsRandomLocation: (value: boolean) => void;
}

export function LocationControls({
  hitLocations,
  targetLocation,
  setTargetLocation,
  isRandomLocation,
  setIsRandomLocation
}: LocationControlsProps) {
  return (
    <>
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRandomLocation}
            onChange={(e) => setIsRandomLocation(e.target.checked)}
          />
          <span className="text-sm">Случайная локация</span>
        </label>
      </div>
      {!isRandomLocation && (
        <div>
          <label className="block text-sm font-medium mb-1">Целевая локация</label>
          <select
            value={targetLocation.name}
            onChange={(e) => setTargetLocation(hitLocations.find(loc => loc.name === e.target.value)!)}
            className="w-full p-2 border border-border rounded bg-background"
          >
            {hitLocations.map(loc => (
              <option key={loc.name} value={loc.name}>
                {loc.name} ({loc.penalty})
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

interface SimulationControlsProps {
  onRunSimulation: (count: number) => void;
  onClearResults: () => void;
  singleButtonText?: string;
  multipleButtonTexts?: string[];
}

export function SimulationControls({
  onRunSimulation,
  onClearResults,
  singleButtonText = "Одна атака",
  multipleButtonTexts = ["10 атак", "100 атак"]
}: SimulationControlsProps) {
  return (
    <>
      <button
        onClick={() => onRunSimulation(1)}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        {singleButtonText}
      </button>
      <button
        onClick={() => onRunSimulation(10)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {multipleButtonTexts[0]}
      </button>
      <button
        onClick={() => onRunSimulation(100)}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
      >
        {multipleButtonTexts[1]}
      </button>
      <button
        onClick={onClearResults}
        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        Очистить
      </button>
    </>
  );
}

interface AttackerSkillControlsProps {
  attackerSkill: number;
  setAttackerSkill: (value: number) => void;
  skillLabel?: string;
}

export function AttackerSkillControls({
  attackerSkill,
  setAttackerSkill,
  skillLabel = "Навык"
}: AttackerSkillControlsProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{skillLabel}</label>
      <input
        type="number"
        value={attackerSkill}
        onChange={(e) => setAttackerSkill(Number(e.target.value))}
        className="w-full p-2 border border-border rounded bg-background"
      />
    </div>
  );
}

interface WeaponControlsProps {
  baseDamage: string;
  setBaseDamage: (value: string) => void;
  damageTypes: Array<{ name: string; multiplier: number; description: string }>;
  selectedDamageType: { name: string; multiplier: number; description: string };
  setSelectedDamageType: (damageType: { name: string; multiplier: number; description: string }) => void;
  children?: React.ReactNode;
  // Новые пропы для системы пресетов
  weaponMode: 'preset' | 'custom';
  setWeaponMode: (mode: 'preset' | 'custom') => void;
  onWeaponPresetSelect?: (weapon: RangedWeapon | MeleeWeapon) => void;
  weaponType: 'ranged' | 'melee';
  // Дополнительные параметры для отображения
  weaponAccuracy?: number;
  halfDamageRange?: number;
  maxRange?: number;
  weaponReach?: number;
  weaponDamageFormula?: string | number;
  attackerST?: number;
}

export function WeaponControls({
  baseDamage,
  setBaseDamage,
  damageTypes,
  selectedDamageType,
  setSelectedDamageType,
  children,
  weaponMode,
  setWeaponMode,
  onWeaponPresetSelect,
  weaponType,
  weaponAccuracy,
  halfDamageRange,
  maxRange,
  weaponReach,
  attackerST
}: WeaponControlsProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedWeaponName, setSelectedWeaponName] = React.useState<string>('');
  const weapons = weaponType === 'ranged' ? rangedWeapons : meleeWeapons;
  const categories = Array.from(new Set(weapons.map(w => w.category)));

  const filteredWeapons = selectedCategory
    ? weapons.filter(w => w.category === selectedCategory)
    : weapons;

  const damageDetails = () => {
    const parsed = parseDamageString(baseDamage, attackerST);
    const damageStr = parsed.dice === 0
      ? `${parsed.modifier}`
      : `${parsed.dice}d${parsed.modifier >= 0 ? '+' : ''}${parsed.modifier}`;
    const avgDamage = getAverageDamage(parsed);
    return (
      <div className="text-xs text-blue-400 mt-1">
        Расчётный урон (ST {attackerST}): {damageStr} (≈{avgDamage})
      </div>
    );
  };

  return (
    <>
      {/* Переключатель режима */}
      <div className="mb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setWeaponMode('preset');
              setSelectedWeaponName(''); // Очищаем выбор при смене режима
            }}
            className={`flex-1 py-2 px-3 text-sm rounded ${
              weaponMode === 'preset'
                ? 'bg-blue-600 text-white'
                : 'bg-surface-secondary text-text-primary border border-border hover:bg-surface'
            }`}
          >
            📋 Из списка
          </button>
          <button
            onClick={() => setWeaponMode('custom')}
            className={`flex-1 py-2 px-3 text-sm rounded ${
              weaponMode === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-surface-secondary text-text-primary border border-border hover:bg-surface'
            }`}
          >
            ⚙️ Свои параметры
          </button>
        </div>
      </div>

      {weaponMode === 'preset' ? (
        // Режим выбора из списка
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Категория оружия</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedWeaponName(''); // Очищаем выбор оружия при смене категории
              }}
              className="w-full p-2 border border-border rounded bg-background"
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Выберите оружие</label>
            <select
              value={selectedWeaponName}
              onChange={(e) => {
                setSelectedWeaponName(e.target.value);
                const weapon = weapons.find(w => w.name === e.target.value);
                if (weapon && onWeaponPresetSelect) {
                  onWeaponPresetSelect(weapon);
                }
              }}
              className="w-full p-2 border border-border rounded bg-background"
            >
              <option value="">-- Выберите оружие --</option>
              {filteredWeapons.map(weapon => (
                <option key={weapon.name} value={weapon.name}>
                  {weapon.name} ({weapon.damage} урона, {weapon.damageType})
                </option>
              ))}
            </select>
          </div>

          {/* Отображение параметров только после выбора оружия */}
          {selectedWeaponName && (
            <div className="p-3 bg-background rounded border border-border">
              <h4 className="text-sm font-medium mb-2">Параметры выбранного оружия:</h4>
              <div className="text-xs text-text-secondary space-y-1">
                <div>Формула урона: {baseDamage}</div>
                {damageDetails()}
                <div>Тип: {selectedDamageType.name}</div>
                {weaponType === 'ranged' && (
                  <>
                    <div>Точность: {weaponAccuracy}</div>
                    <div>1/2D дистанция: {halfDamageRange} ярдов</div>
                    <div>Макс дистанция: {maxRange} ярдов</div>
                  </>
                )}
                {weaponType === 'melee' && (
                  <div>Досягаемость: {weaponReach}</div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        // Режим ручного ввода (оригинальный)
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Формула урона</label>
            <input
              type="text"
              value={baseDamage}
              onChange={(e) => setBaseDamage(e.target.value)}
              placeholder="2d+1, sw+2, thr-1, 8"
              className="w-full p-2 border border-border rounded bg-background"
            />
            <p className="text-xs text-text-secondary mt-1">
              Примеры: 2d+1, sw+2, thr-1, или просто число 8
            </p>
            {damageDetails()}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Тип урона</label>
            <select
              value={selectedDamageType.name}
              onChange={(e) => setSelectedDamageType(damageTypes.find(dt => dt.name === e.target.value)!)}
              className="w-full p-2 border border-border rounded bg-background"
            >
              {damageTypes.map(dt => (
                <option key={dt.name} value={dt.name}>{dt.name}</option>
              ))}
            </select>
            <p className="text-xs text-text-secondary mt-1">{selectedDamageType.description}</p>
          </div>

          {children}
        </>
      )}
    </>
  );
}

interface BasicArmorControlsProps {
  armorValue: number;
  setArmorValue: (value: number) => void;
}

export function BasicArmorControls({
  armorValue,
  setArmorValue
}: BasicArmorControlsProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Броня (DR)</label>
      <input
        type="number"
        value={armorValue}
        onChange={(e) => setArmorValue(Number(e.target.value))}
        className="w-full p-2 border border-border rounded bg-background"
      />
    </div>
  );
}