-- Treat accepted trainer-client bookings as data access.
-- This keeps existing explicit share grants while also enabling trainer workflows after appointment acceptance.

CREATE OR REPLACE FUNCTION public.trainer_has_access(_trainer_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trainer_data_access
    WHERE trainer_id = _trainer_id
      AND client_id = _client_id
      AND granted = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE trainer_id = _trainer_id
      AND client_id = _client_id
      AND status = 'accepted'
  )
$$;