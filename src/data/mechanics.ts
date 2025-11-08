import type { Mechanic } from '@/types/mechanics';

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
      return `Урон после DR: ${out}`;
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
    key: 'dt_dr',
    name: 'Порог + процент (DT + DR)',
    desc: 'Сначала порог DT режет малые удары, остаток режется DR%.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 30 },
      { key: 'dt', label: 'DT (порог)', type: 'number', value: 8 },
      { key: 'drp', label: 'DR, %', type: 'number', value: 20 },
      { key: 'min1', label: 'Минимум 1 урон?', type: 'checkbox', value: false }
    ],
    compute: ({ damage, dt, drp, min1 }) => {
      const afterDT = Math.max(0, damage - dt);
      const r = Math.max(0, Math.min(1, drp/100));
      let out = Math.round(afterDT * (1 - r) * 100) / 100;
      if (min1 && damage > 0) out = Math.max(1, out);
      return `После DT: ${afterDT}\nПосле DR%: ${out}`;
    }
  },
  {
    key: 'diminish',
    name: 'Убывающая отдача (K/(K+Armor))',
    desc: 'Мягкая форма снижения урона с параметром кривой K.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 100 },
      { key: 'armor', label: 'Armor', type: 'number', value: 200 },
      { key: 'k', label: 'K (кривая)', type: 'number', value: 100 },
    ],
    compute: ({ damage, armor, k }) => {
      const kVal = Math.max(0.0001, k);
      const mult = kVal / (kVal + Math.max(0, armor));
      const out = Math.round(damage * mult * 100) / 100;
      return `Множитель: ${mult.toFixed(3)}\nУрон после формулы: ${out}`;
    }
  },
  {
    key: 'ap',
    name: 'Бронебойность (AP)',
    desc: 'Атака игнорирует часть брони/снижения.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 40 },
      { key: 'armor', label: 'Armor/DR', type: 'number', value: 15 },
      { key: 'ap', label: 'Armor Penetration (AP)', type: 'number', value: 10 },
      { key: 'mode', label: 'Режим', type: 'select', value: 'flat', options:[
        {value:'flat', label:'Плоская броня (DR − AP)'},
        {value:'percent', label:'Процент (DR% − AP%)'},
        {value:'divisor', label:'Armor Divisor (делитель брони)'}
      ] }
    ],
    compute: ({ damage, armor, ap, mode }) => {
      let out = damage;
      if (mode === 'flat') {
        const eff = Math.max(0, armor - ap);
        out = Math.max(0, damage - eff);
        return `Эффективная броня: ${eff}\nУрон: ${out}`;
      } else if (mode === 'percent') {
        const r = Math.max(0, Math.min(1, armor/100));
        const apR = Math.max(0, Math.min(1, ap/100));
        const effR = Math.max(0, r - apR);
        out = Math.round(damage * (1 - effR) * 100) / 100;
        return `Эффективный DR%: ${(effR*100).toFixed(1)}%\nУрон: ${out}`;
      } else {
        // Armor Divisor: эффективная броня = Armor / max(1, divisor)
        const divisor = Math.max(1, ap);
        const eff = Math.max(0, armor) / divisor;
        out = Math.max(0, damage - eff);
        return `Divisor: x${divisor}\nЭффективная броня: ${eff.toFixed(2)}\nУрон: ${out.toFixed(2)}`;
      }
    }
  },
  {
    key: 'hitloc',
    name: 'По локациям тела (Hit Locations)',
    desc: 'Разные части тела с разной бронёй и шансом попадания.',
    inputs: [
      { key: 'damage', label: 'Базовый урон', type: 'number', value: 30 },
      { key: 'head', label: 'Броня головы', type: 'number', value: 5 },
      { key: 'torso', label: 'Броня торса', type: 'number', value: 10 },
      { key: 'limb', label: 'Броня конечностей', type: 'number', value: 7 },
      { key: 'pHead', label: 'Шанс попадания в голову, %', type: 'number', value: 10 },
      { key: 'pTorso', label: 'Шанс попадания в торс, %', type: 'number', value: 60 },
      { key: 'pLimb', label: 'Шанс попадания в конечности, %', type: 'number', value: 30 },
    ],
    compute: ({ damage, head, torso, limb, pHead, pTorso, pLimb }) => {
      const norm = Math.max(1, pHead + pTorso + pLimb);
      const ph = pHead / norm, pt = pTorso / norm, pl = pLimb / norm;
      const outH = Math.max(0, damage - head);
      const outT = Math.max(0, damage - torso);
      const outL = Math.max(0, damage - limb);
      const e = outH*ph + outT*pt + outL*pl;
      return `Ожидаемый урон: ${e.toFixed(2)}\nГолова: ${outH}, Торс: ${outT}, Конечности: ${outL}\nВероятности (норм.): ${(ph*100).toFixed(1)}% / ${(pt*100).toFixed(1)}% / ${(pl*100).toFixed(1)}%`;
    }
  },
  {
    key: 'ablative',
    name: 'Аблятивная броня (деградация)',
    desc: 'Броня уменьшается на N после каждого попадания, пока не истощится.',
    inputs: [
      { key: 'shots', label: 'Количество попаданий', type: 'number', value: 5 },
      { key: 'damage', label: 'Урон за попадание', type: 'number', value: 20 },
      { key: 'armor', label: 'Начальная броня (DR)', type: 'number', value: 10 },
      { key: 'degrade', label: 'Падение брони за попадание', type: 'number', value: 1 },
      { key: 'minArmor', label: 'Минимальная броня (не ниже)', type: 'number', value: 0 },
    ],
    compute: ({ shots, damage, armor, degrade, minArmor }) => {
      let a = armor, total = 0, log = [];
      for (let i=1;i<=shots;i++) {
        const eff = Math.max(minArmor, a);
        const dealt = Math.max(0, damage - eff);
        total += dealt;
        log.push(`#${i}: броня ${eff} → урон ${dealt}`);
        a = Math.max(minArmor, a - degrade);
      }
      return log.join('\n') + `\nИтого урон: ${total}`;
    }
  },
  {
    key: 'shield',
    name: 'Щит/барьер перед HP',
    desc: 'Отдельная полоса щита, которая гасит урон перед HP, может регенерироваться между сериями ударов.',
    inputs: [
      { key: 'shield', label: 'Щит (ёмкость)', type: 'number', value: 50 },
      { key: 'hp', label: 'HP', type: 'number', value: 100 },
      { key: 'n', label: 'Число ударов', type: 'number', value: 5 },
      { key: 'dmg', label: 'Урон на удар', type: 'number', value: 30 },
      { key: 'regen', label: 'Реген щита между ударами', type: 'number', value: 0 },
    ],
    compute: ({ shield, hp, n, dmg, regen }) => {
      let s = shield, h = hp;
      const lines = [];
      for (let i=1;i<=n;i++) {
        let taken = dmg;
        const sBefore = s;
        const use = Math.min(s, taken);
        s -= use;
        taken -= use;
        h -= taken;
        lines.push(`#${i}: щит ${sBefore}→${s}, HP −${taken} → ${h}`);
        s = Math.min(shield, s + regen);
        if (h <= 0) {
          lines.push('Цель выведена из строя.');
          break;
        }
      }
      return lines.join('\n');
    }
  },
  {
    key: 'block',
    name: 'Блок/парирование',
    desc: 'Активный блок снижает урон фиксированно/процентно или переводит его в выносливость.',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 40 },
      { key: 'blockFlat', label: 'Блок (фикс.)', type: 'number', value: 10 },
      { key: 'blockPct', label: 'Блок, %', type: 'number', value: 25 },
      { key: 'toStamina', label: 'В стамину, %', type: 'number', value: 50 },
      { key: 'stamina', label: 'Запас стамины', type: 'number', value: 50 },
    ],
    compute: ({ damage, blockFlat, blockPct, toStamina, stamina }) => {
      const afterFlat = Math.max(0, damage - blockFlat);
      const r = Math.max(0, Math.min(1, blockPct/100));
      const afterPct = afterFlat * (1 - r);
      const p = Math.max(0, Math.min(1, toStamina/100));
      const intoSta = Math.min(stamina, afterPct * p);
      const hpDmg = afterPct - intoSta;
      const staLeft = stamina - intoSta;
      return `После блока (фикс): ${afterFlat.toFixed(2)}\nПосле блока (%): ${afterPct.toFixed(2)}\nВ стамину: ${intoSta.toFixed(2)} (осталось ${staLeft.toFixed(2)})\nВ HP: ${hpDmg.toFixed(2)}`;
    }
  },
  {
    key: 'poise',
    name: 'Poise/стойкость',
    desc: 'Сопротивление прерыванию/стану на основе порогов стойкости и веса атаки.',
    inputs: [
      { key: 'poise', label: 'Poise (стойкость цели)', type: 'number', value: 60 },
      { key: 'poiseBreak', label: 'Poise damage за удар', type: 'number', value: 30 },
      { key: 'recover', label: 'Восстановление перед след. ударом', type: 'number', value: 10 },
      { key: 'n', label: 'Число ударов', type: 'number', value: 5 },
    ],
    compute: ({ poise, poiseBreak, recover, n }) => {
      let meter = poise;
      const lines = [];
      for (let i=1;i<=n;i++) {
        const before = meter;
        meter -= poiseBreak;
        const stagger = meter <= 0;
        lines.push(`#${i}: поиз ${before}→${meter} ${stagger ? '(прерывание!)' : ''}`);
        if (stagger) meter = poise;
        else meter = Math.min(poise, meter + recover);
      }
      return lines.join('\n');
    }
  },
  {
    key: 'resists',
    name: 'Резисты по типам урона',
    desc: 'Отдельные резисты к физ/маг типам. Итог — свёртка по типам урона.',
    inputs: [
      { key: 'phys', label: 'Физический урон', type: 'number', value: 50 },
      { key: 'slash', label: 'Рубящий DR', type: 'number', value: 10 },
      { key: 'pierce', label: 'Колющий DR', type: 'number', value: 5 },
      { key: 'blunt', label: 'Дробящий DR', type: 'number', value: 8 },
      { key: 'pSlash', label: '% рубящего в атаке', type: 'number', value: 40 },
      { key: 'pPierce', label: '% колющего', type: 'number', value: 40 },
      { key: 'pBlunt', label: '% дробящего', type: 'number', value: 20 },
    ],
    compute: ({ phys, slash, pierce, blunt, pSlash, pPierce, pBlunt }) => {
      const sum = Math.max(1, pSlash + pPierce + pBlunt);
      const ws = pSlash/sum, wp = pPierce/sum, wb = pBlunt/sum;
      const s = Math.max(0, phys*ws - slash);
      const p = Math.max(0, phys*wp - pierce);
      const b = Math.max(0, phys*wb - blunt);
      const out = s+p+b;
      return `Итого урон: ${out.toFixed(2)}\nПо типам: рубящий ${s.toFixed(2)}, колющий ${p.toFixed(2)}, дробящий ${b.toFixed(2)}`;
    }
  },
  {
    key: 'cover',
    name: 'Укрытие как броня/уклонение',
    desc: 'Кавер даёт бонус к защите или снижению урона в зависимости от модели.',
    inputs: [
      { key: 'mode', label: 'Модель', type: 'select', value: 'def', options:[
        { value:'def', label:'Бонус к защите (AC/Defense)' },
        { value:'dr', label:'Плоское снижение (DR)' },
        { value:'pct', label:'Процентное снижение' }
      ]},
      { key: 'attackBonus', label: 'Бонус атаки / шанс (%)', type: 'number', value: 5 },
      { key: 'defBase', label: 'Базовая защита', type: 'number', value: 12 },
      { key: 'coverVal', label: 'Значение укрытия (AC или DR или %)', type: 'number', value: 2 },
      { key: 'damage', label: 'Базовый урон при попадании', type: 'number', value: 20 },
    ],
    compute: ({ mode, attackBonus, defBase, coverVal, damage }) => {
      if (mode === 'def') {
        const needed = Math.min(20, Math.max(1, (defBase+coverVal) - attackBonus));
        const pHit = (21 - needed) / 20;
        const e = pHit * damage;
        return `AC с укрытием: ${defBase+coverVal}\nP(hit): ${(pHit*100).toFixed(1)}%\nОжидаемый урон: ${e.toFixed(2)}`;
      } else if (mode === 'dr') {
        const out = Math.max(0, damage - coverVal);
        return `DR укрытия: ${coverVal}\nУрон: ${out}`;
      } else {
        const r = Math.max(0, Math.min(1, coverVal/100));
        const out = Math.round(damage * (1 - r) * 100) / 100;
        return `Снижение укрытия: ${(r*100).toFixed(1)}%\nУрон: ${out}`;
      }
    }
  },
  {
    key: 'soak',
    name: 'Soak-дайсы / оппонирующие броски',
    desc: 'Цель кидает пул дайсов (например, Тело+Броня). Каждая «успешная грань» снижает урон на 1. По умолчанию успех на 5+ (1/3).',
    inputs: [
      { key: 'dv', label: 'Базовый урон (DV)', type: 'number', value: 8 },
      { key: 'body', label: 'Тело/Телосложение', type: 'number', value: 3 },
      { key: 'armor', label: 'Броня (в пул)', type: 'number', value: 4 },
      { key: 'poolMod', label: 'Модификатор пула', type: 'number', value: 0 },
      { key: 'pSuccess', label: 'Вероятность успеха на кубе', type: 'number', value: 33.3 },
      { key: 'trials', label: 'Monte Carlo, прогонов', type: 'number', value: 1000 },
      { key: 'bucket', label: 'Ширина бина гистограммы', type: 'number', value: 1 },
    ],
    compute: ({ dv, body, armor, poolMod, pSuccess, trials, bucket }) => {
      const pool = Math.max(0, Math.floor(body + armor + poolMod));
      const p = Math.max(0, Math.min(1, pSuccess/100));
      const expSoak = pool * p;
      const expDmg = Math.max(0, dv - expSoak);
      let out = `Пул: ${pool} | P(успеха): ${(p*100).toFixed(1)}%\nОжидаемый soak: ${expSoak.toFixed(2)}\nОжидаемый урон: ${expDmg.toFixed(2)}`;

      const trialsNum = Math.max(0, Math.floor(trials));
      const hist = [];

      if (trialsNum > 0) {
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        let counts = {};

        for (let t=0;t<trialsNum;t++) {
          let successes = 0;
          for (let i=0;i<pool;i++) if (Math.random() < p) successes++;
          const dealt = Math.max(0, dv - successes);
          sum += dealt;
          if (dealt < min) min = dealt;
          if (dealt > max) max = dealt;
          const b = Math.floor(dealt / Math.max(1, bucket));
          counts[b] = (counts[b]||0) + 1;
        }
        const mean = sum / trialsNum;
        out += `\nСимуляция ${trialsNum} прогонов → средний урон: ${mean.toFixed(2)}, мин: ${min}, макс: ${max}`;

        const bs = Object.keys(counts).map(k=>({ bin: parseInt(k), count: counts[k] })).sort((a,b)=>a.bin-b.bin);
        bs.forEach(b=>hist.push({ label: `${b.bin*bucket}-${(b.bin+1)*bucket}`, count: b.count }));
      }

      return { text: out, hist };
    }
  },
  {
    key: 'reactive',
    name: 'Зарядная/реактивная броня',
    desc: 'Ограниченное число зарядов гасит часть урона первых попаданий.',
    inputs: [
      { key: 'hits', label: 'Число попаданий', type: 'number', value: 5 },
      { key: 'dmg', label: 'Урон за попадание', type: 'number', value: 30 },
      { key: 'charges', label: 'Заряды брони', type: 'number', value: 2 },
      { key: 'absorb', label: 'Поглощение за заряд (фикс.)', type: 'number', value: 25 },
      { key: 'mode', label: 'Режим', type: 'select', value: 'flat', options:[
        { value:'flat', label:'Фикс. поглощение' },
        { value:'percent', label:'Процент поглощения за заряд' }
      ]}
    ],
    compute: ({ hits, dmg, charges, absorb, mode }) => {
      let c = charges;
      let total = 0;
      const lines = [];
      for (let i=1;i<=hits;i++) {
        let dealt = dmg;
        let used = 0;
        if (c > 0) {
          if (mode === 'percent') {
            const r = Math.max(0, Math.min(1, absorb/100));
            used = dealt * r;
            dealt = dealt * (1 - r);
          } else {
            used = Math.min(dealt, absorb);
            dealt -= used;
          }
          c--;
        }
        total += dealt;
        lines.push(`#${i}: заряд ${charges - c}/${charges}, поглощено ${used.toFixed(2)}, урон ${dealt.toFixed(2)}`);
      }
      lines.push(`Итоговый урон: ${total.toFixed(2)}`);
      return lines.join('\n');
    }
  },
  {
    key: 'layering',
    name: 'Покрытие/Слоистость (Coverage/Layering)',
    desc: 'Слои брони с вероятностью покрытия зоны. Эффективная защита — сумма DR_i × coverage_i; ожидание по зонам.',
    inputs: [
      { key: 'damage', label: 'Базовый урон', type: 'number', value: 30 },
      { key: 'pHead', label: 'Шанс головы, %', type: 'number', value: 10 },
      { key: 'pTorso', label: 'Шанс торса, %', type: 'number', value: 60 },
      { key: 'pLimb', label: 'Шанс конечностей, %', type: 'number', value: 30 },
      { key: 'h1', label: 'Голова L1 DR', type: 'number', value: 4 },
      { key: 'h1c', label: 'Голова L1 coverage %', type: 'number', value: 100 },
      { key: 'h2', label: 'Голова L2 DR', type: 'number', value: 2 },
      { key: 'h2c', label: 'Голова L2 coverage %', type: 'number', value: 80 },
      { key: 't1', label: 'Торс L1 DR', type: 'number', value: 6 },
      { key: 't1c', label: 'Торс L1 coverage %', type: 'number', value: 100 },
      { key: 't2', label: 'Торс L2 DR', type: 'number', value: 3 },
      { key: 't2c', label: 'Торс L2 coverage %', type: 'number', value: 80 },
      { key: 'l1', label: 'Конечности L1 DR', type: 'number', value: 3 },
      { key: 'l1c', label: 'Конечности L1 coverage %', type: 'number', value: 70 },
      { key: 'l2', label: 'Конечности L2 DR', type: 'number', value: 1 },
      { key: 'l2c', label: 'Конечности L2 coverage %', type: 'number', value: 60 }
    ],
    compute: ({ damage, pHead, pTorso, pLimb, h1, h1c, h2, h2c, t1, t1c, t2, t2c, l1, l1c, l2, l2c }) => {
      const ph = pHead, pt = pTorso, pl = pLimb;
      const norm = Math.max(1, ph+pt+pl);
      const wh = ph/norm, wt = pt/norm, wl = pl/norm;
      const ch1=h1*Math.max(0,Math.min(1,h1c/100)), ch2=h2*Math.max(0,Math.min(1,h2c/100));
      const ct1=t1*Math.max(0,Math.min(1,t1c/100)), ct2=t2*Math.max(0,Math.min(1,t2c/100));
      const cl1=l1*Math.max(0,Math.min(1,l1c/100)), cl2=l2*Math.max(0,Math.min(1,l2c/100));
      const drH=ch1+ch2, drT=ct1+ct2, drL=cl1+cl2;
      const outH=Math.max(0, damage - drH), outT=Math.max(0, damage - drT), outL=Math.max(0, damage - drL);
      const E = outH*wh + outT*wt + outL*wl;
      return `Эфф. DR: голова ${drH.toFixed(2)}, торс ${drT.toFixed(2)}, конечности ${drL.toFixed(2)}\nУрон по зонам: H ${outH.toFixed(2)}, T ${outT.toFixed(2)}, L ${outL.toFixed(2)}\nОжидаемый урон: ${E.toFixed(2)}`;
    }
  },
  {
    key: 'positional',
    name: 'Позиционные/условные эффекты',
    desc: 'Эффекты типа бэкстаб/хедшот/фланг: меняют множитель урона и/или игнорируют часть брони с вероятностью.',
    inputs: [
      { key: 'damage', label: 'Базовый урон', type: 'number', value: 30 },
      { key: 'dr', label: 'Броня (DR)', type: 'number', value: 8 },
      { key: 'mode', label: 'Эффект', type: 'select', value: 'backstab', options:[
        {value:'backstab', label:'Бэкстаб (множитель)'},
        {value:'headshot', label:'Хедшот (множитель + игнор %)'},
        {value:'flank', label:'Фланг (игнор DR фикс.)'},
        {value:'weak', label:'Уязвимая точка (игнор % брони)'}
      ]},
      { key: 'mult', label: 'Множитель урона', type: 'number', value: 1.5 },
      { key: 'ignorePct', label: 'Игнор брони, %', type: 'number', value: 50 },
      { key: 'ignoreFlat', label: 'Игнор брони, фикс.', type: 'number', value: 4 },
      { key: 'chance', label: 'Шанс срабатывания, %', type: 'number', value: 30 }
    ],
    compute: ({ damage, dr, mode, mult, ignorePct, ignoreFlat, chance }) => {
      const q = Math.max(0, Math.min(1, chance/100));
      const base = Math.max(0, damage - dr);
      let alt = base;
      if (mode === 'backstab') {
        alt = Math.max(0, damage*mult - dr);
      } else if (mode === 'headshot') {
        const ig = Math.max(0, Math.min(1, ignorePct/100));
        alt = Math.max(0, damage*mult - dr*(1-ig));
      } else if (mode === 'flank') {
        alt = Math.max(0, damage - Math.max(0, dr - ignoreFlat));
      } else { // weak / generic ignore %
        const ig = Math.max(0, Math.min(1, ignorePct/100));
        alt = Math.max(0, damage - dr*(1-ig));
      }
      const eff = (1-q)*base + q*alt;
      return `Базовый урон: ${base.toFixed(2)}\nПри эффекте: ${alt.toFixed(2)}\nE[урон] с шансом ${Math.round(q*100)}%: ${eff.toFixed(2)}`;
    }
  },
  {
    key: 'penalties',
    name: 'Штрафы к скиллам/характеристикам',
    desc: 'Оценка влияния массы/громоздкости брони: скрытность, скорость, шанс фейла заклинаний.',
    inputs: [
      { key: 'bulk', label: 'Громоздкость брони (Bulk)', type: 'number', value: 8 },
      { key: 'baseStealth', label: 'Базовая скрытность, %', type: 'number', value: 70 },
      { key: 'baseSpeed', label: 'Базовая скорость (ед.)', type: 'number', value: 6 },
      { key: 'baseSpellFail', label: 'База фейла заклинаний, %', type: 'number', value: 0 },
      { key: 'stealthPerBulk', label: '−% скрытности за 1 Bulk', type: 'number', value: 3 },
      { key: 'speedPerBulk', label: '−% скорости за 1 Bulk', type: 'number', value: 2 },
      { key: 'spellFailPerBulk', label: '+% фейла за 1 Bulk', type: 'number', value: 5 },
      { key: 'capStealth', label: 'Мин. скрытность, %', type: 'number', value: 5 }
    ],
    compute: ({ bulk, baseStealth, baseSpeed, baseSpellFail, stealthPerBulk, speedPerBulk, spellFailPerBulk, capStealth }) => {
      const stealth = Math.max(capStealth, baseStealth - bulk*stealthPerBulk);
      const speed = Math.max(0, baseSpeed * (1 - (bulk*speedPerBulk)/100));
      const spellFail = Math.max(0, Math.min(100, baseSpellFail + bulk*spellFailPerBulk));
      return `Скрытность: ${stealth.toFixed(1)}%\nСкорость: ${speed.toFixed(2)}\nШанс фейла заклинаний: ${spellFail.toFixed(1)}%`;
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