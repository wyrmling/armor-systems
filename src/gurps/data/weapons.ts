// Предустановленные образцы оружия для GURPS 4ed

export interface RangedWeapon {
  name: string;
  damage: string; // Формула урона GURPS (например, "5d", "3d+2")
  damageType: string;
  accuracy: number;
  halfDamageRange: number;
  maxRange: number;
  category: string;
  description: string;
}

export interface MeleeWeapon {
  name: string;
  damage: string; // Формула урона GURPS (например, "sw+2", "thr-1")
  damageType: string;
  reach: number;
  category: string;
  description: string;
}

// Дальнобойное оружие из GURPS Basic Set
export const rangedWeapons: RangedWeapon[] = [
  // Луки
  {
    name: 'Короткий лук',
    damage: 'thr+1',
    damageType: 'Колющий (pi)',
    accuracy: 1,
    halfDamageRange: 100,
    maxRange: 150,
    category: 'Луки',
    description: 'Простой охотничий лук'
  },
  {
    name: 'Длинный лук',
    damage: 'thr+2',
    damageType: 'Колющий (pi)',
    accuracy: 2,
    halfDamageRange: 150,
    maxRange: 200,
    category: 'Луки',
    description: 'Боевой длинный лук'
  },
  {
    name: 'Композитный лук',
    damage: 'thr+3',
    damageType: 'Колющий (pi)',
    accuracy: 3,
    halfDamageRange: 180,
    maxRange: 220,
    category: 'Луки',
    description: 'Усиленный композитный лук'
  },

  // Арбалеты
  {
    name: 'Лёгкий арбалет',
    damage: '4d',
    damageType: 'Колющий (pi)',
    accuracy: 4,
    halfDamageRange: 200,
    maxRange: 275,
    category: 'Арбалеты',
    description: 'Простой арбалет'
  },
  {
    name: 'Тяжёлый арбалет',
    damage: '4d+2',
    damageType: 'Колющий (pi)',
    accuracy: 4,
    halfDamageRange: 300,
    maxRange: 400,
    category: 'Арбалеты',
    description: 'Боевой арбалет'
  },

  // Винтовки (из таблицы GURPS)
  {
    name: 'Штурмовая винтовка 5.56мм',
    damage: '5d',
    damageType: 'Колющий (pi)',
    accuracy: 5,
    halfDamageRange: 500,
    maxRange: 3500,
    category: 'Винтовки',
    description: 'TL7 Assault Rifle, 5.56mm'
  },
  {
    name: 'Боевая винтовка 7.62мм',
    damage: '7d',
    damageType: 'Колющий (pi)',
    accuracy: 5,
    halfDamageRange: 1000,
    maxRange: 4200,
    category: 'Винтовки',
    description: 'TL7 Battle Rifle, 7.62mm'
  },
  {
    name: 'Снайперская винтовка .338',
    damage: '9d+1',
    damageType: 'Колющий (pi)',
    accuracy: 9, // 6+3 с оптикой
    halfDamageRange: 1500,
    maxRange: 5500,
    category: 'Винтовки',
    description: 'TL8 Sniper Rifle, .338'
  },
  {
    name: 'Винтовка-мушкет .577',
    damage: '4d',
    damageType: 'Большой колющий (pi+)',
    accuracy: 4,
    halfDamageRange: 700,
    maxRange: 2100,
    category: 'Винтовки',
    description: 'TL5 Rifle-Musket, .577'
  },
  {
    name: 'Болт-экшен 7.62мм',
    damage: '7d',
    damageType: 'Колющий (pi)',
    accuracy: 5,
    halfDamageRange: 1000,
    maxRange: 4200,
    category: 'Винтовки',
    description: 'TL6 Bolt-Action Rifle, 7.62mm'
  },

  // Дробовики (из таблицы GURPS)
  {
    name: 'Помповый дробовик 12G',
    damage: '1d+1 (×9)', // 1d+1 pi за дробинку, всего 9 дробинок
    damageType: 'Колющий (pi)',
    accuracy: 3,
    halfDamageRange: 50,
    maxRange: 125,
    category: 'Дробовики',
    description: 'TL6 Pump Shotgun, 12G (9 pellets)'
  },
  {
    name: 'Двустволка 10G',
    damage: '1d+2 (×9)', // 1d+2 pi за дробинку, всего 9 дробинок
    damageType: 'Колющий (pi)',
    accuracy: 3,
    halfDamageRange: 50,
    maxRange: 125,
    category: 'Дробовики',
    description: 'TL5 Double Shotgun, 10G (9 pellets)'
  },

  // Пистолеты (добавим несколько из таблиц)
  {
    name: 'Револьвер .357',
    damage: '3d-1',
    damageType: 'Колющий (pi)',
    accuracy: 2,
    halfDamageRange: 185,
    maxRange: 2000,
    category: 'Пистолеты',
    description: 'TL7 Revolver, .357'
  },
  {
    name: 'Пистолет 9мм',
    damage: '2d+2',
    damageType: 'Колющий (pi)',
    accuracy: 2,
    halfDamageRange: 150,
    maxRange: 1600,
    category: 'Пистолеты',
    description: 'TL7 Pistol, 9mm'
  },

  // Метательное оружие
  {
    name: 'Метательный нож',
    damage: 'thr',
    damageType: 'Колющий (pi)',
    accuracy: 0,
    halfDamageRange: 8,
    maxRange: 15,
    category: 'Метательное',
    description: 'Балансированный метательный нож'
  },
  {
    name: 'Дротик',
    damage: 'thr+1',
    damageType: 'Малый колющий (pi-)',
    accuracy: 1,
    halfDamageRange: 15,
    maxRange: 25,
    category: 'Метательное',
    description: 'Лёгкий метательный дротик'
  },
  {
    name: 'Копьё (метание)',
    damage: 'thr+2',
    damageType: 'Колющий (pi)',
    accuracy: 2,
    halfDamageRange: 20,
    maxRange: 30,
    category: 'Метательное',
    description: 'Метательное копьё'
  }
];

// Оружие ближнего боя из GURPS Basic Set
export const meleeWeapons: MeleeWeapon[] = [
  // Мечи (из таблицы GURPS)
  {
    name: 'Короткий меч',
    damage: 'sw-1', // sw-1 cut или thr+1 imp (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 1,
    category: 'Мечи',
    description: 'TL2 Shortsword, легкий одноручный меч'
  },
  {
    name: 'Длинный меч',
    damage: 'sw+1', // sw+1 cut или thr+2 imp (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 1,
    category: 'Мечи',
    description: 'TL3 Broadsword, классический боевой меч'
  },
  {
    name: 'Двуручный меч',
    damage: 'sw+2', // sw+2 cut или thr+3 imp (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 2,
    category: 'Мечи',
    description: 'TL3 Two-Handed Sword, тяжелый двуручный меч'
  },
  {
    name: 'Рапира',
    damage: 'thr+1', // thr+1 imp (примерно для ST 12)
    damageType: 'Колющий (imp)',
    reach: 1,
    category: 'Мечи',
    description: 'TL4 Rapier, легкий колющий меч'
  },
  {
    name: 'Сабля',
    damage: 'sw', // sw cut или thr+1 imp (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 1,
    category: 'Мечи',
    description: 'TL4 Saber, изогнутый клинок'
  },

  // Топоры (из таблицы GURPS)
  {
    name: 'Ручной топор',
    damage: 'sw+2', // sw+2 cut (примерно для ST 11)
    damageType: 'Рубящий (cut)',
    reach: 1,
    category: 'Топоры',
    description: 'TL0 Hatchet, небольшой топор'
  },
  {
    name: 'Боевой топор',
    damage: 'sw+3', // sw+3 cut (примерно для ST 11)
    damageType: 'Рубящий (cut)',
    reach: 1,
    category: 'Топоры',
    description: 'TL1 Axe, боевой топор'
  },
  {
    name: 'Секира',
    damage: 'sw+4', // sw+4 cut (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 2,
    category: 'Топоры',
    description: 'TL2 Great Axe, двуручная секира'
  },

  // Дубины (из таблицы GURPS)
  {
    name: 'Дубинка',
    damage: 'sw', // sw cr (примерно для ST 10)
    damageType: 'Дробящий (cr)',
    reach: 1,
    category: 'Дубины',
    description: 'TL0 Club, простая дубина'
  },
  {
    name: 'Булава',
    damage: 'sw+2', // sw+2 cr (примерно для ST 11)
    damageType: 'Дробящий (cr)',
    reach: 1,
    category: 'Дубины',
    description: 'TL2 Mace, боевая булава'
  },
  {
    name: 'Боевой молот',
    damage: 'sw+3', // sw+3 cr (примерно для ST 12)
    damageType: 'Дробящий (cr)',
    reach: 2,
    category: 'Дубины',
    description: 'TL3 Maul, двуручный молот'
  },

  // Копья (из таблицы GURPS)
  {
    name: 'Копьё',
    damage: 'thr+2', // thr+2 imp (примерно для ST 11)
    damageType: 'Колющий (imp)',
    reach: 1, // может быть 1 или 2
    category: 'Копья',
    description: 'TL0 Spear, обычное копьё'
  },
  {
    name: 'Длинное копьё',
    damage: 'thr+3', // thr+3 imp (примерно для ST 11)
    damageType: 'Колющий (imp)',
    reach: 2, // только 2-3
    category: 'Копья',
    description: 'TL2 Long Spear, длинное копьё'
  },

  // Кинжалы (из таблицы GURPS)
  {
    name: 'Кинжал',
    damage: 'thr-1', // thr-1 imp или sw-3 cut (примерно для ST 10)
    damageType: 'Колющий (imp)',
    reach: 1, // Close, 1
    category: 'Кинжалы',
    description: 'TL1 Knife, обычный кинжал'
  },
  {
    name: 'Большой нож',
    damage: 'thr', // sw-2 cut или thr imp (примерно для ST 10)
    damageType: 'Рубящий (cut)',
    reach: 1,
    category: 'Кинжалы',
    description: 'TL3 Large Knife, боевой нож'
  },

  // Древковое оружие (из таблицы GURPS)
  {
    name: 'Алебарда',
    damage: 'sw+3', // sw+3 cut или thr+3 imp (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 2, // 2,3*
    category: 'Древковое',
    description: 'TL3 Halberd, алебарда с топором и копьём'
  },
  {
    name: 'Глефа',
    damage: 'sw+2', // sw+2 cut (примерно для ST 12)
    damageType: 'Рубящий (cut)',
    reach: 2, // 2,3*
    category: 'Древковое',
    description: 'TL3 Glaive, древковое оружие с лезвием'
  },
  {
    name: 'Пика',
    damage: 'thr+3', // thr+3 imp (примерно для ST 11)
    damageType: 'Колющий (imp)',
    reach: 3, // 4,5*
    category: 'Древковое',
    description: 'TL2 Pike, длинная пика'
  },

  // Безоружный бой (из таблицы GURPS)
  {
    name: 'Удар кулаком',
    damage: 'thr-1', // thr-1 cr (примерно для ST 10)
    damageType: 'Дробящий (cr)',
    reach: 1, // Close, 1
    category: 'Безоружный',
    description: 'Punch, обычный удар кулаком'
  },
  {
    name: 'Удар ногой',
    damage: 'thr', // thr cr (примерно для ST 10)
    damageType: 'Дробящий (cr)',
    reach: 1,
    category: 'Безоружный',
    description: 'Kick, удар ногой'
  }
];

// Группировка оружия по категориям
export const rangedWeaponCategories = Array.from(new Set(rangedWeapons.map(w => w.category)));
export const meleeWeaponCategories = Array.from(new Set(meleeWeapons.map(w => w.category)));