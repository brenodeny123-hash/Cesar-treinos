import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext.tsx';
import { Student } from '../types/crm.ts';
import {
  X,
  UserPlus,
  Users,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Phone,
  Mail,
  Dumbbell,
  DollarSign,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (student: Student) => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const { students, routines, addStudent, updateStudent, deleteStudent } = useWorkout();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Form state for Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'Mensal' | 'Trimestral VIP' | 'Semestral' | 'Anual'>('Trimestral VIP');
  const [monthlyFee, setMonthlyFee] = useState(220);
  const [status, setStatus] = useState<'Ativo' | 'Pendente' | 'Avaliação'>('Ativo');
  const [currentRoutineCode, setCurrentRoutineCode] = useState('A');
  const [goal, setGoal] = useState('Hipertrofia com Definição');
  const [weightKg, setWeightKg] = useState(78.5);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingStudentId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPlan('Trimestral VIP');
    setMonthlyFee(220);
    setStatus('Ativo');
    setCurrentRoutineCode('A');
    setGoal('Hipertrofia com Definição');
    setWeightKg(78.5);
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setPlan(student.plan);
    setMonthlyFee(student.monthlyFee);
    setStatus(student.status);
    setCurrentRoutineCode(student.currentRoutineCode);
    setGoal(student.goal);
    setWeightKg(student.weightKg);
    setNotes(student.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, studentName: string) => {
    if (window.confirm(`Tem certeza que deseja remover o aluno "${studentName}"?`)) {
      deleteStudent(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const matchedRoutine = routines.find(r => r.code === currentRoutineCode) || routines[0];
    const routineTitle = matchedRoutine ? matchedRoutine.title : 'Treino Personalizado';

    if (editingStudentId) {
      updateStudent(editingStudentId, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        plan,
        monthlyFee: Number(monthlyFee),
        status,
        currentRoutineCode,
        currentRoutineTitle: routineTitle,
        goal: goal.trim(),
        weightKg: Number(weightKg),
        notes: notes.trim() || undefined,
      });
    } else {
      addStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '(11) 99999-9999',
        plan,
        monthlyFee: Number(monthlyFee),
        status,
        currentRoutineCode,
        currentRoutineTitle: routineTitle,
        goal: goal.trim() || 'Hipertrofia',
        weightKg: Number(weightKg) || 75,
        notes: notes.trim() || undefined,
      });
    }

    setIsFormOpen(false);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.goal.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || s.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1326]/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="h-16 px-4 bg-[#131b2e] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f97316]/20 text-[#f97316] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white">Gestão de Alunos (CRUD)</h2>
            <span className="text-xs text-[#94a3b8]">{students.length} alunos cadastrados</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Aluno</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full pb-20">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou objetivo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#131b2e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-[#131b2e] rounded-xl border border-white/5 text-xs font-semibold shrink-0 overflow-x-auto no-scrollbar">
            {['todos', 'ativo', 'pendente', 'avaliação'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-[#f97316] text-[#090d16] font-bold'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="bg-[#131b2e] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#171f33] to-[#222a3d] border border-white/10 flex items-center justify-center text-sm font-bold font-display text-[#f97316] shrink-0">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold font-display text-white truncate">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" /> {student.email}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    student.status === 'Ativo'
                      ? 'bg-[#91db2a]/15 text-[#91db2a] border border-[#91db2a]/30'
                      : student.status === 'Pendente'
                      ? 'bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30'
                      : 'bg-[#89ceff]/15 text-[#89ceff] border border-[#89ceff]/30'
                  }`}
                >
                  {student.status}
                </span>
              </div>

              {/* Details & Prescription */}
              <div className="grid grid-cols-3 gap-2 bg-[#0b1326] p-2.5 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-[#94a3b8] block">Ficha Atual</span>
                  <span className="font-bold text-[#f97316] font-display">
                    Treino {student.currentRoutineCode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94a3b8] block">Plano</span>
                  <span className="font-semibold text-white truncate block">
                    {student.plan}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94a3b8] block">Mensalidade</span>
                  <span className="font-mono font-bold text-[#91db2a]">
                    R$ {student.monthlyFee}
                  </span>
                </div>
              </div>

              {/* Goal & Notes */}
              <div className="text-xs text-[#94a3b8] space-y-0.5">
                <p>
                  <strong className="text-[#dae2fd]">Objetivo:</strong> {student.goal}
                </p>
                {student.notes && (
                  <p className="italic text-[11px] truncate">"{student.notes}"</p>
                )}
              </div>

              {/* Card Actions (CRUD: Edit, Delete) */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#94a3b8]">
                  Desde {student.joinedDate}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(student)}
                    className="p-1.5 rounded-lg bg-[#171f33] hover:bg-[#222a3d] text-[#89ceff] text-xs flex items-center gap-1 transition-colors"
                    title="Editar Aluno"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(student.id, student.name)}
                    className="p-1.5 rounded-lg bg-[#171f33] hover:bg-[#93000a]/30 text-[#ffb4ab] text-xs flex items-center gap-1 transition-colors"
                    title="Excluir Aluno"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-[#131b2e] rounded-2xl border border-white/5 p-6">
            <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-white">Nenhum aluno encontrado</h4>
            <p className="text-xs text-[#94a3b8] mt-1">
              Tente alterar os termos da busca ou cadastre um novo aluno.
            </p>
          </div>
        )}
      </main>

      {/* Form Modal (Create or Edit Student) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171f33] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  {editingStudentId ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
                </h3>
                <span className="text-xs text-[#94a3b8]">
                  {editingStudentId ? 'Atualize as informações e ficha' : 'Preencha os dados do novo membro #TeamCesar'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@exemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Plano</label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value as 'Trimestral VIP')}
                    className="w-full h-11 px-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral VIP">Trimestral VIP</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'Ativo')}
                    className="w-full h-11 px-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Avaliação">Avaliação</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">Mensalidade (R$)</label>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={e => setMonthlyFee(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    Ficha Atribuída
                  </label>
                  <select
                    value={currentRoutineCode}
                    onChange={e => setCurrentRoutineCode(e.target.value)}
                    className="w-full h-11 px-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                  >
                    {routines.map(r => (
                      <option key={r.id} value={r.code}>
                        Treino {r.code} • {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                    Peso Inicial (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Objetivo Principal
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hipertrofia com foco em peito e ombros"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b1326] border border-white/10 text-sm text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Notas Técnicas / Restrições Médicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Histórico de tendinite no ombro direito, evitar repetições com tranco."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#222a3d] text-xs font-semibold text-[#dae2fd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold font-display shadow-lg active:scale-95"
                >
                  {editingStudentId ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
