'use client';

import { useState } from 'react';
import { mechanics } from '@/data/mechanics';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { MechanicCard } from '@/components/MechanicCard';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex h-[calc(100vh-80px)]">
        <TabNavigation 
          mechanics={mechanics}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <MechanicCard mechanic={mechanics[activeTab]} />
          </div>
        </div>
      </main>
      
      <footer className="bg-surface border-t border-border px-6 py-4">
        <p className="text-xs text-text-secondary">
          Основано на списке из файла{' '}
          <code className="bg-background px-1 py-0.5 rounded text-text-accent">
            ARMOR_MECHANICS.md
          </code>
          . Этот прототип демонстрирует принципы и не является точной репликой конкретных игр.
        </p>
      </footer>
    </div>
  );
}