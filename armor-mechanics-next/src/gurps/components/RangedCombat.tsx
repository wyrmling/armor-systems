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
  parseDamageString,
  InjuryResult
} from '../combat';
import { useCombatState, HIT_LOCATIONS } from '../hooks/useCombatState';
import { HPControls, LocationControls, SimulationControls, AttackerSkillControls, WeaponControls, BasicArmorControls } from '../components/combat/SharedCombatComponents';
import { InjuryResultDisplay } from '../components/combat/InjuryResultDisplay';

// Используем общие hitLocations из хука

// Типы урона для дальнего боя
const rangedDamageTypes = [
  { name: 'Малый колющий (pi-)', multiplier: 0.5, description: 'Мелкие пули .22, дротики' },
  { name: 'Колющий (pi)', multiplier: 1.0, description: 'Пули 9мм, стрелы' },
  { name: 'Большой колющий (pi+)', multiplier: 1.5, description: 'Крупные пули .45, болты' },
  { name: 'Огромный колющий (pi++)', multiplier: 2.0, description: 'Крупнокалиберные пули .50' },
  { name: 'Дробящий (cr)', multiplier: 1.0, description: 'Дробь, булыжники' }
];

// Правильные дистанционные модификаторы GURPS (согласно таблице Range and Speed/Range Table)
const rangeModifiers = [
  { range: 1, modifier: +10, description: '1 ярд - почти в упор' },
  { range: 2, modifier: +9, description: '2 ярда' },
  { range: 3, modifier: +8, description: '3 ярда' },
  { range: 5, modifier: +7, description: '5 ярдов' },
  { range: 7, modifier: +6, description: '7 ярдов' },
  { range: 10, modifier: +5, description: '10 ярдов' },
  { range: 15, modifier: +4, description: '15 ярдов' },
  { range: 20, modifier: +3, description: '20 ярдов' },
  { range: 30, modifier: +2, description: '30 ярдов' },
  { range: 50, modifier: +1, description: '50 ярдов' },
  { range: 70, modifier: 0, description: '70 ярдов' },
  { range: 100, modifier: -1, description: '100 ярдов' },
  { range: 150, modifier: -2, description: '150 ярдов' },
  { range: 200, modifier: -3, description: '200 ярдов' },
  { range: 300, modifier: -4, description: '300 ярдов' },
  { range: 500, modifier: -5, description: '500 ярдов' },
  { range: 700, modifier: -6, description: '700 ярдов' },
  { range: 1000, modifier: -7, description: '1000 ярдов' },
  { range: 1500, modifier: -8, description: '1500 ярдов' },
  { range: 2000, modifier: -9, description: '2000 ярдов' },
  { range: 3000, modifier: -10, description: '3000 ярдов' }
];

// Модификаторы скорости цели (Speed)
const speedModifiers = [
  { speed: 0, modifier: 0, description: 'Неподвижная цель' },
  { speed: 1, modifier: -1, description: 'Скорость 1 (медленная ходьба)' },
  { speed: 2, modifier: -2, description: 'Скорость 2 (быстрая ходьба)' },
  { speed: 3, modifier: -3, description: 'Скорость 3 (лёгкий бег)' },
  { speed: 4, modifier: -4, description: 'Скорость 4 (бег)' },
  { speed: 5, modifier: -5, description: 'Скорость 5 (быстрый бег)' },
  { speed: 6, modifier: -6, description: 'Скорость 6+ (спринт)' }
];

// Модификаторы размера цели (Size Modifier)
const sizeModifiers = [
  { name: 'Микроскопический', sm: -15, description: 'Клетка, вирус' },
  { name: 'Субмикроскопический', sm: -10, description: 'Атом' },
  { name: 'Мельчайший', sm: -8, description: 'Игла' },
  { name: 'Крошечный', sm: -6, description: 'Монета' },
  { name: 'Очень маленький', sm: -4, description: 'Мышь' },
  { name: 'Маленький', sm: -2, description: 'Кролик, кошка' },
  { name: 'Средний', sm: 0, description: 'Человек, волк' },
  { name: 'Большой', sm: +1, description: 'Медведь, лошадь' },
  { name: 'Очень большой', sm: +2, description: 'Слон' },
  { name: 'Огромный', sm: +3, description: 'Кит' },
  { name: 'Гигантский', sm: +4, description: 'Дом' },
  { name: 'Колоссальный', sm: +6, description: 'Корабль' }
];

interface RangedCombatResult {
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

  // Специфично для дальнего боя
  rangeModifier: number;
  targetRange: number;
  speedModifier: number;
  sizeModifier: number;
  accuracyBonus: number;
  aimingUsed: boolean;
  halfDamageRange: number;
  maxRange: number;
  damageReduced: boolean;

  // GURPS 4ed критические попадания
  isCritical: boolean;
  isAutoMaxDamage: boolean;

  // GURPS 4ed система травм
  injuryResult?: InjuryResult;
}

export default function RangedCombat() {
  const [selectedDamageType, setSelectedDamageType] = useState(rangedDamageTypes[1]);

  // Состояние для переключателя оружия
  const [weaponMode, setWeaponMode] = useState<'preset' | 'custom'>('preset');
  const [weaponDamageFormula, setWeaponDamageFormula] = useState<string | number>(0); // Храним оригинальную формулу

  // Дальний бой специфично
  const [targetRange, setTargetRange] = useState(100);
  const [targetSpeed, setTargetSpeed] = useState(speedModifiers[0]);
  const [targetSize, setTargetSize] = useState(sizeModifiers[6]); // Средний размер
  const [weaponAccuracy, setWeaponAccuracy] = useState(2);
  const [isAiming, setIsAiming] = useState(false);
  const [halfDamageRange, setHalfDamageRange] = useState(150);
  const [maxRange, setMaxRange] = useState(300);
  const [attackerST, setAttackerST] = useState(12); // Сила атакующего

  // Получить модификатор дистанции
  const getRangeModifier = (range: number) => {
    const rangeData = rangeModifiers.find(rm => range <= rm.range) || rangeModifiers[rangeModifiers.length - 1];
    return rangeData.modifier;
  };

  // Проверить валидность дистанции
  const isValidRange = (range: number) => {
    return range <= maxRange;
  };

  // Проверить снижение урона
  const rangeReduceDamage = (range: number) => {
    return range > halfDamageRange;
  };

  // Инициализируем общее состояние боя
  const combatState = useCombatState(simulateSingleAttack);

  // Обработчик выбора пресета оружия
  const handleWeaponPresetSelect = (weapon: any) => {
    // Сохраняем оригинальную формулу и устанавливаем её как baseDamage
    setWeaponDamageFormula(weapon.damage);
    combatState.setBaseDamage(weapon.damage);

    // Найти соответствующий тип урона
    const damageType = rangedDamageTypes.find(dt => dt.name === weapon.damageType);
    if (damageType) {
      setSelectedDamageType(damageType);
    }

    // Установить параметры оружия дальнего боя
    if ('accuracy' in weapon) {
      setWeaponAccuracy(weapon.accuracy);
      setHalfDamageRange(weapon.halfDamageRange);
      setMaxRange(weapon.maxRange);
    }
  };

  // Обработчик переключения режима оружия
  const handleWeaponModeChange = (mode: 'preset' | 'custom') => {
    setWeaponMode(mode);
    if (mode === 'custom') {
      // При переключении на пользовательский режим, оставляем текущую формулу
      setWeaponDamageFormula(combatState.baseDamage);
    }
  };

  function simulateSingleAttack(currentHP: number): RangedCombatResult {

    const location = combatState.isRandomLocation ?
      HIT_LOCATIONS[Math.floor(Math.random() * HIT_LOCATIONS.length)] :
      combatState.targetLocation;

    // Проверка валидности дистанции
    if (!isValidRange(targetRange)) {
      const result: RangedCombatResult = {
        baseDamage: combatState.baseDamage,
        location: location.name,
        locationPenalty: location.penalty,
        hitRoll: 0,
        hitSuccess: false,
        armorValue: combatState.armorValue,
        effectiveArmor: 0,
        damageAfterArmor: 0,
        damageType: selectedDamageType.name,
        multipliedDamage: 0,
        finalDamage: 0,
        injuries: [],
        effectiveSkill: 0,
        rangeModifier: 0,
        targetRange,
        speedModifier: 0,
        sizeModifier: 0,
        accuracyBonus: 0,
        aimingUsed: false,
        halfDamageRange,
        maxRange,
        damageReduced: false,
        isCritical: false,
        isAutoMaxDamage: false,
        injuryResult: undefined,
        description: `Цель вне досягаемости! Дистанция ${targetRange} ярдов превышает максимальную дальность ${maxRange} ярдов.`
      };
      return result;
    }

    // Расчет эффективного навыка согласно GURPS 4ed
    const rangeModifier = getRangeModifier(targetRange);
    const speedModifier = targetSpeed.modifier;
    const sizeModifier = targetSize.sm;
    const accuracyBonus = isAiming ? weaponAccuracy : 0;

    const effectiveSkill = combatState.attackerSkill + accuracyBonus + sizeModifier + location.penalty + rangeModifier + speedModifier;

    const hitRoll = roll3d6();
    const { hitSuccess, isCritical, isAutoMaxDamage } = calculateHitResult(hitRoll, effectiveSkill);

    if (!hitSuccess) {
      const result: RangedCombatResult = {
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
        rangeModifier,
        targetRange,
        speedModifier,
        sizeModifier,
        accuracyBonus,
        aimingUsed: isAiming,
        halfDamageRange,
        maxRange,
        damageReduced: false,
        isCritical: false,
        isAutoMaxDamage: false,
        injuryResult: undefined,
        description: `${getMissDescription(hitRoll)} Бросок ${hitRoll} против навыка ${effectiveSkill}
          (базовый ${combatState.attackerSkill}${isAiming ? ` + прицел ${accuracyBonus}` : ''} + размер ${sizeModifier >= 0 ? '+' : ''}${sizeModifier} + локация ${location.penalty} + дистанция ${rangeModifier >= 0 ? '+' : ''}${rangeModifier} + скорость ${speedModifier})`
      };
      return result;
    }

    // Расчет урона
    const damageReduced = rangeReduceDamage(targetRange);

    // Для дальнего боя: снижение урона на дальней дистанции (если не критический максимальный урон)
    let extraDamageModifier = 0;
    if (damageReduced && !isAutoMaxDamage) {
      // Снижение урона вдвое на дальней дистанции
      extraDamageModifier = -0.5; // -50% урона, будет обработано в calculateDamage
    }

    // Урон по броне с учетом делителя брони
    const armorDivisor = selectedDamageType.name.includes('pi++') ? 2 :
                       selectedDamageType.name.includes('pi+') ? 1.5 : 1;
    const adjustedArmorValue = Math.floor(combatState.armorValue / armorDivisor);

    const damageResult = calculateDamage({
      baseDamage: combatState.baseDamage,
      isAutoMaxDamage,
      armorValue: adjustedArmorValue,
      damageTypeMultiplier: selectedDamageType.multiplier,
      locationVitalityMultiplier: location.vitality,
      attackerST,
      extraDamage: extraDamageModifier
    });

    const { finalDamage, damageAfterArmor, multipliedDamage, effectiveArmor } = damageResult;

    // Расчет травм согласно GURPS 4ed
    let injuryResult: InjuryResult | undefined;

    if (finalDamage > 0) {
      injuryResult = calculateInjuryEffects(finalDamage, currentHP, combatState.targetMaxHP, location.name.toLowerCase());
    }

    // Отображаем формулу урона
    const displayDamage = combatState.baseDamage;

    const description = `
      ${getHitDescription(hitRoll, isCritical, isAutoMaxDamage)} в ${location.name} на ${targetRange} ярдов!
      Навык: ${effectiveSkill} (базовый ${combatState.attackerSkill}${isAiming ? ` + прицел ${accuracyBonus}` : ''} + размер ${sizeModifier >= 0 ? '+' : ''}${sizeModifier} + локация ${location.penalty} + дистанция ${rangeModifier >= 0 ? '+' : ''}${rangeModifier} + скорость ${speedModifier})
      Урон: ${displayDamage}${isAutoMaxDamage ? ' (МАКСИМАЛЬНЫЙ)' : ''}${damageReduced && !isAutoMaxDamage ? ' → Снижен вдвое' : ''} → После брони: ${damageAfterArmor} →
      Тип урона (×${selectedDamageType.multiplier}): ${multipliedDamage} →
      Локация (×${location.vitality}): ${finalDamage}
    `;

    const result: RangedCombatResult = {
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
      injuries: [], // Для дальнего боя специальных травм нет
      effectiveSkill,
      rangeModifier,
      targetRange,
      speedModifier,
      sizeModifier,
      accuracyBonus,
      aimingUsed: isAiming,
      halfDamageRange,
      maxRange,
      damageReduced,
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
          🏹 Дальний бой GURPS
        </h1>
        <p className="text-text-secondary">
          Симуляция дальнего боя согласно правилам GURPS 4ed с учетом дистанции, скорости цели,
          размера, прицеливания и других факторов.
        </p>
      </div>

      {/* Настройки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Стрелок */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Стрелок</h3>
          <div className="space-y-3">
            <AttackerSkillControls
              attackerSkill={combatState.attackerSkill}
              setAttackerSkill={combatState.setAttackerSkill}
              skillLabel="Навык стрельбы"
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
                  // Пересчитываем урон если выбрано оружие из списка
                  if (weaponMode === 'preset') {
                    // Нужно найти текущее выбранное оружие и пересчитать
                    // Это будет обновлено при следующем выборе оружия
                  }
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
              damageTypes={rangedDamageTypes}
              selectedDamageType={selectedDamageType}
              setSelectedDamageType={setSelectedDamageType}
              weaponMode={weaponMode}
              setWeaponMode={handleWeaponModeChange}
              onWeaponPresetSelect={handleWeaponPresetSelect}
              weaponType="ranged"
              weaponAccuracy={weaponAccuracy}
              halfDamageRange={halfDamageRange}
              maxRange={maxRange}
              weaponDamageFormula={weaponDamageFormula}
              attackerST={attackerST}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Точность (Acc)</label>
                <input
                  type="number"
                  value={weaponAccuracy}
                  onChange={(e) => setWeaponAccuracy(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">1/2D дистанция (ярды)</label>
                <input
                  type="number"
                  value={halfDamageRange}
                  onChange={(e) => setHalfDamageRange(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Макс дистанция (ярды)</label>
                <input
                  type="number"
                  value={maxRange}
                  onChange={(e) => setMaxRange(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded bg-background"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isAiming}
                    onChange={(e) => setIsAiming(e.target.checked)}
                  />
                  <span className="text-sm">Прицеливание (Aim)</span>
                </label>
              </div>
            </WeaponControls>
          </div>
        </div>

        {/* Цель */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Цель</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Дистанция (ярды)</label>
              <input
                type="number"
                value={targetRange}
                onChange={(e) => setTargetRange(Number(e.target.value))}
                className="w-full p-2 border border-border rounded bg-background"
              />
              <p className="text-xs text-text-secondary mt-1">
                Модификатор: {getRangeModifier(targetRange) >= 0 ? '+' : ''}{getRangeModifier(targetRange)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Размер цели</label>
              <select
                value={targetSize.name}
                onChange={(e) => setTargetSize(sizeModifiers.find(sm => sm.name === e.target.value)!)}
                className="w-full p-2 border border-border rounded bg-background"
              >
                {sizeModifiers.map(sm => (
                  <option key={sm.name} value={sm.name}>
                    {sm.name} ({sm.sm >= 0 ? '+' : ''}{sm.sm})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Скорость цели</label>
              <select
                value={targetSpeed.speed}
                onChange={(e) => setTargetSpeed(speedModifiers.find(sp => sp.speed === Number(e.target.value))!)}
                className="w-full p-2 border border-border rounded bg-background"
              >
                {speedModifiers.map(sp => (
                  <option key={sp.speed} value={sp.speed}>
                    {sp.description} ({sp.modifier})
                  </option>
                ))}
              </select>
            </div>
            <BasicArmorControls
              armorValue={combatState.armorValue}
              setArmorValue={combatState.setArmorValue}
            />
            <HPControls
              targetMaxHP={combatState.targetMaxHP}
              setTargetMaxHP={combatState.setTargetMaxHP}
              targetCurrentHP={combatState.targetCurrentHP}
              setTargetCurrentHP={combatState.setTargetCurrentHP}
              onFullHeal={combatState.fullHeal}
            />
          </div>
        </div>

        {/* Локация и управление */}
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Локация и симуляция</h3>
          <div className="space-y-3">
            <LocationControls
              hitLocations={HIT_LOCATIONS}
              targetLocation={combatState.targetLocation}
              setTargetLocation={combatState.setTargetLocation}
              isRandomLocation={combatState.isRandomLocation}
              setIsRandomLocation={combatState.setIsRandomLocation}
            />

            <SimulationControls
              onRunSimulation={combatState.runSimulation}
              onClearResults={combatState.clearResults}
              singleButtonText="Один выстрел"
              multipleButtonTexts={["10 выстрелов", "100 выстрелов"]}
            />
          </div>
        </div>
      </div>

      {/* Результаты */}
      {combatState.combatResults.length > 0 && (
        <div className="bg-surface p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Результаты последних выстрелов</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {combatState.combatResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border ${getCombatResultClasses(result.hitSuccess, result.isCritical, result.hitRoll, result.finalDamage)}`}>
                <div className="text-sm">
                  <strong>Выстрел #{index + 1}:</strong> {result.description.trim()}
                </div>

                {/* Отображение травм GURPS 4ed */}
                {result.injuryResult && (
                  <InjuryResultDisplay injuryResult={result.injuryResult} />
                )}

                {result.damageReduced && (
                  <div className="text-xs text-yellow-400 mt-1 font-medium">
                    ⚠️ Урон снижен вдвое из-за дальности
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