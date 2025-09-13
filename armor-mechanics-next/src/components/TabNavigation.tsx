'use client';

import { Mechanic } from '@/types/mechanics';

interface TabNavigationProps {
  mechanics: Mechanic[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export function TabNavigation({ mechanics, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="w-60 bg-surface border-r border-border p-2 overflow-y-auto">
      <div className="space-y-1">
        {mechanics.map((mechanic, index) => (
          <button
            key={mechanic.key}
            onClick={() => onTabChange(index)}
            className={`
              w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200
              ${activeTab === index 
                ? 'bg-border text-text-primary' 
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
  );
}