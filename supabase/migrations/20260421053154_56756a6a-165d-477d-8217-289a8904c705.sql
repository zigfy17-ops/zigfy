
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'trainer', 'client');

-- Booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Trainers (extra profile info for trainers)
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  expertise TEXT[],
  hourly_rate NUMERIC(10,2),
  years_experience INT,
  availability TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'pending',
  requested_date TIMESTAMPTZ NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_trainers_updated_at BEFORE UPDATE ON public.trainers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default client role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'client'::app_role)
  );

  -- If trainer, create a trainer profile pending approval
  IF (NEW.raw_user_meta_data ->> 'role') = 'trainer' THEN
    INSERT INTO public.trainers (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- trainers policies
CREATE POLICY "Approved trainers viewable by everyone"
  ON public.trainers FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Trainers update own trainer profile"
  ON public.trainers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Trainers insert own trainer profile"
  ON public.trainers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage trainers"
  ON public.trainers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- bookings policies
CREATE POLICY "Clients create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'));
CREATE POLICY "Participants view bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = trainer_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Trainers update bookings to them"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = trainer_id OR auth.uid() = client_id);

-- notifications policies
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Notification trigger when booking created
CREATE OR REPLACE FUNCTION public.notify_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (NEW.trainer_id, 'New booking request', 'You have a new appointment request.', '/trainer/bookings');
  ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (NEW.client_id, 'Booking ' || NEW.status, 'Your booking is now ' || NEW.status || '.', '/client/bookings');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_notify
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking();
