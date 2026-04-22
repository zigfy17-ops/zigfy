-- WORKOUT TRACKING SCHEMA

-- Workout templates (created by trainer or client)
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  assigned_to UUID, -- if a trainer assigns to a client
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  estimated_duration_min INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logged workout sessions (timer or manual)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'timer'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  calories INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  perceived_effort INTEGER, -- 1-10
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generic fitness metric stream (weight, resting hr, sleep, steps...)
CREATE TABLE public.fitness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  metric TEXT NOT NULL, -- weight_kg | body_fat_pct | resting_hr | sleep_hours | steps
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permission: client grants trainer access to their fitness data
CREATE TABLE public.trainer_data_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, trainer_id)
);

-- Helper function: does trainer have access to client's fitness data?
CREATE OR REPLACE FUNCTION public.trainer_has_access(_trainer_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trainer_data_access
    WHERE trainer_id = _trainer_id AND client_id = _client_id AND granted = true
  )
$$;

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_data_access ENABLE ROW LEVEL SECURITY;

-- workouts: owner manages; assigned client can view; trainer with access can view client's workouts
CREATE POLICY "Owners manage workouts" ON public.workouts
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Assigned client views workout" ON public.workouts
  FOR SELECT USING (auth.uid() = assigned_to);
CREATE POLICY "Trainer views client workouts via access" ON public.workouts
  FOR SELECT USING (public.trainer_has_access(auth.uid(), owner_id));

-- workout_exercises: follow parent workout
CREATE POLICY "Manage exercises if own workout" ON public.workout_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.owner_id = auth.uid())
  );
CREATE POLICY "View exercises if can view workout" ON public.workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_id
        AND (w.owner_id = auth.uid()
          OR w.assigned_to = auth.uid()
          OR public.trainer_has_access(auth.uid(), w.owner_id))
    )
  );

-- workout_sessions: client owns; trainer with access can view
CREATE POLICY "Clients manage own sessions" ON public.workout_sessions
  FOR ALL USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Trainer views sessions via access" ON public.workout_sessions
  FOR SELECT USING (public.trainer_has_access(auth.uid(), client_id));

-- fitness_metrics: same pattern
CREATE POLICY "Clients manage own metrics" ON public.fitness_metrics
  FOR ALL USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Trainer views metrics via access" ON public.fitness_metrics
  FOR SELECT USING (public.trainer_has_access(auth.uid(), client_id));

-- trainer_data_access: client controls grant; both parties can view their own row
CREATE POLICY "Clients manage their grants" ON public.trainer_data_access
  FOR ALL USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Trainer views own access rows" ON public.trainer_data_access
  FOR SELECT USING (auth.uid() = trainer_id);

-- updated_at triggers
CREATE TRIGGER workouts_updated BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trainer_access_updated BEFORE UPDATE ON public.trainer_data_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_workouts_owner ON public.workouts(owner_id);
CREATE INDEX idx_workouts_assigned ON public.workouts(assigned_to);
CREATE INDEX idx_sessions_client ON public.workout_sessions(client_id, started_at DESC);
CREATE INDEX idx_metrics_client ON public.fitness_metrics(client_id, recorded_at DESC);
CREATE INDEX idx_access_trainer ON public.trainer_data_access(trainer_id);