import React from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { daysBetween, todayFortaleza, formatFortalezaDate, parseFortalezaDate } from '../lib/time.ts';
import {
  X,
  Users,
  CheckCircle,
  FileText,
  DollarSign,
  Play,
  Eye,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Dumbbell,
  Send,
} from 'lucide-react';

interface CoachViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudentWorkout: () => void;
  onOpenStudentManager: () => void;
  onOpenSupabaseModal?: () => void;
}

export const CoachViewModal: React.FC<CoachViewModalProps> = ({
  isOpen,
  onClose,
  onSelectStudentWorkout,
  onOpenStudentManager,
  onOpenSupabaseModal,
}) => {
  const { students } = useWorkout();

  if (!isOpen) return null;

  // Alerta crítico: só quando a ficha realmente está perto de vencer (até 3 dias) ou já venceu.
  const ALERT_DAYS = 3;
  const today = todayFortaleza();
  const expiring = students
    .filter(st => st.routineExpiresOn && /^\d{4}-\d{2}-\d{2}$/.test(st.routineExpiresOn))
    .map(st => ({ student: st, daysLeft: daysBetween(today, st.routineExpiresOn as string) }))
    .filter(x => x.daysLeft <= ALERT_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const totalMonthlyFee = students.reduce((acc, s) => acc + (s.monthlyFee || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <header className="h-16 px-4 bg-[#0f0f12] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-pulse" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#39ff14] block">
              Painel do Treinador • Cesar Treinos
            </span>
            <h2 className="text-sm font-bold font-display text-white">CRM & Prescrição</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenStudentManager}
            className="h-9 px-3 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] text-xs font-bold text-[#04130a] flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Gerenciar Alunos</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-xl bg-[#121214] hover:bg-[#1c1c21] text-xs font-semibold text-[#e8ffef] flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Aluno</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-16 max-w-2xl mx-auto w-full">
        {/* Coach Greeting */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span>Modo Treinador Pro</span>
            <span className="capitalize">{formatFortalezaDate(parseFortalezaDate(today), { weekday: 'long', day: '2-digit', month: 'long' })}</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">
            Olá, Cesar! 💪
          </h1>
          <p className="text-xs text-[#a1a1aa]">
            Você tem <span className="text-[#00ff66] font-semibold">{students.length} alunos sob sua supervisão</span>. Foco no gás total!
          </p>
        </div>

        {/* 2x2 Metric Performance Bento */}
        <div className="grid grid-cols-2 gap-3">
          {/* Bento 1: Active Clients (Clickable to open Student Manager CRUD) */}
          <div
            onClick={onOpenStudentManager}
            className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 space-y-3 cursor-pointer hover:border-[#00ff66]/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#121214] text-[#00ff66] group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-semibold text-[#39ff14] bg-[#39ff14]/15 px-2 py-0.5 rounded-full">
                CRUD Ativo
              </span>
            </div>
            <div>
              <span className="text-2xl font-bold font-display text-white block tabular-nums">
                {students.length}
              </span>
              <span className="text-xs text-[#a1a1aa]">Alunos Cadastrados (Clique para ver)</span>
            </div>
          </div>

          {/* Bento 3: Sheets Renewal */}
          <div className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#121214] text-[#ffb4ab]">
                <FileText className="w-4 h-4" />
              </span>
              {expiring.length > 0 && (
                <span className="text-[10px] font-semibold text-[#ffb4ab] bg-[#ffb4ab]/15 px-2 py-0.5 rounded-full">
                  Urgente
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-bold font-display text-white block tabular-nums">{expiring.length}</span>
              <span className="text-xs text-[#a1a1aa]">Fichas a Renovar</span>
            </div>
          </div>

          {/* Bento 4: Revenue */}
          <div className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#121214] text-[#5be7ff]">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="text-xl font-bold font-display text-white block">
                R$ {totalMonthlyFee.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-[#a1a1aa]">Mensalidades Ativas</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-2">
            Ações Rápidas do Treinador
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={onOpenStudentManager}
              className="px-4 py-2.5 rounded-xl bg-[#00ff66] text-[#09090b] font-bold text-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <UserPlus className="w-4 h-4" /> + Novo Aluno
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0f0f12] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5 hover:bg-[#121214]"
            >
              <Dumbbell className="w-4 h-4 text-[#00ff66]" /> Ver Fichas de Treino
            </button>
            <button
              type="button"
              onClick={onOpenStudentManager}
              className="px-4 py-2.5 rounded-xl bg-[#0f0f12] text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-white/5 hover:bg-[#121214]"
            >
              <Users className="w-4 h-4 text-[#5be7ff]" /> Lista Completa de Alunos
            </button>
            {onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="px-4 py-2.5 rounded-xl bg-[#0f0f12] text-[#3ECF8E] font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap border border-[#3ECF8E]/30 hover:bg-[#3ECF8E]/10"
              >
                <span>⚡ Supabase & Migrations</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Students Schedule from actual students state */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-white">Alunos Atuais na Academia</h3>
            <button
              type="button"
              onClick={onOpenStudentManager}
              className="text-xs text-[#00ff66] hover:underline font-semibold"
            >
              Ver Todos ({students.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {students.slice(0, 4).map((student, idx) => (
              <div
                key={student.id}
                className="bg-[#0f0f12] rounded-2xl p-4 border border-white/5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#121214] text-[#e8ffef] font-bold text-xs">
                      {idx === 0 ? '08:00' : idx === 1 ? '09:30' : idx === 2 ? '11:00' : '15:30'}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        student.status === 'Ativo'
                          ? 'bg-[#39ff14]/15 text-[#39ff14]'
                          : 'bg-[#00ff66]/15 text-[#00ff66]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" /> {student.status}
                    </span>
                  </div>
                  <span className="text-xs text-[#a1a1aa]">
                    {idx === 0 ? 'Agora' : `Hoje`}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold font-display text-white">{student.name}</h4>
                    <span className="text-xs text-[#a1a1aa] block">
                      Treino {student.currentRoutineCode} • {student.goal}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectStudentWorkout();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#00ff66] text-[#04130a] text-xs font-bold font-display flex items-center gap-1.5 active:scale-95 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Abrir Treino
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas críticos: aparecem somente quando há ficha perto de vencer */}
        {expiring.length > 0 && (
          <div className="bg-[#0f0f12] rounded-2xl p-4 border border-[#ffb4ab]/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ffb4ab] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Alertas Críticos
              </h3>
              <span className="text-[10px] text-[#ffb4ab] font-bold bg-[#ffb4ab]/15 px-2 py-0.5 rounded-full">
                {expiring.length} {expiring.length === 1 ? 'ficha' : 'fichas'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {expiring.map(({ student, daysLeft }) => (
                <div key={student.id} className="p-3 rounded-xl bg-[#121214] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>
                      Ficha de {student.name.split(' ')[0]} {daysLeft < 0 ? 'venceu' : daysLeft === 0 ? 'vence hoje' : daysLeft === 1 ? 'vence amanhã' : `vence em ${daysLeft} dias`}
                    </span>
                    <span className="text-[11px] text-[#ffb4ab]">
                      {daysLeft < 0 ? `${-daysLeft}d de atraso` : `${daysLeft}d restando`}
                    </span>
                  </div>
                  <p className="text-[#a1a1aa]">Hora de preparar um novo ciclo de treino para {student.name.split(' ')[0]}.</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
