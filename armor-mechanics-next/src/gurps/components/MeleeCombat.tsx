'use client';

import { useState } from 'react';
import {
  calculateHitResult,
  roll3d6,
  calculateDamage,
  getHitDescription,
  getMissDescription,
  getCombatResultClasses,
  calculateInjuryEffects,
  InjuryResult
} from '../combat';
import { useCombatState, HIT_LOCATIONS } from '../hooks/useCombatState';
import { HPControls, LocationControls, SimulationControls, AttackerSkillControls, WeaponControls, BasicArmorControls } from '../components/combat/SharedCombatComponents';
import { InjuryResultDisplay } from '../components/combat/InjuryResultDisplay';

// Используем общие hitLocations из хука

// Типы урона для ближнего боя
const meleeDamageTypes = [
  { name: 'Рубящий (cut)', multiplier: 1.5, description: 'Мечи, топоры - увеличенный урон' },
  { name: 'Колющий (imp)', multiplier: 2.0, description: 'Копья, рапиры - сильно увеличенный урон' },
  { name: 'Дробящий (cr)', multiplier: 1.0, description: 'Молоты, дубины - базовый урон' },
  { name: 'Малый колющий (pi-)', multiplier: 0.5, description: 'Иглы, тонкие клинки' }
];

// Модификаторы для рукопашного боя
const meleeModifiers = [
  { name: 'Вплотную', modifier: 0, description: 'Обычная дистанция ближнего боя' },
  { name: 'Схватка', modifier: -4, description: 'Борьба, очень близко' },
  { name: 'Длинное оружие vs короткое', modifier: +2, description: 'Копьё против кинжала' },
  { name: 'В тесноте', modifier: -3, description: 'Ограниченное пространство' },
  { name: 'Атака сзади', modifier: +4, description: 'Цель не видит атакующего' },
  { name: 'Атака сбоку', modifier: +2, description: 'Фланговая атака' },
  { name: 'Плохая стойка', modifier: -2, description: 'Неудобная позиция' },
  { name: 'На высшей позиции', modifier: +1, description: 'Атака сверху' },
  { name: 'На нижней позиции', modifier: -1, description: 'Атака снизу' },
  { name: 'Шокированная цель', modifier: +4, description: 'Цель в шоке' },
  { name: 'Ослеплённая цель', modifier: +6, description: 'Цель не видит' },
  { name: 'Лежащая цель', modifier: +4, description: 'Цель лежит' }
];

// Типы атак ближнего боя
const meleeAttackTypes = [
  { name: 'Обычная атака', modifier: 0, description: 'Стандартная атака' },
  { name: 'Всестороняя атака (+4)', modifier: +4, description: 'Бонус к попаданию, но нет защиты' },
  { name: 'Всестороняя атака (урон)', modifier: 0, description: 'Дополнительный урон, но нет защиты' },
  { name: 'Осторожная атака', modifier: -2, description: 'Штраф к попаданию, но бонус к защите' },
  { name: 'Обманный удар', modifier: -2, description: 'Штраф к попаданию, но штраф защите цели' },
  { name: 'Быстрый удар', modifier: -6, description: 'Дополнительная атака в ход' }
];

// Модификаторы положения
const postureModifiers = [
  { name: 'Стоя', attackMod: 0, defenseMod: 0, description: 'Обычное положение' },
  { name: 'Сидя', attackMod: -2, defenseMod: -2, description: 'Сидячее положение' },
  { name: 'На коленях', attackMod: -2, defenseMod: -2, description: 'На коленях' },
  { name: 'Лёжа', attackMod: -4, defenseMod: -3, description: 'Лежачее положение' },
  { name: 'Ползком', attackMod: -4, defenseMod: -3, description: 'Ползание' }
];

const meleeRangeModifiers = [
  { name: 'Вплотную', modifier: 0, description: 'Обычная дистанция ближнего боя' },
  { name: 'Схватка', modifier: -4, description: 'Борьба, очень близко' },
  { name: 'Длинное оружие', modifier: +1, description: 'Копьё, алебарда против короткого оружия' },
  { name: 'В тесноте', modifier: -2, description: 'Ограниченное пространство' }
];

interface MeleeCombatResult {
  baseDamage: string;
  location: string;
  locationPenalty: number;
  hitRoll: number;
  hitSuccess: boolean;
  armorValue: number;
  effectiveArmor: number;
  damageAfterArmor: number;
  damageType: string;
  multipliedDamage: number;
  finalDamage: number;
  injuries: string[];
  description: string;
  effectiveSkill: number;

  // Специфично для ближнего боя
  meleeModifier: number;
  attackType: string;
  posture: string;
  extraDamage: number;

  // GURPS 4ed критические попадания
  isCritical: boolean;
  isAutoMaxDamage: boolean;

  // GURPS 4ed система травм
  injuryResult?: InjuryResult;
}

export default function MeleeCombat() {
  const [selectedDamageType, setSelectedDamageType] = useState(meleeDamageTypes[0]);

  // Состояние для переключателя оружия
  const [weaponMode, setWeaponMode] = useState<'preset' | 'custom'>('preset');

  // Ближний бой специфично
  const [selectedMeleeModifier, setSelectedMeleeModifier] = useState(meleeModifiers[0]);
  const [selectedAttackType, setSelectedAttackType] = useState(meleeAttackTypes[0]);
  const [selectedPosture, setSelectedPosture] = useState(postureModifiers[0]);
  const [weaponReach, setWeaponReach] = useState(1);
  const [targetReach, setTargetReach] = useState(1);
  const [attackerST, setAttackerST] = useState(12); // Сила атакующего

  // Инициализируем общее состояние боя
  const combatState = useCombatState(simulateSingleAttack);

  // Обработчик выбора пресета оружия
  const handleWeaponPresetSelect = (weapon: any) => {
    // Сохраняем формулу как строку
    combatState.setBaseDamage(weapon.damage);

    // Найти соответствующий тип урона
    const damageType = meleeDamageTypes.find(dt => dt.name === weapon.damageType);
    if (damageType) {
      setSelectedDamageType(damageType);
    }

    // Установить параметры оружия ближнего боя
    if ('reach' in weapon) {
      setWeaponReach(weapon.reach);
    }
  };

  function simulateSingleAttack(currentHP: number): MeleeCombatResult {
    const location = combatState.isRandomLocation ?
      HIT_LOCATIONS[Math.floor(Math.random() * HIT_LOCATIONS.length)] :
      combatState.targetLocation;

    // Расчет эффективного навыка согласно правилам ближнего боя GURPS
    const reachModifier = Math.abs(weaponReach - targetReach) > 0 ?
      (weaponReach > targetReach ? +1 : -2) : 0;

    const effectiveSkill = combatState.attackerSkill +
                          selectedMeleeModifier.modifier +
                          selectedAttackType.modifier +
                          selectedPosture.attackMod +
                          location.penalty +
                          reachModifier;

    const hitRoll = roll3d6();
    const { hitSuccess, isCritical, isAutoMaxDamage } = calculateHitResult(hitRoll, effectiveSkill);

    if (!hitSuccess) {
      const result: MeleeCombatResult = {
        baseDamage: combatState.baseDamage,
        location: location.name,
        locationPenalty: location.penalty,
        hitRoll,
        hitSuccess: false,
        armorValue: combatState.armorValue,
        effectiveArmor: 0,
        damageAfterArmor: 0,
        damageType: selectedDamageType.name,
        multipliedDamage: 0,
        finalDamage: 0,
        injuries: [],
        effectiveSkill,
        meleeModifier: selectedMeleeModifier.modifier,
        attackType: selectedAttackType.name,
        posture: selectedPosture.name,
        extraDamage: 0,
        isCritical: false,
        isAutoMaxDamage: false,
        injuryResult: undefined,
        description: `${getMissDescription(hitRoll)} Бросок ${hitRoll} против навыка ${effectiveSkill}
          (базовый ${combatState.attackerSkill} + ситуация ${selectedMeleeModifier.modifier >= 0 ? '+' : ''}${selectedMeleeModifier.modifier} + тип атаки ${selectedAttackType.modifier >= 0 ? '+' : ''}${selectedAttackType.modifier} + поза ${selectedPosture.attackMod >= 0 ? '+' : ''}${selectedPosture.attackMod} + локация ${location.penalty}${reachModifier !== 0 ? ` + досягаемость ${reachModifier >= 0 ? '+' : ''}${reachModifier}` : ''})`
      };
      return result;
    }

    // Расчет урона
    let extraDamage = 0;

    // Дополнительный урон для всесторонней атаки на урон (только если не автоматический максимальный урон)
    if (selectedAttackType.name === 'Всестороняя атака (урон)' && !isAutoMaxDamage) {
      // Для всесторонней атаки на урон используем модификатор +50%
      extraDamage = 0.5; // +50% урона
    }

    // Урон по броне (для ближнего боя делители брони работают по-другому)
    let armorDivisor = 1;
    if (selectedDamageType.name.includes('imp')) {
      armorDivisor = selectedDamageType.name.includes('pi-') ? 0.5 : 1; // Малый колющий хуже пробивает броню
    }

    const adjustedArmorValue = Math.floor(combatState.armorValue / armorDivisor);

    const damageResult = calculateDamage({
      baseDamage: combatState.baseDamage,
      isAutoMaxDamage,
      armorValue: adjustedArmorValue,
      damageTypeMultiplier: selectedDamageType.multiplier,
      locationVitalityMultiplier: location.vitality,
      extraDamage,
      attackerST
    });

    const { finalDamage, damageAfterArmor, multipliedDamage, effectiveArmor } = damageResult;

    // Расчет травм согласно GURPS 4ed
    let injuryResult: InjuryResult | undefined;
    const injuries: string[] = [];

    if (finalDamage > 0) {
      injuryResult = calculateInjuryEffects(finalDamage, currentHP, combatState.targetMaxHP, location.name.toLowerCase());

      // Особые эффекты для разных типов урона и локаций
      if (selectedDamageType.name.includes('cut') && location.name === 'Шея' && finalDamage >= 8) {
        injuries.push('Возможна декапитация');
      }
      if (selectedDamageType.name.includes('imp') && location.name === 'Череп' && finalDamage >= 10) {
        injuries.push('Проникающее ранение черепа');
      }
    }

    const description = `
      ${getHitDescription(hitRoll, isCritical, isAutoMaxDamage)} в ${location.name}!
      Навык: ${effectiveSkill} (базовый ${combatState.attackerSkill} + ситуация ${selectedMeleeModifier.modifier >= 0 ? '+' : ''}${selectedMeleeModifier.modifier} + тип атаки ${selectedAttackType.modifier >= 0 ? '+' : ''}${selectedAttackType.modifier} + поза ${selectedPosture.attackMod >= 0 ? '+' : ''}${selectedPosture.attackMod} + локация ${location.penalty}${reachModifier !== 0 ? ` + досягаемость ${reachModifier >= 0 ? '+' : ''}${reachModifier}` : ''})
      Урон: ${combatState.baseDamage}${isAutoMaxDamage ? ' (МАКСИМАЛЬНЫЙ)' : ''}${extraDamage > 0 && !isAutoMaxDamage ? ` + бонус ${extraDamage}` : ''} → После брони: ${damageAfterArmor} →
      Тип урона (×${selectedDamageType.multiplier}): ${multipliedDamage} →
      Локация (×${location.vitality}): ${finalDamage}
      Атака: ${selectedAttackType.name}, Поза: ${selectedPosture.name}, Ситуация: ${selectedMeleeModifier.name}
    `;

    const result: MeleeCombatResult = {
      baseDamage: combatState.baseDamage,
      location: location.name,
      locationPenalty: location.penalty,
      hitRoll,
      hitSuccess: true,
      armorValue: combatState.armorValue,
      effectiveArmor,
      damageAfterArmor,
      damageType: selectedDamageType.name,
      multipliedDamage,
      finalDamage,
      injuries,
      effectiveSkill,
      meleeModifier: selectedMeleeModifier.modifier,
      attackType: selectedAttackType.name,
      posture: selectedPosture.name,
      extraDamage,
      isCritical,
      isAutoMaxDamage,
      injuryResult,
      description
    };

    return result;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          ⚔️ Ближний бой GURPS
        </h1>
        <p className="text-text-secondary">
          Симуляция ближнего боя согласно правилам GURPS 4ed с учетом досягаемости,
          типов атак, положения и тактических модификаторов.
        </p>
      </div>

      {/* Настройки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Атакующий */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Атакующий</h3>
          <div className="space-y-3">
            <AttackerSkillControls
              attackerSkill={combatState.attackerSkill}
              setAttackerSkill={combatState.setAttackerSkill}
              skillLabel="Навык оружия"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Сила (ST)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={attackerST}
                onChange={(e) => {
                  const newST = Number(e.target.value);
                  setAttackerST(newST);
                }}
                className="w-full p-2 border border-border rounded bg-background"
              />
              <p className="text-xs text-text-secondary mt-1">Влияет на урон sw/thr оружия</p>
            </div>
          </div>
        </div>

        {/* Оружие */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Оружие</h3>
          <div className="space-y-3">
            <WeaponControls
              baseDamage={combatState.baseDamage}
              setBaseDamage={combatState.setBaseDamage}
              damageTypes={meleeDamageTypes}
              selectedDamageType={selectedDamageType}
              setSelectedDamageType={setSelectedDamageType}
              weaponMode={weaponMode}
              setWeaponMode={setWeaponMode}
              onWeaponPresetSelect={handleWeaponPresetSelect}
              weaponType="melee"
              weaponReach={weaponReach}
              attackerST={attackerST}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Досягаемость оружия</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={weaponReach}
                  onChange={(e) => setWeaponReach(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded bg-background"
                />
                <p className="text-xs text-text-secondary mt-1">0=только касание, 1=обычное, 2=копьё, etc.</p>
              </div>
            </WeaponControls>
          </div>
        </div>

        {/* Тактика */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Тактика</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Тип атаки</label>
              <select
                value={selectedAttackType.name}
                onChange={(e) => setSelectedAttackType(meleeAttackTypes.find(at => at.name === e.target.value)!)}
                className="w-full p-2 border border-border rounded bg-background"
              >
                {meleeAttackTypes.map(at => (
                  <option key={at.name} value={at.name}>
                    {at.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-secondary mt-1">{selectedAttackType.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Поза атакующего</label>
              <select
                value={selectedPosture.name}
                onChange={(e) => setSelectedPosture(postureModifiers.find(pm => pm.name === e.target.value)!)}
                className="w-full p-2 border border-border rounded bg-background"
              >
                {postureModifiers.map(pm => (
                  <option key={pm.name} value={pm.name}>
                    {pm.name} (атака {pm.attackMod >= 0 ? '+' : ''}{pm.attackMod})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ситуация боя</label>
              <select
                value={selectedMeleeModifier.name}
                onChange={(e) => setSelectedMeleeModifier(meleeModifiers.find(mm => mm.name === e.target.value)!)}
                className="w-full p-2 border border-border rounded bg-background"
              >
                {meleeModifiers.map(mm => (
                  <option key={mm.name} value={mm.name}>
                    {mm.name} ({mm.modifier >= 0 ? '+' : ''}{mm.modifier})
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-secondary mt-1">{selectedMeleeModifier.description}</p>
            </div>
          </div>
        </div>

        {/* Цель */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Цель</h3>
          <div className="space-y-3">
            <BasicArmorControls
              armorValue={combatState.armorValue}
              setArmorValue={combatState.setArmorValue}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Досягаемость цели</label>
              <input
                type="number"
                min="0"
                max="5"
                value={targetReach}
                onChange={(e) => setTargetReach(Number(e.target.value))}
                className="w-full p-2 border border-border rounded bg-background"
              />
              <p className="text-xs text-text-secondary mt-1">
                {weaponReach > targetReach ? `Атакующий имеет преимущество досягаемости (+1)` :
                 weaponReach < targetReach ? `Цель имеет преимущество досягаемости (-2 атакующему)` :
                 `Равная досягаемость`}
              </p>
            </div>
            <HPControls
              targetMaxHP={combatState.targetMaxHP}
              setTargetMaxHP={combatState.setTargetMaxHP}
              targetCurrentHP={combatState.targetCurrentHP}
              setTargetCurrentHP={combatState.setTargetCurrentHP}
              onFullHeal={combatState.fullHeal}
            />
            <LocationControls
              hitLocations={HIT_LOCATIONS}
              targetLocation={combatState.targetLocation}
              setTargetLocation={combatState.setTargetLocation}
              isRandomLocation={combatState.isRandomLocation}
              setIsRandomLocation={combatState.setIsRandomLocation}
            />
          </div>
        </div>

        {/* Управление симуляцией */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Симуляция</h3>
          <div className="space-y-3">
            <SimulationControls
              onRunSimulation={combatState.runSimulation}
              onClearResults={combatState.clearResults}
              singleButtonText="Одна атака"
              multipleButtonTexts={["10 атак", "100 атак"]}
            />
          </div>

          {/* Краткая справка */}
          <div className="mt-4 p-3 bg-background rounded border border-border">
            <h4 className="text-sm font-medium mb-2">Эффективный навык:</h4>
            <p className="text-xs text-text-secondary">
              {combatState.attackerSkill} (базовый)
              {selectedMeleeModifier.modifier !== 0 && ` ${selectedMeleeModifier.modifier >= 0 ? '+' : ''}${selectedMeleeModifier.modifier} (ситуация)`}
              {selectedAttackType.modifier !== 0 && ` ${selectedAttackType.modifier >= 0 ? '+' : ''}${selectedAttackType.modifier} (атака)`}
              {selectedPosture.attackMod !== 0 && ` ${selectedPosture.attackMod >= 0 ? '+' : ''}${selectedPosture.attackMod} (поза)`}
              {!combatState.isRandomLocation && ` ${combatState.targetLocation.penalty} (локация)`}
              {Math.abs(weaponReach - targetReach) > 0 && ` ${weaponReach > targetReach ? '+1' : '-2'} (досягаемость)`}
            </p>
          </div>
        </div>
      </div>

      {/* Результаты */}
      {combatState.combatResults.length > 0 && (
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Результаты последних атак</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {combatState.combatResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border ${getCombatResultClasses(result.hitSuccess, result.isCritical, result.hitRoll, result.finalDamage)}`}>
                <div className="text-sm">
                  <strong>Атака #{index + 1}:</strong> {result.description.trim()}
                </div>

                {/* Отображение травм GURPS 4ed */}
                {result.injuryResult && (
                  <InjuryResultDisplay injuryResult={result.injuryResult} />
                )}

                {result.extraDamage > 0 && (
                  <div className="text-xs text-green-400 mt-1 font-medium">
                    💥 Дополнительный урон от всесторонней атаки: +{result.extraDamage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}