'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Главная', icon: '🏠' },
    { href: '/armor-mechanics', label: 'Механики Брони', icon: '🛡️' },
    { href: '/games', label: 'Таблица Игр', icon: '📊' },
    { href: '/gurps', label: 'Симулятор GURPS', icon: '⚔️' },
  ];

  return (
    <header className="bg-surface border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3">
          <div className="text-2xl">🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Системы Брони
            </h1>
            <p className="text-xs text-text-secondary">
              Анализ механик защиты в играх
            </p>
          </div>
        </Link>

        {/* Навигация */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                ${pathname === item.href
                  ? 'bg-green-600 text-white'
                  : 'text-text-secondary hover:bg-border/50 hover:text-text-primary'
                }
              `}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}