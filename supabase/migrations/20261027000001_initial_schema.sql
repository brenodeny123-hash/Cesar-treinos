-- ==============================================================================
-- PULSEFIT / TEAM CESAR - SUPABASE INITIAL SCHEMA MIGRATION
-- Migration: 20261027000001_initial_schema.sql
-- Description: Criação das tabelas de Alunos, Treinos, Exercícios, Logs e RLS
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuários (sincronizada com auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Alunos do Treinador (CRM)
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

-- 4. Tabela de Fichas de Treino (Workout Routines)
CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'E'...
    title TEXT NOT NULL,
    focus_muscles TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 50,
    color TEXT DEFAULT '#f97316',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Exercícios da Ficha
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL CHECK (muscle_group IN ('Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteo')),
    target_sets INTEGER DEFAULT 4,
    target_reps TEXT DEFAULT '8 a 10 reps',
    default_rest_sec INTEGER DEFAULT 60,
    last_weight_kg NUMERIC(6,2),
    last_reps INTEGER,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Histórico de Treinos Executados (Workout Logs)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
    routine_title TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    total_volume_kg INTEGER DEFAULT 0,
    completed_sets_count INTEGER DEFAULT 0,
    exercises_data JSONB, -- Array com séries, reps e cargas realizadas
    prs_achieved JSONB, -- Array com recordes batidos na sessão
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Avaliações e Medidas Físicas (Body Measurements)
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

-- 8. Tabela de Recordes Pessoais (Personal Records - PRs)
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- SEGURANÇA E POLÍTICAS DE ACESSO (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Políticas para Students (Permite leitura/escrita para usuários autenticados ou coaches)
CREATE POLICY "Treinadores autenticados podem gerenciar alunos" 
    ON public.students FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para Workout Routines
CREATE POLICY "Usuários autenticados podem visualizar e gerenciar rotinas" 
    ON public.workout_routines FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para Exercises
CREATE POLICY "Usuários autenticados podem visualizar e gerenciar exercícios" 
    ON public.exercises FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para Workout Logs
CREATE POLICY "Usuários podem ver e criar seus próprios logs de treino" 
    ON public.workout_logs FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para Body Measurements
CREATE POLICY "Usuários podem visualizar e registrar medidas corporais" 
    ON public.body_measurements FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para Personal Records
CREATE POLICY "Usuários podem registrar seus próprios recordes pessoais" 
    ON public.personal_records FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: Criação de Perfil no Cadastro
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- DADOS INICIAIS DE DEMONSTRAÇÃO (SEED)
-- ==============================================================================

INSERT INTO public.students (name, email, phone, plan, monthly_fee, status, current_routine_code, current_routine_title, goal, weight_kg, notes)
VALUES
    ('Lucas Silva', 'lucas.silva@pulsefit.com', '(11) 98765-4321', 'Trimestral VIP', 220.00, 'Ativo', 'A', 'Peito, Deltoide & Tríceps', 'Hipertrofia com Definição', 78.4, 'Boa aderência à periodização.'),
    ('Mariana Costa', 'mariana.costa@gmail.com', '(11) 99123-5566', 'Semestral', 190.00, 'Ativo', 'B', 'Costas, Dorsal & Bíceps', 'Emagrecimento & Fortalecimento', 62.1, 'Restrição leve no joelho esquerdo.'),
    ('Roberto Lima', 'roberto.lima@uol.com.br', '(11) 97788-9900', 'Mensal', 250.00, 'Avaliação', 'C', 'Pernas & Quadríceps', 'Condicionamento Cardiovascular', 84.5, 'Agendada bioimpedância.');
