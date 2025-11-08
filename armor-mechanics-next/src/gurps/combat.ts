// GURPS 4ed Combat Utilities
// Общие функции для расчетов ближнего и дальнего боя

// Таблица урона по силе (GURPS Basic Set, стр. 16) ---
const strengthTable: {[key: number]: {thr: string, sw: string}} = {
  1: {thr: '1d-6', sw: '1d-5'},
  2: {thr: '1d-6', sw: '1d-5'},
  3: {thr: '1d-5', sw: '1d-4'},
  4: {thr: '1d-5', sw: '1d-4'},
  5: {thr: '1d-4', sw: '1d-3'},
  6: {thr: '1d-4', sw: '1d-3'},
  7: {thr: '1d-3', sw: '1d-2'},
  8: {thr: '1d-3', sw: '1d-2'},
  9: {thr: '1d-2', sw: '1d-1'},
  10: {thr: '1d-2', sw: '1d'},
  11: {thr: '1d-1', sw: '1d+1'},
  12: {thr: '1d-1', sw: '1d+2'},
  13: {thr: '1d', sw: '2d-1'},
  14: {thr: '1d', sw: '2d'},
  15: {thr: '1d+1', sw: '2d+1'},
  16: {thr: '1d+1', sw: '2d+2'},
  17: {thr: '1d+2', sw: '3d-1'},
  18: {thr: '1d+2', sw: '3d'},
  19: {thr: '2d-1', sw: '3d+1'},
  20: {thr: '2d-1', sw: '3d+2'},
  21: {thr: '2d', sw: '4d-1'},
  22: {thr: '2d', sw: '4d'},
  23: {thr: '2d+1', sw: '4d+1'},
  24: {thr: '2d+1', sw: '4d+2'},
  25: {thr: '2d+2', sw: '5d-1'},
  26: {thr: '2d+2', sw: '5d'},
  27: {thr: '3d-1', sw: '5d+1'},
  28: {thr: '3d-1', sw: '5d+1'},
  29: {thr: '3d', sw: '5d+2'},
  30: {thr: '3d', sw: '5d+2'},
  31: {thr: '3d+1', sw: '6d-1'},
  32: {thr: '3d+1', sw: '6d-1'},
  33: {thr: '3d+2', sw: '6d'},
  34: {thr: '3d+2', sw: '6d'},
  35: {thr: '4d-1', sw: '6d+1'},
  36: {thr: '4d-1', sw: '6d+1'},
  37: {thr: '4d', sw: '6d+2'},
  38: {thr: '4d', sw: '6d+2'},
  39: {thr: '4d+1', sw: '7d-1'},
  40: {thr: '4d+1', sw: '7d-1'},
  45: {thr: '5d', sw: '7d+1'},
  50: {thr: '5d+2', sw: '8d-1'},
  55: {thr: '6d', sw: '8d+1'},
  60: {thr: '7d-1', sw: '9d'},
  65: {thr: '7d+1', sw: '9d+2'},
  70: {thr: '8d', sw: '10d'},
  75: {thr: '8d+2', sw: '10d+2'},
  80: {thr: '9d', sw: '11d'},
  85: {thr: '9d+2', sw: '11d+2'},
  90: {thr: '10d', sw: '12d'},
  95: {thr: '10d+2', sw: '12d+2'},
  100: {thr: '11d', sw: '13d'},
};

/**
 * Рассчитывает базовый melee урон по силе (ST) согласно GURPS 4ed
 */
function getStrengthDamage(st: number): { thr: string; sw: string } {
  return strengthTable?.[st];
}

export interface ParsedDamage {
  dice: number;
  sides: number; // По умолчанию 6 для GURPS
  modifier: number;
}

// TODO: должна возвращать объект с деталями урона (тип, формула и т.д.)
// TODO: поэтому сила тут лишняя (?), она должна быть ... ?
/**
 * Парсит формулу урона GURPS (например, "2d+1", "sw+2", "thr-1")
 * Преобразует sw/thr в числовые значения, но НЕ бросает кости для формул с 'd'
 * @param formula Формула урона
 * @param st Сила персонажа (по умолчанию 12)
 * @returns Разобранная формула (число для sw/thr, строка для формул с костями)
 */
export function parseDamageString(damageFormula: string, st: number = 10): ParsedDamage {
  const formula = damageFormula.toLowerCase().trim();

  let baseFormula: string;
  let formulaModifier = 0;

  // 1. Обработка sw/thr
  if (formula.startsWith('sw') || formula.startsWith('thr')) {
    const stDamage = getStrengthDamage(st);
    baseFormula = formula.startsWith('sw') ? stDamage.sw : stDamage.thr;

    const modifierMatch = formula.match(/([+-]\d+)$/);
    if (modifierMatch) {
      formulaModifier = parseInt(modifierMatch[1], 10);
    }
  } else {
    baseFormula = formula;
  }

  // 2. Парсинг базовой формулы (например, "2d-1")
  const diceMatch = baseFormula.match(/(\d+)d([+-]\d+)?/);

  // TODO: зачем? лучше обрабатывать как ошибку
  if (!diceMatch) {
    // Если это просто число (например, для некоторого оружия)
    const flatDamage = parseInt(baseFormula, 10);
    return { dice: 0, sides: 0, modifier: isNaN(flatDamage) ? 0 : flatDamage };
  }

  // TODO: hm?
  const dice = parseInt(diceMatch[1], 10);
  const baseModifier = diceMatch[2] ? parseInt(diceMatch[2], 10) : 0;

  return {
    dice,
    sides: 6, // В GURPS урон почти всегда на d6
    modifier: baseModifier + formulaModifier,
  };
}

// Функция для подсчета среднего урона
export function getAverageDamage(parsed: ParsedDamage): number {
  if (parsed.dice === 0) {
    return parsed.modifier;
  }
  const avgRoll = parsed.dice * (parsed.sides + 1) / 2;
  return avgRoll + parsed.modifier;
}

/**
 * Выполняет реальный бросок костей для формулы с костями
 * @param diceFormula Формула с костями (например, "2d+1", "1d-2")
 * @returns Результат броска костей
 */
export function rollDice(diceFormula: ParsedDamage): number {
  // Бросаем реальные кости
  let total = 0;
  for (let i = 0; i < diceFormula.dice; i++) {
    total += Math.floor(Math.random() * diceFormula.sides) + 1; // d6: от 1 до 6
  }

  return Math.max(1, total + diceFormula.modifier);
}

export interface CriticalHitResult {
  hitSuccess: boolean;
  isCritical: boolean;
  isAutoMaxDamage: boolean;
}

export interface DamageCalculationParams {
  baseDamage: string; // Формула урона как строка
  isAutoMaxDamage: boolean;
  armorValue: number;
  damageTypeMultiplier: number;
  locationVitalityMultiplier: number;
  extraDamage?: number;
  attackerST?: number; // Сила атакующего для парсинга sw/thr
}

export interface DamageResult {
  finalDamage: number;
  damageAfterArmor: number;
  multipliedDamage: number;
  effectiveArmor: number;
}

export interface InjuryResult {
  hpLoss: number;
  newHP: number;
  maxHP: number;
  isMajorWound: boolean;
  shockPenalty: number;
  isStunned: boolean;
  isUnconscious: boolean;
  isDead: boolean;
  deathCheckRequired: boolean;
  unconsciousCheckRequired: boolean;
  moveReduced: boolean;
  dodgeReduced: boolean;
  conditions: string[];
  description: string;
}

export interface CharacterState {
  currentHP: number;
  maxHP: number;
  isStunned: boolean;
  shockPenalty: number;
}

/**
 * Выполняет проверку попадания согласно правилам GURPS 4ed
 * @param hitRoll Результат броска 3d6 (3-18)
 * @param effectiveSkill Эффективный навык после всех модификаторов
 * @returns Результат проверки с информацией о критических попаданиях
 */
export function calculateHitResult(hitRoll: number, effectiveSkill: number): CriticalHitResult {
  let hitSuccess = false;
  let isCritical = false;
  let isAutoMaxDamage = false;

  if (hitRoll <= 4) {
    // Броски 3 и 4 всегда критические попадания
    hitSuccess = true;
    isCritical = true;
    if (hitRoll === 3) {
      isAutoMaxDamage = true; // Бросок 3 = автоматический максимальный урон
    }
  } else if (hitRoll === 5 && effectiveSkill >= 15) {
    // Бросок 5 критичен при навыке 15+
    hitSuccess = true;
    isCritical = true;
  } else if (hitRoll === 6 && effectiveSkill >= 16) {
    // Бросок 6 критичен при навыке 16+
    hitSuccess = true;
    isCritical = true;
  } else if (hitRoll >= 17) {
    // Броски 17 и 18 всегда промахи
    hitSuccess = false;
  } else {
    // Обычная проверка
    hitSuccess = hitRoll <= effectiveSkill;
  }

  return { hitSuccess, isCritical, isAutoMaxDamage };
}

/**
 * Генерирует бросок 3d6 (3-18) с правильным распределением вероятностей
 * @returns Результат броска трех шестигранных костей
 */
export function roll3d6(): number {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const die3 = Math.floor(Math.random() * 6) + 1;
  return die1 + die2 + die3;
}

/**
 * Рассчитывает эффекты травм согласно правилам GURPS 4ed
 * @param penetratingDamage Проникающий урон после брони
 * @param currentHP Текущие HP персонажа
 * @param maxHP Максимальные HP персонажа
 * @param damageLocation Локация попадания (для торса может быть оглушение)
 * @returns Результат травмы со всеми эффектами
 */
export function calculateInjuryEffects(
  penetratingDamage: number,
  currentHP: number,
  maxHP: number,
  damageLocation: string = 'torso'
): InjuryResult {
  const hpLoss = penetratingDamage;
  const newHP = currentHP - hpLoss;

  // Major Wound: урон больше 1/2 от максимальных HP
  const isMajorWound = hpLoss > Math.floor(maxHP / 2);

  // Shock penalty: -1 за каждый потерянный HP (максимум -4)
  // Если у персонажа 20+ HP, то -1 за каждые (HP/10) потерянных HP
  let shockPenalty = 0;
  if (hpLoss > 0) {
    if (maxHP >= 20) {
      shockPenalty = Math.min(4, Math.floor(hpLoss / Math.floor(maxHP / 10)));
    } else {
      shockPenalty = Math.min(4, hpLoss);
    }
  }

  // Состояния и условия
  const conditions: string[] = [];
  let isStunned = false;
  let isUnconscious = false;
  let isDead = false;
  let deathCheckRequired = false;
  let unconsciousCheckRequired = false;
  let moveReduced = false;
  let dodgeReduced = false;

  // Major Wound в торс может вызвать оглушение
  if (isMajorWound && damageLocation.toLowerCase() === 'torso') {
    isStunned = true;
    conditions.push('🌀 Оглушение от Major Wound в торс (требуется бросок HT)');
  }

  // Эффекты в зависимости от текущих HP
  if (newHP <= 0) {
    // При 0 или меньше HP
    unconsciousCheckRequired = true;
    conditions.push('💀 Требуется бросок HT каждый ход против потери сознания');

    // Проверки смерти при отрицательных HP
    const deathThresholds = [];
    for (let multiplier = 1; multiplier <= 5; multiplier++) {
      const threshold = -multiplier * maxHP;
      if (newHP <= threshold) {
        if (multiplier === 5) {
          isDead = true;
          conditions.push('💀 АВТОМАТИЧЕСКАЯ СМЕРТЬ при -5×HP');
          break;
        } else {
          deathCheckRequired = true;
          deathThresholds.push(`-${multiplier}×HP`);
        }
      }
    }

    if (deathThresholds.length > 0 && !isDead) {
      conditions.push(`💀 Требуется бросок HT против смерти (достигнут порог: ${deathThresholds[deathThresholds.length - 1]})`);
    }
  } else if (newHP < Math.ceil(maxHP / 3)) {
    // При менее чем 1/3 HP
    moveReduced = true;
    dodgeReduced = true;
    conditions.push('🩸 Менее 1/3 HP: Move и Dodge уменьшены вдвое (округление вверх)');
  }

  // Shock penalty
  if (shockPenalty > 0) {
    conditions.push(`⚡ Шок: -${shockPenalty} к DX, IQ и основанным на них навыкам на следующий ход`);
  }

  // Описание состояния
  let description = '';
  if (isDead) {
    description = '💀 ПЕРСОНАЖ МЕРТВ';
  } else if (isUnconscious) {
    description = '😵 Персонаж без сознания';
  } else if (isStunned) {
    description = '🌀 Персонаж оглушен (-4 к защите, следующий ход - Ничего не делать)';
  } else if (newHP <= 0) {
    description = `💀 Персонаж при смерти (${newHP} HP). Держится за счет силы воли!`;
  } else if (moveReduced) {
    description = `🩸 Персонаж серьезно ранен (${newHP}/${maxHP} HP). Движение затруднено.`;
  } else {
    description = `🎯 Персонаж ранен (${newHP}/${maxHP} HP)`;
  }

  return {
    hpLoss,
    newHP,
    maxHP,
    isMajorWound,
    shockPenalty,
    isStunned,
    isUnconscious,
    isDead,
    deathCheckRequired,
    unconsciousCheckRequired,
    moveReduced,
    dodgeReduced,
    conditions,
    description
  };
}

/**
 * Рассчитывает финальный урон с учетом брони, типа урона и локации
 * @param params Параметры расчета урона
 * @returns Результат расчета урона
 */
export function calculateDamage(params: DamageCalculationParams): DamageResult {
  const {
    baseDamage,
    isAutoMaxDamage,
    armorValue,
    damageTypeMultiplier,
    locationVitalityMultiplier,
    extraDamage = 0,
    attackerST = 12
  } = params;

  // Парсим формулу урона и бросаем кости
  const parsedDamage = parseDamageString(baseDamage, attackerST);
  let damage: number;

  if (parsedDamage.dice === 0) {
    // Это просто число
    damage = parsedDamage.modifier;
  } else {
    // Бросаем кости для формулы
    damage = rollDice(parsedDamage);
  }
  if (!isAutoMaxDamage) {
    // Обработка модификаторов урона
    if (extraDamage > 0) {
      damage += extraDamage; // Абсолютный бонус
    } else if (extraDamage < 0 && extraDamage > -1) {
      damage = Math.floor(damage * (1 + extraDamage)); // Процентный модификатор (-0.5 = -50%)
    } else if (extraDamage < -1) {
      damage += extraDamage; // Абсолютный штраф
    }
  }

  // Эффективная броня (не может быть меньше 0)
  const effectiveArmor = Math.max(0, armorValue);

  // Урон после брони
  const damageAfterArmor = Math.max(0, damage - effectiveArmor);

  // Урон с учетом типа урона
  const multipliedDamage = Math.floor(damageAfterArmor * damageTypeMultiplier);

  // Финальный урон с учетом локации
  const finalDamage = Math.floor(multipliedDamage * locationVitalityMultiplier);

  return {
    finalDamage,
    damageAfterArmor,
    multipliedDamage,
    effectiveArmor
  };
}

/**
 * Генерирует описание результата попадания/промаха
 * @param hitRoll Результат броска атаки
 * @param isCritical Является ли попадание критическим
 * @param isAutoMaxDamage Автоматический максимальный урон (бросок 3)
 * @returns Префикс для описания результата
 */
export function getHitDescription(hitRoll: number, isCritical: boolean, isAutoMaxDamage: boolean): string {
  if (isCritical) {
    return isAutoMaxDamage ? '🎯 КРИТИЧЕСКОЕ ПОПАДАНИЕ (3)! МАКСИМАЛЬНЫЙ УРОН!' : '🎯 КРИТИЧЕСКОЕ ПОПАДАНИЕ!';
  }
  return 'Попадание';
}

/**
 * Генерирует описание результата промаха
 * @param hitRoll Результат броска атаки
 * @returns Описание промаха
 */
export function getMissDescription(hitRoll: number): string {
  return hitRoll >= 17 ? 'КРИТИЧЕСКИЙ ПРОМАХ!' : 'Промах!';
}

/**
 * Определяет CSS классы для отображения результата боя
 * @param hitSuccess Успешное попадание
 * @param isCritical Критическое попадание
 * @param hitRoll Результат броска
 * @param finalDamage Финальный урон
 * @returns CSS классы для стилизации
 */
export function getCombatResultClasses(
  hitSuccess: boolean,
  isCritical: boolean,
  hitRoll: number,
  finalDamage: number
): string {
  if (hitSuccess) {
    if (isCritical) {
      return 'bg-green-900/30 border-green-400/50 text-text-primary';
    }
    return finalDamage > 0
      ? 'bg-red-900/20 border-red-500/30 text-text-primary'
      : 'bg-yellow-900/20 border-yellow-500/30 text-text-primary';
  } else {
    return hitRoll >= 17
      ? 'bg-red-900/30 border-red-600/50 text-text-primary'
      : 'bg-background border-border text-text-primary';
  }
}