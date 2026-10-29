import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { WorkoutRoutines } from './components/WorkoutRoutines.tsx';
import { WeeklyCharts } from './components/WeeklyCharts.tsx';
import { BodyProgress } from './components/BodyProgress.tsx';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal.tsx';
import { RestTimerBar } from './components/RestTimerBar.tsx';
import { CoachViewModal } from './components/CoachViewModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { StudentManagerModal } from './components/StudentManagerModal.tsx';
import { ImcCalculator } from './components/ImcCalculator.tsx';
import { AttendanceCalendar } from './components/AttendanceCalendar.tsx';
import { Anamnese } from './components/Anamnese.tsx';
import { SupabaseSyncModal } from './components/SupabaseSyncModal.tsx';
import { isSupabaseConfigured } from './lib/supabase.ts';

const AppContent: React.FC = () => {
  const { activeWorkout, startWorkout } = useWorkout();
  const { user, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const isCoach = user?.role === 'coach';
  const [currentTab, setCurrentTab] = useState<'inicio' | 'treinos' | 'evolucao' | 'medidas'>('inicio');
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isCoachViewOpen, setIsCoachViewOpen] = useState(false);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleStartRoutine = (routineId: string) => {
    if (activeWorkout?.routineId !== routineId) {
      startWorkout(routineId);
    }
    setIsWorkoutModalOpen(true);
  };

  const handleOpenActiveWorkout = () => {
    if (activeWorkout) {
      setIsWorkoutModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e8ffef] flex flex-col font-sans selection:bg-[#00ff66]/30">
      {/* Top Navbar with Auth & Controls */}
      <Navbar
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        onOpenCoachView={() => setIsCoachViewOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onStartActiveWorkout={handleOpenActiveWorkout}
        onOpenAuthModal={openAuthModal}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
        {currentTab === 'inicio' && (
          <Dashboard
            onStartWorkout={handleStartRoutine}
            onOpenCoachView={() => setIsCoachViewOpen(true)}
            onOpenStudentManager={() => setIsStudentManagerOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'inicio' && !isCoach && <AttendanceCalendar />}
        {currentTab === 'treinos' && !isCoach && <Anamnese />}
        {currentTab === 'medidas' && !isCoach && <ImcCalculator />}

        {currentTab === 'treinos' && (
          <WorkoutRoutines onStartRoutine={handleStartRoutine} />
        )}

        {currentTab === 'evolucao' && (
          <WeeklyCharts />
        )}

        {currentTab === 'medidas' && (
          <BodyProgress />
        )}
      </main>

      {/* Floating Rest Interval Timer Bar */}
      <RestTimerBar />

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Active Workout Session Modal / Drawer */}
      <ActiveWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
      />

      {/* Coach CRM View Modal */}
      <CoachViewModal
        isOpen={isCoach && isCoachViewOpen}
        onClose={() => setIsCoachViewOpen(false)}
        onOpenStudentManager={() => setIsStudentManagerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSelectStudentWorkout={() => {
          handleStartRoutine('routine-a');
        }}
      />

      {/* Student Manager (CRUD) Modal */}
      <StudentManagerModal
        isOpen={isCoach && isStudentManagerOpen}
        onClose={() => setIsStudentManagerOpen(false)}
      />

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      {/* Supabase Integration & Migrations Modal */}
      <SupabaseSyncModal
        isOpen={isCoach && isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

function Shell() {
  const { user } = useAuth();
  // Remonta os dados ao trocar de conta: cada usuário tem o próprio armazenamento.
  return (
    <WorkoutProvider key={user?.uid ?? 'anon'}>
      <AppContent />
    </WorkoutProvider>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 flex items-center justify-center text-[#e8ffef]">
        <section className="max-w-lg rounded-3xl border border-[#ffb4ab]/30 bg-[#0f0f12] p-8 text-center shadow-2xl">
          <h1 className="text-xl font-bold font-display text-white">Configuração incompleta</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
            Para iniciar o PulseFit, configure <code className="text-[#3ECF8E]">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-[#3ECF8E]">VITE_SUPABASE_ANON_KEY</code> no arquivo local de ambiente.
            Depois, reinicie o servidor de desenvolvimento.
          </p>
        </section>
      </main>
    );
  }

  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
