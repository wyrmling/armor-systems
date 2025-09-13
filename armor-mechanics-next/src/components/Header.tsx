export function Header() {
  return (
    <header className="bg-surface border-b border-border px-6 py-4">
      <h1 className="text-xl font-bold text-text-primary mb-1">
        Прототип механик брони
      </h1>
      <p className="text-sm text-text-secondary">
        Интерактивные вкладки для тестирования различных систем брони/урона. 
        Введите параметры, запустите расчёт или симуляцию и сравните результаты.
      </p>
    </header>
  );
}