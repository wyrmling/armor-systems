// Расширенные функции анализа
export function calculateEfficiencyMetrics(damageFunction, armorRange = [0, 50], baseDamage = 30) {
  const data = [];
  for (let armor = armorRange[0]; armor <= armorRange[1]; armor++) {
    const damage = damageFunction(baseDamage, armor);
    const effectiveness = 1 - (damage / baseDamage); // Доля заблокированного урона
    const efficiency = armor > 0 ? effectiveness / armor : 0; // Эффективность на единицу брони
    data.push({
      armor,
      damage,
      effectiveness,
      efficiency,
      survivability: baseDamage > 0 ? Math.ceil(100 / Math.max(1, damage)) : Infinity // Количество ударов до смерти
    });
  }
  return data;
}

export function findOptimalArmor(damageFunction, armorRange = [0, 50], baseDamage = 30, costFunction = null) {
  const data = calculateEfficiencyMetrics(damageFunction, armorRange, baseDamage);
  
  // Находим точку максимальной эффективности
  let maxEfficiency = 0;
  let optimalArmor = 0;
  
  data.forEach(point => {
    if (point.efficiency > maxEfficiency) {
      maxEfficiency = point.efficiency;
      optimalArmor = point.armor;
    }
  });

  // Находим точку убывающей отдачи (где прирост эффективности падает ниже 5%)
  let diminishingPoint = armorRange[1];
  for (let i = 1; i < data.length; i++) {
    const prevEff = data[i-1].effectiveness;
    const currEff = data[i].effectiveness;
    const marginalGain = currEff - prevEff;
    if (marginalGain < 0.05 && i > 5) { // Требуем минимум 5 единиц брони
      diminishingPoint = data[i].armor;
      break;
    }
  }

  return {
    optimal: optimalArmor,
    maxEfficiency: maxEfficiency,
    diminishingPoint: diminishingPoint,
    data: data
  };
}

export function calculateVariance(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return { mean, variance, stdDev: Math.sqrt(variance) };
}

// Анализ вариативности урона для механик с рандомом
export function analyzeVariability(mechanic, params, trials = 1000) {
  const results = [];
  
  for (let i = 0; i < trials; i++) {
    let damage = 0;
    
    if (mechanic.key === 'soak') {
      const pool = Math.max(0, Math.floor(params.body + params.armor + (params.poolMod || 0)));
      const p = Math.max(0, Math.min(1, (params.pSuccess || 33.3) / 100));
      let successes = 0;
      for (let j = 0; j < pool; j++) {
        if (Math.random() < p) successes++;
      }
      damage = Math.max(0, params.dv - successes);
    } else if (mechanic.key === 'ac') {
      const needed = Math.min(20, Math.max(1, params.ac - params.attackBonus));
      const roll = Math.floor(Math.random() * 20) + 1;
      damage = roll >= needed ? params.baseDamage : 0;
    } else {
      // Для детерминированных механик просто возвращаем постоянное значение
      try {
        const result = mechanic.compute(params);
        if (typeof result === 'string') {
          // Пытаемся извлечь числовое значение из строки результата
          const match = result.match(/урон[:\s]*(\d+\.?\d*)/i);
          damage = match ? parseFloat(match[1]) : 0;
        }
      } catch (e) {
        damage = 0;
      }
    }
    
    results.push(damage);
  }
  
  const stats = calculateVariance(results);
  const sorted = results.sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = Math.min(...results);
  const max = Math.max(...results);
  const q25 = sorted[Math.floor(sorted.length * 0.25)];
  const q75 = sorted[Math.floor(sorted.length * 0.75)];
  
  return {
    mean: stats.mean,
    median,
    stdDev: stats.stdDev,
    variance: stats.variance,
    min,
    max,
    q25,
    q75,
    iqr: q75 - q25,
    cv: stats.mean > 0 ? stats.stdDev / stats.mean : 0, // коэффициент вариации
    results
  };
}