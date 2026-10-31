-- Índice para carregar o histórico de cada aluno rapidamente (RLS já isola por usuário).
create index if not exists workout_logs_user_date_idx on public.workout_logs (user_id, date desc);
