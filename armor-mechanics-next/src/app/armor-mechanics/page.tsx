'use client';

import { useState } from 'react';
import { mechanics } from '@/data/mechanics';
import { MechanicCard } from '@/components/MechanicCard';

export default function ArmorMechanics() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-[calc(100vh-80px)]">
        <div className="w-60 bg-surface border-r border-border p-2 overflow-y-auto">
          <div className="space-y-1">

            {/* Заголовок секции */}
            <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Механики Брони
            </div>

            {/* Механики */}
            {mechanics.map((mechanic, index) => (
              <button
                key={mechanic.key}
                onClick={() => setActiveTab(index)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200
                  ${activeTab === index
                    ? 'bg-green-600 text-white'
                    : 'text-text-secondary hover:bg-border/50 hover:text-text-primary'
                  }
                `}
              >
                <div className="text-sm font-medium truncate">
                  {mechanic.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Заголовок страницы */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text-primary mb-3">
                🛡️ Механики Брони
              </h1>
              <p className="text-text-secondary">
                Изучайте различные подходы к защите в играх: от простого вычитания урона до сложных систем с критическими попаданиями.
              </p>
            </div>

            <div className="mx-auto">
              <MechanicCard mechanic={mechanics[activeTab]} />
            </div>
          </div>
        </div>
    </div>
  );
}