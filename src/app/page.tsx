import Link from 'next/link';

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full text-center">
        {/* Заголовок и описание */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Системы Брони в Играх
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Анализ и сравнение различных механик защиты в настольных и компьютерных играх.
            Изучайте принципы, сравнивайте системы и тестируйте механики.
          </p>
        </div>

        {/* Навигационные карточки */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Механики брони */}
          <Link href="/armor-mechanics" className="block group">
            <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:border-green-500 hover:shadow-lg group-hover:scale-105">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Механики Брони
              </h3>
              <p className="text-text-secondary">
                Изучите различные подходы к защите: от простого вычитания урона до сложных систем с критическими попаданиями
              </p>
            </div>
          </Link>

          {/* Таблица игр */}
          <Link href="/games" className="block group">
            <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:border-blue-500 hover:shadow-lg group-hover:scale-105">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Таблица Игр
              </h3>
              <p className="text-text-secondary">
                Сравните системы защиты в популярных играх: D&D, Pathfinder, GURPS, Warhammer и многих других
              </p>
            </div>
          </Link>

          {/* Симулятор GURPS */}
          <Link href="/gurps" className="block group">
            <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:border-red-500 hover:shadow-lg group-hover:scale-105">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Симулятор GURPS
              </h3>
              <p className="text-text-secondary">
                Интерактивный симулятор боевой системы GURPS с расчетом повреждений и пробития брони
              </p>
            </div>
          </Link>

          {/* Анализ оружия GURPS */}
          <Link href="/gurps/weapons" className="block group">
            <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:border-orange-500 hover:shadow-lg group-hover:scale-105">
              <div className="text-4xl mb-4">🗡️</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Анализ Оружия GURPS
              </h3>
              <p className="text-text-secondary">
                Подробный анализ распределения урона для оружия GURPS, включая статистику и сравнение
              </p>
            </div>
          </Link>

          {/* Анализ костей */}
          <Link href="/dice-analysis" className="block group">
            <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:border-purple-500 hover:shadow-lg group-hover:scale-105">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Анализ Костей
              </h3>
              <p className="text-text-secondary">
                Сравнение распределений вероятностей для разных систем генерации случайных чисел
              </p>
            </div>
          </Link>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-12 text-center">
          <p className="text-sm text-text-secondary">
            Основано на анализе из файла{' '}
            <code className="bg-surface px-2 py-1 rounded text-text-accent border">
              ARMOR_MECHANICS.md
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}