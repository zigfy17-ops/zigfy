-- Trainer accounts should be active immediately without admin approval.
ALTER TABLE public.trainers ALTER COLUMN is_approved
SET
    DEFAULT true;

-- Backfill existing trainers so no account remains blocked by legacy approval state.
UPDATE public.trainers
SET
    is_approved = true
WHERE
    is_approved = false;

DROP POLICY IF EXISTS "Approved trainers viewable by everyone" ON public.trainers;

CREATE POLICY "Trainers viewable by everyone" ON public.trainers FOR
SELECT USING (true);