import React from 'react';
import { Dumbbell, Home, Scale, TrendingUp } from 'lucide-react';

type AppTab = 'inicio' | 'treinos' | 'evolucao' | 'medidas';

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'inicio' as const, label: 'Meu treino', icon: Home },
    { id: 'treinos' as const, label: 'Fichas', icon: Dumbbell },
    { id: 'evolucao' as const, label: 'Progresso', icon: TrendingUp },
    { id: 'medidas' as const, label: 'Medidas', icon: Scale },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0b1326]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl"
    >
      <div className="mx-auto grid h-20 max-w-xl grid-cols-4 items-center px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectTab(tab.id)}
              className={'mx-1 flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-base font-semibold transition-colors ' +
                (isActive ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'text-[#dae2fd] hover:bg-white/5')}
            >
              <Icon aria-hidden="true" className={'h-5 w-5 ' + (isActive ? 'stroke-[2.5]' : 'stroke-2')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
