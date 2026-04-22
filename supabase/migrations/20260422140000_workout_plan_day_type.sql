ALTER TABLE public.workout_plan_days
ADD COLUMN IF NOT EXISTS workout_type TEXT;

UPDATE public.workout_plan_days
SET
    workout_type = 'strength'
WHERE
    workout_type IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'workout_plan_days_workout_type_check'
  ) THEN
    ALTER TABLE public.workout_plan_days
    ADD CONSTRAINT workout_plan_days_workout_type_check CHECK (
      workout_type IN ('light', 'strength', 'hiit', 'cardio')
    );
  END IF;
END $$;