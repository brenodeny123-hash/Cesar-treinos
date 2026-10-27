import React, { useState } from 'react';
import {
  isSupabaseConfigured,
  supabaseService,
  updateSupabaseCredentials,
  clearSupabaseCredentials,
} from '../lib/supabase.ts';
import {
  X,
  Database,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  Key,
  ShieldCheck,
  FileCode,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_MIGRATION_SQL = `-- ==============================================================================
-- PULSEFIT / TEAM CESAR - SUPABASE INITIAL SCHEMA MIGRATION
-- Migration: 20261027000001_initial_schema.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Alunos do Treinador (CRM)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'Trimestral VIP' CHECK (plan IN ('Mensal', 'Trimestral VIP', 'Semestral', 'Anual')),
    monthly_fee NUMERIC(10,2) DEFAULT 220.00,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Pendente', 'Avaliação')),
    current_routine_code TEXT DEFAULT 'A',
    current_routine_title TEXT DEFAULT 'Peito, Deltoide & Tríceps',
    goal TEXT DEFAULT 'Hipertrofia com Definição',
    weight_kg NUMERIC(5,2) DEFAULT 75.0,
    joined_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Fichas de Treino
CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    focus_muscles TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 50,
    color TEXT DEFAULT '#f97316',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Exercícios
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    target_sets INTEGER DEFAULT 4,
    target_reps TEXT DEFAULT '8 a 10 reps',
    default_rest_sec INTEGER DEFAULT 60,
    last_weight_kg NUMERIC(6,2),
    last_reps INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Logs de Treino
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_title TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    total_volume_kg INTEGER DEFAULT 0,
    completed_sets_count INTEGER DEFAULT 0,
    exercises_data JSONB,
    prs_achieved JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Medidas Corporais
CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    body_fat_pct NUMERIC(4,1),
    chest_cm NUMERIC(5,1),
    waist_cm NUMERIC(5,1),
    arms_cm NUMERIC(5,1),
    thighs_cm NUMERIC(5,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Recordes Pessoais (PRs)
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Acesso total a alunos" ON public.students FOR ALL USING (true);
CREATE POLICY "Acesso total a rotinas" ON public.workout_routines FOR ALL USING (true);
CREATE POLICY "Acesso total a exercícios" ON public.exercises FOR ALL USING (true);
CREATE POLICY "Acesso total a logs" ON public.workout_logs FOR ALL USING (true);
CREATE POLICY "Acesso total a medidas" ON public.body_measurements FOR ALL USING (true);
CREATE POLICY "Acesso total a recordes" ON public.personal_records FOR ALL USING (true);`;

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'migration' | 'settings'>('migration');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ loading: boolean; message: string | null; success?: boolean }>({
    loading: false,
    message: null,
  });

  const [inputUrl, setInputUrl] = useState(() => {
    return localStorage.getItem('pulsefit_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  });
  const [inputKey, setInputKey] = useState(() => {
    return localStorage.getItem('pulsefit_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  });

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult({ loading: true, message: 'Testando conexão com Supabase...' });
    const result = await supabaseService.testConnection();
    setTestResult({ loading: false, message: result.message, success: result.success });
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) return;
    updateSupabaseCredentials(inputUrl, inputKey);
  };

  const handleClear = () => {
    if (window.confirm('Deseja limpar as credenciais do Supabase salvas localmente?')) {
      clearSupabaseCredentials();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#131b2e] border border-white/10 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/20 text-[#3ECF8E] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display text-white">Integração com Supabase</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured
                    ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                    : 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40'
                }`}>
                  {isSupabaseConfigured ? 'Conectado' : 'Pronto para Configurar'}
                </span>
              </div>
              <span className="text-xs text-[#94a3b8]">Migrations SQL & Conexão PostgreSQL em Nuvem</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#171f33] hover:bg-[#222a3d] text-[#94a3b8] hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0b1326] border border-white/5 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('migration')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'migration'
                ? 'bg-[#171f33] text-white shadow-sm font-bold'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#3ECF8E]" />
            <span>Migrations SQL (Criar Tabelas)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#171f33] text-white shadow-sm font-bold'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-[#f97316]" />
            <span>Chaves & Conexão (URL / Anon Key)</span>
          </button>
        </div>

        {/* Tab 1: Migrations SQL */}
        {activeTab === 'migration' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="bg-[#171f33] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-white">
                    Arquivo de Migração Criado
                  </h3>
                  <span className="text-xs font-mono text-[#3ECF8E]">
                    supabase/migrations/20261027000001_initial_schema.sql
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-[#090d16] text-xs font-bold font-display flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar SQL Completo'}</span>
                </button>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Este script SQL cria todas as 7 tabelas necessárias no Supabase (<code className="text-[#dae2fd]">students</code>, <code className="text-[#dae2fd]">workout_routines</code>, <code className="text-[#dae2fd]">exercises</code>, <code className="text-[#dae2fd]">workout_logs</code>, <code className="text-[#dae2fd]">body_measurements</code>, <code className="text-[#dae2fd]">personal_records</code>, <code className="text-[#dae2fd]">profiles</code>), políticas RLS e triggers. Basta colar no <strong>SQL Editor</strong> do seu painel Supabase e rodar!
              </p>
            </div>

            {/* Code Box */}
            <div className="relative rounded-2xl bg-[#0b1326] border border-white/10 p-4 font-mono text-[11px] text-[#dae2fd] overflow-x-auto max-h-60 leading-relaxed no-scrollbar">
              <pre>{SUPABASE_MIGRATION_SQL}</pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-[#171f33] p-3 rounded-xl border border-white/5">
                <span className="text-[#3ECF8E] font-bold block">7 Tabelas</span>
                <span className="text-[#94a3b8] text-[11px]">Alunos, Treinos, Cargas, PRs</span>
              </div>
              <div className="bg-[#171f33] p-3 rounded-xl border border-white/5">
                <span className="text-[#89ceff] font-bold block">Políticas RLS</span>
                <span className="text-[#94a3b8] text-[11px]">Segurança por Usuário</span>
              </div>
              <div className="bg-[#171f33] p-3 rounded-xl border border-white/5">
                <span className="text-[#f97316] font-bold block">Triggers Automáticos</span>
                <span className="text-[#94a3b8] text-[11px]">Sincronização no Cadastro</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Settings & Connection */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <form onSubmit={handleSaveCredentials} className="bg-[#171f33] p-4 rounded-2xl border border-white/5 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Project URL do Supabase
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#dae2fd] block mb-1">
                  Anon / Public API Key
                </label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={e => setInputKey(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl bg-[#222a3d] text-xs text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                >
                  Limpar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testResult.loading}
                    className="px-3.5 py-2 rounded-xl bg-[#222a3d] hover:bg-[#2d3449] text-xs font-semibold text-[#dae2fd] flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
                    <span>Testar Conexão</span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-[#090d16] text-xs font-bold font-display shadow-md active:scale-95 transition-all"
                  >
                    Salvar e Conectar
                  </button>
                </div>
              </div>
            </form>

            {testResult.message && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-[#172617] border-[#3ECF8E]/40 text-[#3ECF8E]'
                  : 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]'
              }`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="bg-[#171f33] p-4 rounded-2xl border border-white/5 text-xs text-[#94a3b8] space-y-1.5 leading-relaxed">
              <span className="text-[#dae2fd] font-semibold block">Onde encontrar suas credenciais?</span>
              <p>
                1. No painel do seu projeto no Supabase, vá em <strong>Project Settings</strong> &gt; <strong>API</strong>.
              </p>
              <p>
                2. Copie a <strong>Project URL</strong> e a chave <strong>anon / public</strong>.
              </p>
              <p>
                3. Cole nos campos acima ou configure no arquivo <code className="text-white">.env.example</code> como <code className="text-[#3ECF8E]">VITE_SUPABASE_URL</code> e <code className="text-[#3ECF8E]">VITE_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
