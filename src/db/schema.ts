import { relations } from 'drizzle-orm';
import { integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Tabela de Usuários (Alunos e Treinadores)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('student'), // 'student' ou 'coach'
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Fichas de Treino do Usuário
export const workoutRoutines = pgTable('workout_routines', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  code: text('code').notNull(), // A, B, C, D...
  title: text('title').notNull(),
  focusMuscles: text('focus_muscles'),
  estimatedMinutes: integer('estimated_minutes').default(50),
  color: text('color').default('#f97316'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Histórico de Treinos Executados
export const workoutLogs = pgTable('workout_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  routineTitle: text('routine_title').notNull(),
  date: text('date').notNull(),
  durationMinutes: integer('duration_minutes').default(0),
  totalVolumeKg: integer('total_volume_kg').default(0),
  completedSetsCount: integer('completed_sets_count').default(0),
  exercisesData: text('exercises_data'), // JSON serializado de exercícios/séries
  prsAchieved: text('prs_achieved'), // JSON serializado de recordes
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Medições e Avaliações Físicas
export const bodyMeasurements = pgTable('body_measurements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  date: text('date').notNull(),
  weightKg: numeric('weight_kg').notNull(),
  bodyFatPct: numeric('body_fat_pct'),
  chestCm: numeric('chest_cm'),
  waistCm: numeric('waist_cm'),
  armsCm: numeric('arms_cm'),
  thighsCm: numeric('thighs_cm'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Recordes Pessoais (PRs)
export const personalRecords = pgTable('personal_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  exerciseName: text('exercise_name').notNull(),
  weightKg: numeric('weight_kg').notNull(),
  reps: integer('reps').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Definição de Relações
export const usersRelations = relations(users, ({ many }) => ({
  routines: many(workoutRoutines),
  logs: many(workoutLogs),
  measurements: many(bodyMeasurements),
  prs: many(personalRecords),
}));

export const workoutRoutinesRelations = relations(workoutRoutines, ({ one }) => ({
  user: one(users, {
    fields: [workoutRoutines.userId],
    references: [users.id],
  }),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  user: one(users, {
    fields: [workoutLogs.userId],
    references: [users.id],
  }),
}));

export const bodyMeasurementsRelations = relations(bodyMeasurements, ({ one }) => ({
  user: one(users, {
    fields: [bodyMeasurements.userId],
    references: [users.id],
  }),
}));

export const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  user: one(users, {
    fields: [personalRecords.userId],
    references: [users.id],
  }),
}));
