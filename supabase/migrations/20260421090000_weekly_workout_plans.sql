-- WEEKLY WORKOUT PLANS

CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Weekly Plan',
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, client_id)
);

CREATE TABLE public.workout_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT day_index_range CHECK (day_index BETWEEN 1 AND 7)
);

CREATE TABLE public.workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.workout_plan_days(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer manages client plans" ON public.workout_plans
  FOR ALL USING (
    auth.uid() = trainer_id
    AND public.trainer_has_access(auth.uid(), client_id)
  ) WITH CHECK (
    auth.uid() = trainer_id
    AND public.trainer_has_access(auth.uid(), client_id)
  );

CREATE POLICY "Client views own plan" ON public.workout_plans
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Trainer manages plan days" ON public.workout_plan_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans p
      WHERE p.id = plan_id
        AND p.trainer_id = auth.uid()
        AND public.trainer_has_access(auth.uid(), p.client_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_plans p
      WHERE p.id = plan_id
        AND p.trainer_id = auth.uid()
        AND public.trainer_has_access(auth.uid(), p.client_id)
    )
  );

CREATE POLICY "Client views plan days" ON public.workout_plan_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans p
      WHERE p.id = plan_id AND p.client_id = auth.uid()
    )
  );

CREATE POLICY "Trainer manages plan exercises" ON public.workout_plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_plan_days d
      JOIN public.workout_plans p ON p.id = d.plan_id
      WHERE d.id = day_id
        AND p.trainer_id = auth.uid()
        AND public.trainer_has_access(auth.uid(), p.client_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_plan_days d
      JOIN public.workout_plans p ON p.id = d.plan_id
      WHERE d.id = day_id
        AND p.trainer_id = auth.uid()
        AND public.trainer_has_access(auth.uid(), p.client_id)
    )
  );

CREATE POLICY "Client views plan exercises" ON public.workout_plan_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_plan_days d
      JOIN public.workout_plans p ON p.id = d.plan_id
      WHERE d.id = day_id AND p.client_id = auth.uid()
    )
  );

CREATE TRIGGER workout_plans_updated BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_workout_plans_client ON public.workout_plans(client_id);
CREATE INDEX idx_workout_plans_trainer ON public.workout_plans(trainer_id);
CREATE INDEX idx_workout_plan_days_plan ON public.workout_plan_days(plan_id);
CREATE INDEX idx_workout_plan_exercises_day ON public.workout_plan_exercises(day_id);
