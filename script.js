// Прототип механик брони.
// Вкладки генерируются динамически. Каждая вкладка имеет форму ввода и функцию расчёта/симуляции.

const mechanics = [
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
      if (min1 && damage > 0) out = Math.max(1, out);
      return `Урон после DR: ${out}`;
    }
  },
  {
    key: 'percentdr',
    name: 'Процентное снижение (Percent DR)',
    desc: 'Урон умножается на (1 − DR%).',
    inputs: [
      { key: 'damage', label: 'Входящий урон', type: 'number', value: 50 },
      { key: 'drp', label: 'Снижение урона, %', type: 'number', value: 30 },
    ],
    compute: ({ damage, drp }) => {
      const r = Math.max(0, Math.min(1, drp/100));
      const out = Math.round(damage * (1 - r) * 100) / 100;
      return `Урон после процента: ${out}`;
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
      k = Math.max(0.0001, k);
      const mult = k / (k + Math.max(0, armor));
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
      let s = shield, h = hp; const lines = [];
      for (let i=1;i<=n;i++) {
        let taken = dmg;
        const sBefore = s;
        const use = Math.min(s, taken); s -= use; taken -= use;
        h -= taken;
        lines.push(`#${i}: щит ${sBefore}→${s}, HP −${taken} → ${h}`);
        s = Math.min(shield, s + regen);
        if (h <= 0) { lines.push('Цель выведена из строя.'); break; }
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
      let meter = poise; const lines = [];
      for (let i=1;i<=n;i++) {
        const before = meter; meter -= poiseBreak;
        const stagger = meter <= 0;
        lines.push(`#${i}: поиз ${before}→${meter} ${stagger ? '(прерывание!)' : ''}`);
        if (stagger) meter = poise; else meter = Math.min(poise, meter + recover);
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
      trials = Math.max(0, Math.floor(trials));
      const hist = [];
      if (trials > 0) {
        let sum = 0; let min = Infinity; let max = -Infinity; let counts = {};
        for (let t=0;t<trials;t++) {
          let successes = 0;
          for (let i=0;i<pool;i++) if (Math.random() < p) successes++;
          const dealt = Math.max(0, dv - successes);
          sum += dealt; if (dealt < min) min = dealt; if (dealt > max) max = dealt;
          const b = Math.floor(dealt / Math.max(1, bucket));
          counts[b] = (counts[b]||0) + 1;
        }
        const mean = sum / trials;
        out += `\nСимуляция ${trials} прогонов → средний урон: ${mean.toFixed(2)}, мин: ${min}, макс: ${max}`;
        const bs = Object.keys(counts).map(k=>({ bin: parseInt(k), count: counts[k] })).sort((a,b)=>a.bin-b.bin);
        bs.forEach(b=>hist.push({ label: `${b.bin*bucket}-${(b.bin+1)*bucket}`, count: b.count }));
        // отрисовка гистограммы ниже панелью
      }
      // прикрепим canvas для гистограммы к панели соака позже через DOM
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
      let c = charges; let total = 0; const lines = [];
      for (let i=1;i<=hits;i++) {
        let dealt = dmg; let used = 0;
        if (c > 0) {
          if (mode === 'percent') {
            const r = Math.max(0, Math.min(1, absorb/100));
            used = dealt * r; dealt = dealt * (1 - r);
          } else {
            used = Math.min(dealt, absorb); dealt -= used;
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
      const ph = pHead, pt = pTorso, pl = pLimb; const norm = Math.max(1, ph+pt+pl);
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
    inputs: []
  }
];

function createInput(control) {
  const wrap = document.createElement('div');
  wrap.className = 'control';
  const label = document.createElement('label');
  label.textContent = control.label;
  label.htmlFor = control.key;
  let input;
  if (control.type === 'select') {
    input = document.createElement('select');
    control.options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === control.value) opt.selected = true;
      input.appendChild(opt);
    });
  } else if (control.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!control.value;
  } else {
    input = document.createElement('input');
    input.type = 'number';
    input.value = control.value;
  }
  input.id = control.key;
  input.name = control.key;
  input.dataset.key = control.key;
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

function getValues(panel) {
  const inputs = panel.querySelectorAll('.control input, .control select');
  const vals = {};
  inputs.forEach(inp => {
    const key = inp.dataset.key;
    if (inp.type === 'checkbox') vals[key] = inp.checked;
    else if (inp.tagName === 'SELECT') vals[key] = inp.value;
    else vals[key] = parseFloat(inp.value);
  });
  return vals;
}

// Расширенные функции анализа
function calculateEfficiencyMetrics(damageFunction, armorRange = [0, 50], baseDamage = 30) {
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

function findOptimalArmor(damageFunction, armorRange = [0, 50], baseDamage = 30, costFunction = null) {
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

function calculateVariance(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return { mean, variance, stdDev: Math.sqrt(variance) };
}

// Анализ вариативности урона для механик с рандомом
function analyzeVariability(mechanic, params, trials = 1000) {
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

// Вспомогательная отрисовка простых графиков на canvas
function drawLineChart(canvas, xs, ys, {color='#7dc4ff', fill=false, yLabel='', showPoints=false}={}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth; // responsive
  const H = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,W,H);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 40;
  const xTo = x => pad + (W-2*pad) * ( (x-minX)/(maxX-minX || 1) );
  const yTo = y => H-pad - (H-2*pad) * ( (y-minY)/(maxY-minY || 1) );

  // оси
  ctx.strokeStyle = '#2a3243';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();
  
  // Сетка
  ctx.strokeStyle = '#1a1f2e';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 5; i++) {
    const y = pad + (H-2*pad) * i / 5;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();
  }
  
  // линия
  ctx.strokeStyle = color; ctx.lineWidth=2; ctx.beginPath();
  ys.forEach((y,i) => {
    const X = xTo(xs[i]); const Y = yTo(ys[i]);
    if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
  });
  ctx.stroke();

  // Точки
  if (showPoints) {
    ctx.fillStyle = color;
    ys.forEach((y,i) => {
      const X = xTo(xs[i]); const Y = yTo(ys[i]);
      ctx.beginPath();
      ctx.arc(X, Y, 3, 0, 2*Math.PI);
      ctx.fill();
    });
  }

  if (fill) {
    ctx.lineTo(xTo(xs[xs.length-1]), H-pad);
    ctx.lineTo(xTo(xs[0]), H-pad);
    ctx.closePath();
    ctx.fillStyle = color + '33';
    ctx.fill();
  }

  // Подписи осей
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '11px sans-serif';
  if (yLabel) {
    ctx.fillText(yLabel, pad+6, pad+15);
  }
  
  // Значения на осях
  ctx.fillText(minX.toFixed(0), pad, H-pad+15);
  ctx.fillText(maxX.toFixed(0), W-pad, H-pad+15);
  ctx.fillText(maxY.toFixed(1), pad-35, pad+5);
  ctx.fillText(minY.toFixed(1), pad-35, H-pad+5);
}

function drawHistogram(canvas, buckets, {color='#a6e3a1'}={}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,W,H);
  const pad = 30;
  const maxCount = Math.max(...buckets.map(b=>b.count),1);
  const barW = (W-2*pad)/buckets.length;
  ctx.strokeStyle = '#2a3243';
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();
  ctx.fillStyle = color;
  buckets.forEach((b, i) => {
    const h = (H-2*pad) * (b.count/maxCount);
    ctx.fillRect(pad + i*barW + 2, (H-pad) - h, barW - 4, h);
  });
}

function drawMultiLineChart(canvas, series, {yLabel='', xLabel='', showOptimal=false, optimalPoint=null}={}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth || 720;
  const H = canvas.height = canvas.clientHeight || 220;
  ctx.clearRect(0,0,W,H);
  const pad = 40;
  const allXs = series.flatMap(s => s.xs);
  const allYs = series.flatMap(s => s.ys);
  let minX = 0, maxX = 10, minY = 0, maxY = 10;
  if (allXs.length >= 2 && allYs.length >= 2) {
    minX = Math.min(...allXs); maxX = Math.max(...allXs);
    minY = Math.min(...allYs); maxY = Math.max(...allYs);
  }
  const xTo = x => pad + (W-2*pad) * ( (x-minX)/(maxX-minX || 1) );
  const yTo = y => H-pad - (H-2*pad) * ( (y-minY)/(maxY-minY || 1) );

  // оси
  ctx.strokeStyle = '#2a3243';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();

  // Сетка
  ctx.strokeStyle = '#1a1f2e';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 5; i++) {
    const y = pad + (H-2*pad) * i / 5;
    const x = pad + (W-2*pad) * i / 5;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H-pad); ctx.stroke();
  }

  // линии
  series.forEach(s => {
    ctx.strokeStyle = s.color || '#7dc4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.ys.forEach((y,i) => {
      const X = xTo(s.xs[i]); const Y = yTo(y);
      if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
    });
    ctx.stroke();
  });

  // Оптимальная точка
  if (showOptimal && optimalPoint) {
    ctx.strokeStyle = '#f38ba8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const optX = xTo(optimalPoint.x);
    ctx.beginPath();
    ctx.moveTo(optX, pad);
    ctx.lineTo(optX, H-pad);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#f38ba8';
    ctx.beginPath();
    ctx.arc(optX, yTo(optimalPoint.y), 5, 0, 2*Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#f38ba8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Optimal: ${optimalPoint.x}`, optX + 8, yTo(optimalPoint.y) - 8);
  }

  // легенда
  const legendX = W - pad - 140;
  let legendY = pad + 10;
  ctx.font = '11px sans-serif';
  series.forEach(s => {
    ctx.fillStyle = s.color || '#7dc4ff';
    ctx.fillRect(legendX, legendY-8, 12, 4);
    ctx.fillStyle = '#c7cdd6';
    ctx.fillText(s.label || '', legendX + 18, legendY);
    legendY += 14;
  });

  // Подписи осей
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '11px sans-serif';
  if (yLabel) {
    ctx.fillText(yLabel, pad+6, pad+15);
  }
  if (xLabel) {
    ctx.fillText(xLabel, W/2 - 20, H-10);
  }
}

// Создание расширенной аналитической панели
function createAdvancedAnalysis(mechanic, panel) {
  const analysisSection = document.createElement('div');
  analysisSection.className = 'section';
  analysisSection.innerHTML = '<h3>📊 Расширенный анализ</h3>';
  
  const analysisControls = document.createElement('div');
  analysisControls.className = 'controls';
  
  const analysisInputs = [
    { key: 'minArmor', label: 'Мин. броня для анализа', type: 'number', value: 0 },
    { key: 'maxArmor', label: 'Макс. броня для анализа', type: 'number', value: 50 },
    { key: 'testDamage', label: 'Тестовый урон', type: 'number', value: 30 },
    { key: 'armorCost', label: 'Стоимость за ед. брони', type: 'number', value: 1 }
  ];
  
  analysisInputs.forEach(input => analysisControls.appendChild(createInput(input)));
  
  const analysisButton = document.createElement('button');
  analysisButton.className = 'btn';
  analysisButton.textContent = '🔍 Анализировать эффективность';
  
  const variabilityButton = document.createElement('button');
  variabilityButton.className = 'btn';
  variabilityButton.textContent = '📊 Анализ вариативности';
  
  const analysisOutput = document.createElement('div');
  analysisOutput.className = 'output';
  
  const variabilityOutput = document.createElement('div');
  variabilityOutput.className = 'output';
  
  // Canvas для графиков
  const chartsContainer = document.createElement('div');
  chartsContainer.className = 'grid2';
  
  const effectivenessCanvas = document.createElement('canvas');
  effectivenessCanvas.className = 'chart-canvas';
  effectivenessCanvas.style.height = '200px';
  
  const efficiencyCanvas = document.createElement('canvas');
  efficiencyCanvas.className = 'chart-canvas';
  efficiencyCanvas.style.height = '200px';
  
  chartsContainer.appendChild(effectivenessCanvas);
  chartsContainer.appendChild(efficiencyCanvas);
  
  analysisButton.addEventListener('click', () => {
    const vals = getValues(analysisControls);
    const minArmor = Math.max(0, vals.minArmor || 0);
    const maxArmor = Math.max(minArmor + 1, vals.maxArmor || 50);
    const testDamage = Math.max(1, vals.testDamage || 30);
    const armorCost = Math.max(0.1, vals.armorCost || 1);
    
    // Создаем функцию урона для текущей механики
    let damageFunction;
    if (mechanic.key === 'flatdr') {
      damageFunction = (damage, armor) => Math.max(0, damage - armor);
    } else if (mechanic.key === 'percentdr') {
      damageFunction = (damage, armor) => damage * (1 - Math.max(0, Math.min(1, armor/100)));
    } else if (mechanic.key === 'diminish') {
      damageFunction = (damage, armor) => damage * (100/(100 + armor));
    } else if (mechanic.key === 'dt_dr') {
      damageFunction = (damage, armor) => {
        const afterDT = Math.max(0, damage - 5); // фикс DT=5
        return afterDT * (1 - Math.max(0, Math.min(1, armor/100)));
      };
    } else if (mechanic.key === 'ac') {
      damageFunction = (damage, armor) => {
        // AC модель: вероятность попадания * урон
        const attackBonus = 10; // фиксированный бонус атаки
        const ac = 10 + armor / 2; // AC = base + armor/2
        const needed = Math.min(20, Math.max(1, ac - attackBonus));
        const pHit = (21 - needed) / 20;
        return damage * pHit;
      };
    } else if (mechanic.key === 'shield') {
      damageFunction = (damage, armor) => {
        // Щит поглощает урон до исчерпания
        const shieldHp = armor * 2; // Щит = armor * 2 HP
        if (damage <= shieldHp) return 0;
        return damage - shieldHp;
      };
    } else {
      // Общая функция для неподдерживаемых механик
      damageFunction = (damage, armor) => Math.max(0, damage - armor * 0.5);
    }
    
    const analysis = findOptimalArmor(damageFunction, [minArmor, maxArmor], testDamage);
    
    // Создаем данные для графиков
    const xs = analysis.data.map(d => d.armor);
    const effectivenessYs = analysis.data.map(d => d.effectiveness * 100);
    const efficiencyYs = analysis.data.map(d => d.efficiency * 100);
    const survivabilityYs = analysis.data.map(d => Math.min(d.survivability, 100)); // Капаем на 100
    
    // Рисуем графики
    drawMultiLineChart(effectivenessCanvas, [
      { xs, ys: effectivenessYs, color: '#7dc4ff', label: 'Эффективность %' },
      { xs, ys: survivabilityYs, color: '#a6e3a1', label: 'Выживаемость (удары)' }
    ], { 
      yLabel: 'Эффективность / Выживаемость', 
      xLabel: 'Броня',
      showOptimal: true,
      optimalPoint: { x: analysis.optimal, y: effectivenessYs[analysis.optimal] || 0 }
    });
    
    drawLineChart(efficiencyCanvas, xs, efficiencyYs, {
      color: '#f9e2af',
      yLabel: 'Эффективность на ед. брони %',
      showPoints: true
    });
    
    // Расчет дополнительных метрик
    const avgEffectiveness = effectivenessYs.reduce((a,b) => a+b, 0) / effectivenessYs.length;
    const maxSurvivability = Math.max(...survivabilityYs);
    const costAtOptimal = analysis.optimal * armorCost;
    const diminishingCost = analysis.diminishingPoint * armorCost;
    
    analysisOutput.textContent = `🎯 РЕЗУЛЬТАТЫ АНАЛИЗА:

💡 Оптимальная броня: ${analysis.optimal} ед. (эффективность: ${(analysis.maxEfficiency * 100).toFixed(1)}%)
💰 Стоимость оптимального билда: ${costAtOptimal.toFixed(1)} ед.

📉 Точка убывающей отдачи: ${analysis.diminishingPoint} ед. брони
💸 Стоимость до точки убывания: ${diminishingCost.toFixed(1)} ед.

📊 Средняя эффективность в диапазоне: ${avgEffectiveness.toFixed(1)}%
🛡️ Максимальная выживаемость: ${maxSurvivability} ударов

💎 РЕКОМЕНДАЦИИ:
• Для бюджетного билда: ${Math.min(analysis.optimal, analysis.diminishingPoint)} ед. брони
• Для максимальной эффективности: ${analysis.optimal} ед. брони  
• Не рекомендуется превышать: ${analysis.diminishingPoint} ед. брони`;
  });
  
  variabilityButton.addEventListener('click', () => {
    const vals = getValues(analysisControls);
    const mainVals = getValues(panel.querySelector('.controls'));
    
    // Объединяем параметры
    const params = { ...mainVals, ...vals };
    
    const variabilityData = analyzeVariability(mechanic, params, 1000);
    
    variabilityOutput.textContent = `🎲 АНАЛИЗ ВАРИАТИВНОСТИ УРОНА:

📈 Статистики распределения:
• Среднее значение: ${variabilityData.mean.toFixed(2)}
• Медиана: ${variabilityData.median.toFixed(2)}
• Стандартное отклонение: ${variabilityData.stdDev.toFixed(2)}
• Коэффициент вариации: ${(variabilityData.cv * 100).toFixed(1)}%

📊 Квартили:
• Минимум: ${variabilityData.min.toFixed(2)}
• 25% квартиль: ${variabilityData.q25.toFixed(2)}
• 75% квартиль: ${variabilityData.q75.toFixed(2)}
• Максимум: ${variabilityData.max.toFixed(2)}
• Межквартильный размах: ${variabilityData.iqr.toFixed(2)}

🎯 Интерпретация:
• ${variabilityData.cv < 0.1 ? 'Очень низкая' : variabilityData.cv < 0.3 ? 'Низкая' : variabilityData.cv < 0.5 ? 'Умеренная' : 'Высокая'} вариативность
• ${variabilityData.stdDev < 5 ? 'Предсказуемый' : variabilityData.stdDev < 10 ? 'Умеренно предсказуемый' : 'Непредсказуемый'} урон
• Рекомендуется ${variabilityData.cv > 0.3 ? 'учитывать разброс при планировании' : 'полагаться на среднее значение'}`;
  });
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons';
  buttonsContainer.appendChild(analysisButton);
  buttonsContainer.appendChild(variabilityButton);
  
  analysisSection.appendChild(analysisControls);
  analysisSection.appendChild(buttonsContainer);
  analysisSection.appendChild(analysisOutput);
  analysisSection.appendChild(variabilityOutput);
  analysisSection.appendChild(chartsContainer);
  
  return analysisSection;
}

function renderComparePanel(panel) {
  const box = document.createElement('div');
  box.className = 'section';

  const chooser = document.createElement('div');
  chooser.className = 'controls';
  const info = document.createElement('div');
  info.className = 'small';
  info.textContent = 'Выберите механики для сравнения и настройте общие параметры удара. Для каждой механики можно открыть ее панель отдельно для тонкой настройки — здесь же используется небольшой общий набор параметров.';

  // Общие параметры удара
  const common = document.createElement('div');
  common.className = 'controls';
  const commonInputs = [
    { key: 'damage', label: 'Входящий урон', type: 'number', value: 30 },
    { key: 'armor', label: 'Armor/DR', type: 'number', value: 10 },
    { key: 'drp', label: 'DR %', type: 'number', value: 25 },
    { key: 'dt', label: 'DT (порог)', type: 'number', value: 5 },
    { key: 'k', label: 'K (для убывающей)', type: 'number', value: 100 },
    { key: 'ap', label: 'AP (бронебойность)', type: 'number', value: 5 }
  ];
  commonInputs.forEach(c => common.appendChild(createInput(c)));

  // Чекбоксы выбора механик
  const selectable = mechanics.filter(m => !['compare'].includes(m.key));
  selectable.forEach(m => {
    const div = document.createElement('div');
    div.className = 'control';
    const label = document.createElement('label');
    label.textContent = `Сравнить: ${m.name}`;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.key = m.key;
    div.appendChild(label);
    div.appendChild(input);
    chooser.appendChild(div);
  });

  const buttons = document.createElement('div');
  buttons.className = 'buttons';
  const run = document.createElement('button');
  run.className = 'btn';
  run.textContent = 'Сравнить';
  const out = document.createElement('div');
  out.className = 'output';

  // График зависимости выходного урона от брони (для простых моделей)
  const canvas = document.createElement('canvas');
  canvas.className = 'chart-canvas';

  run.addEventListener('click', () => {
    const selected = [...chooser.querySelectorAll('input[type="checkbox"]')]
      .filter(ch => ch.checked)
      .map(ch => ch.dataset.key);
    if (selected.length === 0) {
      out.textContent = 'Выберите хотя бы одну механику.';
      return;
    }
    const vals = getValues(common);
    // Санитизация значений (предотвращаем NaN)
    const d  = Number.isFinite(+vals.damage) ? +vals.damage : 30;
    const a  = Number.isFinite(+vals.armor)  ? +vals.armor  : 10;
    const pr = Number.isFinite(+vals.drp)    ? +vals.drp    : 25;
    const dt = Number.isFinite(+vals.dt)     ? +vals.dt     : 5;
    const k  = Number.isFinite(+vals.k)      ? +vals.k      : 100;
    const ap = Number.isFinite(+vals.ap)     ? +vals.ap     : 5;

    const results = [];
    selected.forEach(key => {
      // Подставляем общие параметры в простые модели
      let txt = '';
      try {
        if (key === 'flatdr') txt = mechanics.find(m=>m.key==='flatdr').compute({ damage: d, dr: a, min1:false });
        else if (key === 'percentdr') txt = mechanics.find(m=>m.key==='percentdr').compute({ damage: d, drp: pr });
        else if (key === 'dt_dr') txt = mechanics.find(m=>m.key==='dt_dr').compute({ damage: d, dt: dt, drp: pr, min1:false });
        else if (key === 'diminish') txt = mechanics.find(m=>m.key==='diminish').compute({ damage: d, armor: a, k: k });
        else if (key === 'ap') txt = mechanics.find(m=>m.key==='ap').compute({ damage: d, armor: a, ap: ap, mode:'flat' });
        else if (key === 'shield') txt = mechanics.find(m=>m.key==='shield').compute({ shield: a, hp: 100, n: 1, dmg: d, regen: 0 });
        else if (key === 'ablative') txt = mechanics.find(m=>m.key==='ablative').compute({ shots: 1, damage: d, armor: a, degrade: 1, minArmor: 0 });
        else if (key === 'block') txt = mechanics.find(m=>m.key==='block').compute({ damage: d, blockFlat: a/2, blockPct: pr/2, toStamina: 0, stamina: 0 });
        else if (key === 'ac') txt = mechanics.find(m=>m.key==='ac').compute({ attackBonus: 10, ac: 10+a/2, baseDamage: d, d20:true });
        else if (key === 'soak') txt = mechanics.find(m=>m.key==='soak').compute({ dv: d, body: 2, armor: Math.round(a/3), poolMod: 0, pSuccess: 33.3, trials: 0 });
        else if (key === 'reactive') txt = mechanics.find(m=>m.key==='reactive').compute({ hits: 1, dmg: d, charges: 1, absorb: a, mode: 'flat' });
        else if (key === 'resists') txt = mechanics.find(m=>m.key==='resists').compute({ phys: d, slash: a, pierce: a*0.8, blunt: a*1.2, pSlash: 40, pPierce: 40, pBlunt: 20 });
        else if (key === 'hitloc') txt = mechanics.find(m=>m.key==='hitloc').compute({ damage: d, head: a*0.5, torso: a, limb: a*0.8, pHead: 10, pTorso: 60, pLimb: 30 });
        else if (key === 'layering') txt = mechanics.find(m=>m.key==='layering').compute({ damage: d, pHead: 10, pTorso: 60, pLimb: 30, h1: a*0.3, h1c: 100, h2: a*0.2, h2c: 80, t1: a*0.5, t1c: 100, t2: a*0.2, t2c: 80, l1: a*0.2, l1c: 70, l2: a*0.1, l2c: 60 });
        else if (key === 'positional') txt = mechanics.find(m=>m.key==='positional').compute({ damage: d, dr: a, mode:'headshot', mult: 1.5, ignorePct: pr, ignoreFlat: ap, chance: 30 });
        else if (key === 'cover') txt = mechanics.find(m=>m.key==='cover').compute({ mode:'dr', attackBonus: 10, defBase: 10, coverVal: a, damage: d });
        else txt = '(нет адаптера для этой механики)';
      } catch (e) {
        txt = 'Ошибка: ' + e.message;
      }
      results.push({ key, txt });
    });

    out.textContent = results.map(r => `— ${r.key}\n${r.txt}`).join('\n\n');

    // Построим кривую для flatdr как примера (если выбрана), sweep armor 0..(2*vals.armor)
    // Построим кривые сразу для всех выбранных из набора поддерживаемых моделей
    const series = [];
    const maxArm = Math.max(1, Math.round(vals.armor*2));
    const colors = ['#7dc4ff', '#a6e3a1', '#f38ba8', '#f9e2af'];
    const supported = ['flatdr','percentdr','diminish','dt_dr'];
    let colorIdx = 0;
    supported.forEach(key => {
      if (!selected.includes(key)) return;
      const xs = [], ys = [];
      for (let A=0; A<=maxArm; A++) {
        let y = null;
        if (key === 'flatdr') y = Math.max(0, vals.damage - A);
        else if (key === 'percentdr') y = vals.damage * (1 - Math.max(0, Math.min(1, vals.drp/100)));
        else if (key === 'diminish') { const k = Math.max(0.0001, vals.k); y = vals.damage * (k/(k + A)); }
        else if (key === 'dt_dr') { const afterDT = Math.max(0, vals.damage - vals.dt); const r = Math.max(0, Math.min(1, vals.drp/100)); y = afterDT * (1 - r); }
        if (y !== null) { xs.push(A); ys.push(y); }
      }
      series.push({ label: key, xs, ys, color: colors[colorIdx++ % colors.length] });
    });
    if (series.length === 0) {
      // Fallback: хотя бы базовая кривая flatDR, чтобы график не оставался пустым
      const xs = [], ys = [];
      for (let A=0; A<=maxArm; A++) { xs.push(A); ys.push(Math.max(0, vals.damage - A)); }
      series.push({ label: 'baseline(flatDR)', xs, ys, color: '#7dc4ff' });
    }
    drawMultiLineChart(canvas, series, { yLabel: 'Урон от брони' });
  });

  box.appendChild(info);
  box.appendChild(common);
  box.appendChild(document.createElement('hr')).className = 'sep';
  box.appendChild(chooser);
  box.appendChild(buttons);
  buttons.appendChild(run);
  box.appendChild(out);
  box.appendChild(canvas);
  panel.appendChild(box);
}

function render() {
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('content');
  mechanics.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i===0 ? ' active' : '');
    btn.textContent = m.name;
    btn.addEventListener('click', () => activate(i));
    tabs.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'panel' + (i===0 ? ' active' : '');

    const desc = document.createElement('div');
    desc.className = 'section';
    desc.innerHTML = `<h3>${m.name}</h3><div class=\"small\">${m.desc}</div>`;
    panel.appendChild(desc);

    if (m.key === 'compare') {
      renderComparePanel(panel);
    } else {
      const form = document.createElement('div');
      form.className = 'section';
      const controls = document.createElement('div');
      controls.className = 'controls';
      m.inputs.forEach(c => controls.appendChild(createInput(c)));
      form.appendChild(controls);

      const buttons = document.createElement('div');
      buttons.className = 'buttons';
      const calc = document.createElement('button');
      calc.className = 'btn';
      calc.textContent = 'Рассчитать / Симулировать';
      const out = document.createElement('div');
      out.className = 'output';
      
      // Добавим canvas для гистограммы, если это soak
      let histCanvas = null;
      if (m.key === 'soak') {
        histCanvas = document.createElement('canvas');
        histCanvas.className = 'chart-canvas';
        form.appendChild(histCanvas);
      }
      
      calc.addEventListener('click', () => {
        const vals = getValues(form);
        try {
          const res = m.compute(vals);
          if (typeof res === 'string') {
            out.textContent = res;
          } else {
            out.textContent = res.text || '';
            if (histCanvas && res.hist && res.hist.length > 0) {
              const buckets = res.hist.map((h, i) => ({ label: h.label || String(i), count: h.count }));
              drawHistogram(histCanvas, buckets);
            }
          }
        } catch (e) {
          out.textContent = 'Ошибка: ' + e.message;
        }
      });
      buttons.appendChild(calc);
      form.appendChild(buttons);
      form.appendChild(out);

      panel.appendChild(form);
      
      // Добавляем расширенную аналитику для поддерживаемых механик
      const supportedForAnalysis = ['flatdr', 'percentdr', 'diminish', 'dt_dr', 'ac', 'shield'];
      if (supportedForAnalysis.includes(m.key)) {
        const analysisPanel = createAdvancedAnalysis(m, panel);
        panel.appendChild(analysisPanel);
      }
    }

    content.appendChild(panel);
  });

  function activate(idx) {
    [...tabs.children].forEach((b, i) => b.classList.toggle('active', i===idx));
    [...content.children].forEach((p, i) => p.classList.toggle('active', i===idx));
  }
}

window.addEventListener('DOMContentLoaded', render);
