import { RangedWeapon, MeleeWeapon } from '@/gurps/data/weapons';
import { parseDamageString, type ParsedDamage } from './combat';


export interface DamageDistribution {
  value: number;
  probability: number;
}

export interface DamageStats {
  mean: number;
  stdDev: number;
}

export interface WeaponAnalysisData extends WeaponStats {
  distribution: DamageDistribution[];
  stats: DamageStats;
}

export interface WeaponStats {
  name: string;
  damage: string;
  damageType: string;
  category: string;
}

// --- Расчет распределения вероятностей ---

// Кэш для мемоизации результатов, чтобы не пересчитывать одно и то же
const distributionCache = new Map<string, Map<number, number>>();

function calculateDistributionRecursive(dice: number, sides: number): Map<number, number> {
  const cacheKey = `${dice}d${sides}`;
  if (distributionCache.has(cacheKey)) {
    return distributionCache.get(cacheKey)!;
  }

  if (dice === 0) {
    const map = new Map<number, number>();
    map.set(0, 1); // 0 костей = результат 0 с вероятностью 100%
    return map;
  }

  if (dice === 1) {
    const map = new Map<number, number>();
    const prob = 1 / sides;
    for (let i = 1; i <= sides; i++) {
      map.set(i, prob);
    }
    distributionCache.set(cacheKey, map);
    return map;
  }

  // Рекурсивно получаем распределение для (N-1) костей
  const prevDistribution = calculateDistributionRecursive(dice - 1, sides);
  const newDistribution = new Map<number, number>();

  // Комбинируем с результатом броска одной кости
  for (const [sum, prob] of prevDistribution.entries()) {
    for (let roll = 1; roll <= sides; roll++) {
      const newSum = sum + roll;
      const newProb = prob * (1 / sides);
      newDistribution.set(newSum, (newDistribution.get(newSum) || 0) + newProb);
    }
  }

  distributionCache.set(cacheKey, newDistribution);
  return newDistribution;
}

export function getDamageDistribution(parsedDamage: ParsedDamage): DamageDistribution[] {
  const { dice, sides, modifier } = parsedDamage;

  if (dice === 0) {
    return [{ value: Math.max(0, modifier), probability: 1 }];
  }

  const baseDistribution = calculateDistributionRecursive(dice, sides);

  const finalDistribution: DamageDistribution[] = [];
  for (const [sum, probability] of baseDistribution.entries()) {
    finalDistribution.push({
      value: Math.max(0, sum + modifier), // Урон не может быть отрицательным
      probability,
    });
  }

  // Сортируем по значению урона
  return finalDistribution.sort((a, b) => a.value - b.value);
}

function calculateDamageStats(distribution: DamageDistribution[]): DamageStats {
  const mean = distribution.reduce((acc, { value, probability }) => acc + value * probability, 0);
  const variance = distribution.reduce((acc, { value, probability }) => acc + Math.pow(value - mean, 2) * probability, 0);
  return { mean, stdDev: Math.sqrt(variance) };
}


// --- Главная функция анализа ---

export function analyzeWeapons(
  weapons: (RangedWeapon | MeleeWeapon)[],
  st: number = 10
): WeaponAnalysisData[] {
  return weapons.map(weapon => {
    const parsed = parseDamageString(weapon.damage, st);
    const distribution = getDamageDistribution(parsed);
    const stats = calculateDamageStats(distribution);

    return {
      name: weapon.name,
      damage: weapon.damage,
      damageType: weapon.damageType,
      category: weapon.category,
      distribution,
      stats,
    };
  });
}