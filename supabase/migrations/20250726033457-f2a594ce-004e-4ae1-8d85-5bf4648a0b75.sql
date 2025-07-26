-- Create trigger to update profile stats when practice sessions are added
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for practice sessions
CREATE TRIGGER update_profile_stats_trigger
  AFTER INSERT ON public.practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_stats();