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
import { SupabaseSyncModal } from './components/SupabaseSyncModal.tsx';

const AppContent: React.FC = () => {
  const { activeWorkout, startWorkout } = useWorkout();
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
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
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans selection:bg-[#f97316]/30">
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
        isOpen={isCoachViewOpen}
        onClose={() => setIsCoachViewOpen(false)}
        onOpenStudentManager={() => setIsStudentManagerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSelectStudentWorkout={() => {
          handleStartRoutine('routine-a');
        }}
      />

      {/* Student Manager (CRUD) Modal */}
      <StudentManagerModal
        isOpen={isStudentManagerOpen}
        onClose={() => setIsStudentManagerOpen(false)}
      />

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      {/* Supabase Integration & Migrations Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <AppContent />
      </WorkoutProvider>
    </AuthProvider>
  );
}
