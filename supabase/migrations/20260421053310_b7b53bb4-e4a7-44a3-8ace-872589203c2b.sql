
DROP POLICY IF EXISTS "System inserts notifications" ON public.notifications;
CREATE POLICY "Users insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
