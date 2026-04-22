ALTER TABLE public.workout_sessions
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.workout_plans (id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS plan_day_id UUID REFERENCES public.workout_plan_days (id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS plan_day_index INT,
ADD COLUMN IF NOT EXISTS workout_type TEXT,
ADD COLUMN IF NOT EXISTS completion_ratio NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS workout_efficiency NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS report_json JSONB;

ALTER TABLE public.workout_sessions
ADD CONSTRAINT workout_sessions_plan_day_index_positive CHECK (
    plan_day_index IS NULL
    OR plan_day_index > 0
),
ADD CONSTRAINT workout_sessions_completion_ratio_range CHECK (
    completion_ratio IS NULL
    OR (
        completion_ratio >= 0
        AND completion_ratio <= 1
    )
),
ADD CONSTRAINT workout_sessions_workout_efficiency_range CHECK (
    workout_efficiency IS NULL
    OR (
        workout_efficiency >= 0
        AND workout_efficiency <= 100
    )
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_plan_day ON public.workout_sessions (
    client_id,
    plan_id,
    plan_day_index
);