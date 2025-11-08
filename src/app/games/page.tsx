'use client';

import { mechanics } from '@/data/mechanics';

// Описания механик для тултипов
const mechanicDescriptions: Record<string, string> = {
  'ac': 'Класс доспеха - увеличивает шанс промаха атакующего',
  'flatdr': 'Плоское поглощение урона - фиксированное значение вычитается из урона',
  'percentdr': 'Процентное поглощение - урон уменьшается на фиксированный процент',
  'tempHP': 'Временные очки здоровья - дополнительный буфер HP',
  'resistance': 'Сопротивление - уменьшение урона от определенных типов атак',
  'elementaldr': 'Элементальная защита - защита от разных типов урона',
  'ward': 'Щит/Барьер - поглощает урон до истощения',
  'hitloc': 'Локационные повреждения - разные части тела имеют разную броню',
  'ap': 'Пробитие брони - игнорирует часть защиты цели',
  'diminish': 'Убывающая эффективность - каждая дополнительная единица брони менее эффективна',
  'magicdr': 'Магическая защита - специальная защита от заклинаний',
  'invulnerability': 'Неуязвимость - полная защита от определенных атак',
  'layers': 'Слои брони - несколько слоев защиты работают вместе'
};

// Список известных игр с их механиками брони
const games = [
  {
    name: 'D&D 5e',
    mechanics: ['ac', 'tempHP', 'resistance']
  },
  {
    name: 'Pathfinder',
    mechanics: ['ac', 'flatdr', 'tempHP', 'diminish']
  },
  {
    name: 'GURPS',
    mechanics: ['flatdr', 'percentdr', 'hitloc']
  },
  {
    name: 'World of Warcraft',
    mechanics: ['percentdr', 'tempHP', 'ward', 'diminish']
  },
  {
    name: 'Dark Souls',
    mechanics: ['percentdr', 'flatdr', 'elementaldr']
  },
  {
    name: 'The Elder Scrolls',
    mechanics: ['percentdr', 'elementaldr']
  },
  {
    name: 'Fallout',
    mechanics: ['flatdr', 'percentdr', 'elementaldr']
  },
  {
    name: 'Diablo',
    mechanics: ['percentdr', 'elementaldr', 'tempHP']
  },
  {
    name: 'Final Fantasy',
    mechanics: ['percentdr', 'elementaldr', 'magicdr']
  },
  {
    name: 'Mass Effect (игра)',
    mechanics: ['tempHP', 'percentdr', 'ward']
  },
  {
    name: 'Mass Effect RPG (книжная)',
    mechanics: ['flatdr', 'percentdr', 'tempHP', 'elementaldr']
  },
  {
    name: 'Warhammer 40k',
    mechanics: ['flatdr', 'percentdr', 'invulnerability']
  },
  {
    name: 'Cyberpunk 2077',
    mechanics: ['percentdr', 'flatdr']
  },
  {
    name: 'Бригада E5 / 7,62',
    mechanics: ['flatdr', 'hitloc', 'percentdr', 'ap', 'elementaldr', 'layers']
  },
  {
    name: 'Kenshi',
    mechanics: ['flatdr', 'hitloc', 'elementaldr', 'ap']
  },
  {
    name: 'RimWorld',
    mechanics: ['flatdr', 'hitloc', 'elementaldr', 'ap', 'percentdr']
  },
  {
    name: 'Dwarf Fortress',
    mechanics: ['flatdr', 'hitloc', 'elementaldr', 'ap', 'layers']
  },
  {
    name: 'Darklands',
    mechanics: ['flatdr', 'hitloc', 'ap']
  },
  {
    name: 'Stoneshard',
    mechanics: ['flatdr', 'percentdr', 'hitloc', 'ap', 'elementaldr']
  }
];

export default function GamesTable() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Механики брони в играх
        </h1>
        <p className="text-text-secondary">
          Таблица показывает какие механики брони используются в различных играх.
          ✓ означает, что механика присутствует в игре.
        </p>
        <p className="text-text-secondary text-sm mt-2">
          <strong>Примечание:</strong> Некоторые франшизы представлены в разных форматах
          (например, Mass Effect как видеоигра и как настольная RPG),
          что показывает различия в подходах к механикам брони.
        </p>
      </div>

      <div className="overflow-x-auto bg-surface rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-text-primary sticky left-0 bg-background border-r border-border">
                Игра
              </th>
              {mechanics.map((mechanic) => (
                <th key={mechanic.key} className="text-center p-2 font-medium text-text-primary min-w-[120px]">
                  <div className="text-xs text-text-secondary mb-1">
                    {mechanic.key.toUpperCase()}
                  </div>
                  <div className="text-sm">
                    {mechanic.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {games.map((game, gameIndex) => (
              <tr key={game.name} className={gameIndex % 2 === 0 ? 'bg-background' : 'bg-surface'}>
                <td className="p-4 font-medium text-text-primary sticky left-0 bg-inherit border-r border-border">
                  {game.name}
                </td>
                {mechanics.map((mechanic) => (
                  <td key={mechanic.key} className="text-center p-2">
                    {game.mechanics.includes(mechanic.key) ? (
                      <span
                        className="text-green-500 text-lg font-bold cursor-help"
                        title={mechanicDescriptions[mechanic.key] || mechanic.desc}
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="text-text-muted text-lg">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-text-secondary">
        <p>
          <strong>Примечание:</strong> Данная таблица показывает основные механики брони,
          присутствующие в играх. Некоторые игры могут иметь дополнительные или более сложные
          вариации этих механик.
        </p>
      </div>
    </div>
  );
}