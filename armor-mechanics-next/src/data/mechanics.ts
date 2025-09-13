import { Mechanic } from '@/types/mechanics';

export const mechanics: Mechanic[] = [
  {
    key: 'ac',
    name: 'Избежание/уклонение (AC/Defense)',
    desc: 'Броня повышает шанс промаха атакующего теста. Урон не уменьшается, если попадание состоялось.',
    inputs: [
      { key: 'attackBonus', label: 'Бонус атаки (или шанс попадания, %)', type: 'number', value: 5 },
      { key: 'ac', label: 'Класс доспеха / Защита (AC/Defense)', type: 'number', value: 15 },
      { key: 'baseDamage', label: 'Средний урон при попадании', type: 'number', value: 10 },
      { key: 'd20', label: 'Использовать d20-модель? (иначе %)', type: 'checkbox', value: true },
    ],
    compute: (vals) => {
      const { attackBonus, ac, baseDamage, d20 } = vals;
      if (d20) {
        let needed = ac - attackBonus;
        needed = Math.min(20, Math.max(1, needed));
        const pHit = (21 - needed) / 20;
        const edps = pHit * baseDamage;
        return `Порог попадания: ${needed}+ на d20\nP(hit) ≈ ${(pHit*100).toFixed(1)}%\nОжидаемый урон за удар: ${edps.toFixed(2)}`;
      } else {
        const pHit = Math.max(0, Math.min(1, (attackBonus - ac + 100) / 100));
        const edps = pHit * baseDamage;
        return `P(hit): ${(pHit*100).toFixed(1)}%\nОжидаемый урон за удар: ${edps.toFixed(2)}`;
      }
    }
  },
  {
    key: 'flatdr',
    name: 'Плоское поглощение (Flat DR)',
    desc: 'Из входящего урона вычитается фиксированное значение DR.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 20 },
      { key: 'dr', label: 'DR (плоское поглощение)', type: 'number', value: 5 },
      { key: 'min1', label: 'Минимум 1 урон?', type: 'checkbox', value: false }
    ],
    compute: ({ damage, dr, min1 }) => {
      let out = Math.max(0, damage - dr);
      if (min1 && damage > 0 && out === 0) out = 1;
      return `Урон: ${out}`;
    }
  },
  {
    key: 'percentdr',
    name: 'Процентное поглощение (% DR)',
    desc: 'Урон уменьшается на фиксированный процент.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 30 },
      { key: 'drp', label: 'DR в процентах', type: 'number', value: 25 }
    ],
    compute: ({ damage, drp }) => {
      const r = Math.max(0, Math.min(1, drp/100));
      const out = Math.round(damage * (1 - r) * 100) / 100;
      return `Урон: ${out} (снижено на ${(r*100).toFixed(1)}%)`;
    }
  },
  {
    key: 'diminish',
    name: 'Убывающая отдача (Diminishing Returns)',
    desc: 'Броня работает по формуле урон * (K/(K + armor)). Каждая следующая единица брони менее эффективна.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 30 },
      { key: 'armor', label: 'Броня', type: 'number', value: 10 },
      { key: 'k', label: 'Константа K (чем больше, тем слабее броня)', type: 'number', value: 100 }
    ],
    compute: ({ damage, armor, k }) => {
      const kVal = Math.max(0.0001, k);
      const out = damage * (kVal / (kVal + armor));
      const reduction = ((damage - out) / damage * 100);
      return `Урон: ${out.toFixed(2)}\nСнижение: ${reduction.toFixed(1)}%\nЭффективность брони: ${(armor/(kVal + armor)*100).toFixed(1)}%`;
    }
  },
  {
    key: 'dt_dr',
    name: 'Damage Threshold + DR',
    desc: 'Комбинированная система: сначала проверяется порог (DT), затем применяется процентное снижение (DR).',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 30 },
      { key: 'dt', label: 'Damage Threshold (порог)', type: 'number', value: 5 },
      { key: 'drp', label: 'DR в процентах', type: 'number', value: 25 },
      { key: 'min1', label: 'Минимум 1 урон?', type: 'checkbox', value: false }
    ],
    compute: ({ damage, dt, drp, min1 }) => {
      let afterDT = Math.max(0, damage - dt);
      if (afterDT === 0 && damage > 0 && min1) afterDT = 1;
      const r = Math.max(0, Math.min(1, drp/100));
      let out = afterDT * (1 - r);
      if (min1 && damage > 0 && out === 0) out = 1;
      return `После DT: ${afterDT}\nПосле DR: ${out.toFixed(2)}\nОбщее снижение: ${((damage - out)/damage*100).toFixed(1)}%`;
    }
  },
  {
    key: 'soak',
    name: 'Soak-дайсы / оппонирующие броски',
    desc: 'Цель кидает пул дайсов (например, Тело+Броня). Каждая «успешная грань» снижает урон на 1.',
    inputs: [
      { key: 'dv', label: 'Базовый урон (DV)', type: 'number', value: 8 },
      { key: 'body', label: 'Тело/Телосложение', type: 'number', value: 3 },
      { key: 'armor', label: 'Броня (в пул)', type: 'number', value: 4 },
      { key: 'poolMod', label: 'Модификатор пула', type: 'number', value: 0 },
      { key: 'pSuccess', label: 'Вероятность успеха на кубе, %', type: 'number', value: 33.3 },
      { key: 'trials', label: 'Monte Carlo, прогонов', type: 'number', value: 100 }
    ],
    compute: ({ dv, body, armor, poolMod, pSuccess, trials }) => {
      const pool = Math.max(0, Math.floor(body + armor + poolMod));
      const p = Math.max(0, Math.min(1, pSuccess/100));
      const expSoak = pool * p;
      const expDmg = Math.max(0, dv - expSoak);
      let out = `Пул: ${pool} | P(успеха): ${(p*100).toFixed(1)}%\nОжидаемый soak: ${expSoak.toFixed(2)}\nОжидаемый урон: ${expDmg.toFixed(2)}`;
      
      if (trials > 0) {
        let sum = 0; let min = Infinity; let max = -Infinity;
        for (let t = 0; t < trials; t++) {
          let successes = 0;
          for (let i = 0; i < pool; i++) if (Math.random() < p) successes++;
          const dealt = Math.max(0, dv - successes);
          sum += dealt; 
          if (dealt < min) min = dealt; 
          if (dealt > max) max = dealt;
        }
        const mean = sum / trials;
        out += `\nСимуляция ${trials} прогонов → средний урон: ${mean.toFixed(2)}, мин: ${min}, макс: ${max}`;
      }
      
      return out;
    }
  },
  {
    key: 'compare',
    name: 'Сравнение механик',
    desc: 'Выберите несколько механик, настройте их параметры и запустите сравнение. Результаты будут показаны рядом.',
    inputs: [],
    compute: () => 'Используйте панель сравнения'
  }
];