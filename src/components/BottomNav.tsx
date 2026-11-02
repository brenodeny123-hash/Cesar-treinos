import React from 'react';
import { Home, Dumbbell, TrendingUp, Scale, Users } from 'lucide-react';

export type AppTab = 'inicio' | 'alunos' | 'treinos' | 'evolucao' | 'medidas';

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isCoach: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, isCoach }) => {
  const tabs: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = isCoach
    ? [
        { id: 'inicio', label: 'Painel', icon: Home },
        { id: 'alunos', label: 'Alunos', icon: Users },
        { id: 'treinos', label: 'Fichas', icon: Dumbbell },
      ]
    : [
        { id: 'inicio', label: 'Início', icon: Home },
        { id: 'treinos', label: 'Treinar', icon: Dumbbell },
        { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
        { id: 'medidas', label: 'Medidas', icon: Scale },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)]">
      <div className={`max-w-md mx-auto ${isCoach ? 'grid grid-cols-3' : 'grid grid-cols-4'} items-center h-16 px-2`}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                isActive ? 'text-[#00ff66]' : 'text-[#a1a1aa] hover:text-[#e8ffef]'
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
