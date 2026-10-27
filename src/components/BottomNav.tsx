import React from 'react';
import { Home, Dumbbell, TrendingUp, Scale } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'inicio' | 'treinos' | 'evolucao' | 'medidas';
  onSelectTab: (tab: 'inicio' | 'treinos' | 'evolucao' | 'medidas') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'inicio' as const, label: 'Início', icon: Home },
    { id: 'treinos' as const, label: 'Treinar', icon: Dumbbell },
    { id: 'evolucao' as const, label: 'Evolução', icon: TrendingUp },
    { id: 'medidas' as const, label: 'Medidas', icon: Scale },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                isActive ? 'text-[#f97316]' : 'text-[#94a3b8] hover:text-[#dae2fd]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[11px] font-medium tracking-tight ${isActive ? 'font-bold text-white' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
