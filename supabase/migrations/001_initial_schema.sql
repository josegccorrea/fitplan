-- ============================================================
-- FitPlan — Schema inicial
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'trainer')),
  avatar_url    TEXT,

  -- Dados corporais (onboarding step 1)
  weight_kg     NUMERIC(5,2),
  height_cm     NUMERIC(5,1),
  age           SMALLINT,
  sex           TEXT CHECK (sex IN ('masculino', 'feminino', 'outro')),
  body_fat_pct  NUMERIC(4,1),

  -- Objetivo (step 2)
  goal          TEXT CHECK (goal IN ('perder_gordura', 'ganhar_musculo', 'manter', 'performance')),

  -- Experiência e equipamento (step 3)
  experience_level   TEXT CHECK (experience_level IN ('iniciante', 'intermediario', 'avancado')),
  equipment_type     TEXT CHECK (equipment_type IN ('academia_maquinas', 'pesos_livres', 'casa', 'ao_ar_livre', 'misto')),

  -- Restrições (step 4)
  allergies           TEXT[] DEFAULT '{}',
  disliked_foods      TEXT[] DEFAULT '{}',
  injuries            TEXT,
  available_days_week SMALLINT DEFAULT 3 CHECK (available_days_week BETWEEN 2 AND 6),

  -- Alimentos e orçamento (step 5)
  must_have_foods     TEXT[] DEFAULT '{}',
  monthly_budget_brl  NUMERIC(8,2),

  -- Preferência (step 6)
  prefers_free_weights BOOLEAN DEFAULT TRUE,

  -- Meta
  onboarding_completed BOOLEAN DEFAULT FALSE,
  generation_count     SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-criar profile ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- WORKOUT_PLANS
-- ============================================================
CREATE TABLE public.workout_plans (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active    BOOLEAN DEFAULT TRUE,
  plan_data    JSONB NOT NULL,
  -- Estrutura: { "days": [{ "day_index": 0, "label": "...", "focus": "...",
  --   "is_rest": false, "exercises": [{ "exercise_key": "...", "name": "...",
  --   "sets": 4, "reps": "8-12", "rest_seconds": 90, "technique_note": "...",
  --   "muscle_group": "...", "equipment": "..." }] }] }
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_user_active ON public.workout_plans(user_id, is_active);

-- ============================================================
-- NUTRITION_PLANS
-- ============================================================
CREATE TABLE public.nutrition_plans (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active    BOOLEAN DEFAULT TRUE,
  plan_data    JSONB NOT NULL,
  -- Estrutura: { "daily_calories": 2200, "macros": {"protein_g":180,"carbs_g":240,"fat_g":80},
  --   "days": [{ "day_index": 0, "label": "...", "total_calories": 2200,
  --   "meals": [{ "meal_key": "...", "name": "...", "time": "07:00", "total_calories": 520,
  --   "items": [{ "name": "...", "quantity": "...", "calories": 0,
  --   "protein_g": 0, "carbs_g": 0, "fat_g": 0, "category": "..." }] }] }] }
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nutrition_plans_user_active ON public.nutrition_plans(user_id, is_active);

-- ============================================================
-- WORKOUT_SESSIONS
-- ============================================================
CREATE TABLE public.workout_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  day_index       SMALLINT NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  completed       BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  duration_minutes SMALLINT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_date, day_index)
);

CREATE INDEX idx_sessions_user_date ON public.workout_sessions(user_id, session_date DESC);

-- ============================================================
-- EXERCISE_SETS
-- ============================================================
CREATE TABLE public.exercise_sets (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id     UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_key   TEXT NOT NULL,
  exercise_name  TEXT NOT NULL,
  set_number     SMALLINT NOT NULL,
  reps_performed SMALLINT,
  weight_kg      NUMERIC(6,2),
  completed      BOOLEAN DEFAULT FALSE,
  logged_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sets_session ON public.exercise_sets(session_id);
CREATE INDEX idx_sets_user_exercise ON public.exercise_sets(user_id, exercise_key, logged_at DESC);

-- ============================================================
-- BODY_WEIGHT_LOG
-- ============================================================
CREATE TABLE public.body_weight_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg  NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX idx_body_weight_user_date ON public.body_weight_log(user_id, log_date DESC);

-- ============================================================
-- SHOPPING_LISTS
-- ============================================================
CREATE TABLE public.shopping_lists (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nutrition_plan_id   UUID REFERENCES public.nutrition_plans(id) ON DELETE SET NULL,
  week_start_date     DATE NOT NULL,
  period_type         TEXT DEFAULT 'semanal' CHECK (period_type IN ('semanal', 'mensal')),
  items               JSONB NOT NULL DEFAULT '[]',
  -- [{ "category": "Proteínas", "items": [{ "name": "...", "quantity": "...",
  --    "checked": false, "estimated_cost_brl": 28.00 }] }]
  estimated_total_brl NUMERIC(8,2),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date, period_type)
);

CREATE TRIGGER shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_shopping_lists_user ON public.shopping_lists(user_id, week_start_date DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_weight_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists   ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_own_all" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','trainer'))
  );

-- WORKOUT_PLANS
CREATE POLICY "workout_plans_own" ON public.workout_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "workout_plans_admin_read" ON public.workout_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','trainer'))
  );

-- NUTRITION_PLANS
CREATE POLICY "nutrition_plans_own" ON public.nutrition_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "nutrition_plans_admin_read" ON public.nutrition_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','trainer'))
  );

-- WORKOUT_SESSIONS
CREATE POLICY "sessions_own" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "sessions_admin_read" ON public.workout_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','trainer'))
  );

-- EXERCISE_SETS
CREATE POLICY "sets_own" ON public.exercise_sets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "sets_admin_read" ON public.exercise_sets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','trainer'))
  );

-- BODY_WEIGHT_LOG
CREATE POLICY "body_weight_own" ON public.body_weight_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "body_weight_admin_read" ON public.body_weight_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','trainer'))
  );

-- SHOPPING_LISTS
CREATE POLICY "shopping_lists_own" ON public.shopping_lists
  FOR ALL USING (auth.uid() = user_id);
