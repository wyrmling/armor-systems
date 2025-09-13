// Механики брони - данные и функции расчета
export const mechanics = [
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
        // Простая модель D&D: попадание на d20 + attackBonus >= AC
        // Вероятность = количество значений на d20, при которых проходит. Игнор критов/автопровалов для простоты.
        let needed = ac - attackBonus; // нужно на кости
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
  // ... остальные механики будут добавлены
];