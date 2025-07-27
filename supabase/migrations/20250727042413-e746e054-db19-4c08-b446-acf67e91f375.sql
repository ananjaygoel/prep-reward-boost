-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update total points
  UPDATE public.profiles 
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0) 
    FROM public.practice_sessions 
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  -- Update streak (simplified: count consecutive days with practice)
  UPDATE public.profiles 
  SET 
    last_practice_date = CURRENT_DATE,
    streak_days = CASE 
      WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
      WHEN last_practice_date = CURRENT_DATE THEN streak_days
      ELSE 1
    END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;