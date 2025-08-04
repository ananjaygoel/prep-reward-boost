-- Fix the security issue by setting search_path
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  achievement RECORD;
  user_stats RECORD;
  user_streak INTEGER;
BEGIN
  -- Get user stats
  SELECT 
    COUNT(*) as total_questions,
    AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100 as accuracy_rate,
    AVG(time_taken_seconds) as avg_time
  INTO user_stats
  FROM public.practice_sessions 
  WHERE user_id = NEW.user_id;
  
  -- Get user profile for streak (separate variable)
  SELECT streak_days INTO user_streak
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Check each achievement
  FOR achievement IN SELECT * FROM public.achievements WHERE is_active = true LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = NEW.user_id 
      AND achievement_id = achievement.id 
      AND is_completed = true
    ) THEN
      -- Check achievement conditions
      IF (achievement.condition_type = 'total_questions' AND user_stats.total_questions >= achievement.condition_value) OR
         (achievement.condition_type = 'streak_days' AND user_streak >= achievement.condition_value) OR
         (achievement.condition_type = 'accuracy_rate' AND user_stats.accuracy_rate >= achievement.condition_value AND user_stats.total_questions >= 20) OR
         (achievement.condition_type = 'average_time' AND user_stats.avg_time <= achievement.condition_value AND user_stats.total_questions >= 10) THEN
        
        -- Award achievement
        INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
        VALUES (NEW.user_id, achievement.id, true, achievement.condition_value)
        ON CONFLICT (user_id, achievement_id) 
        DO UPDATE SET 
          is_completed = true,
          progress = achievement.condition_value,
          earned_at = now();
          
        -- Add XP to user level
        INSERT INTO public.user_levels (user_id, total_xp)
        VALUES (NEW.user_id, achievement.points_reward)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          total_xp = user_levels.total_xp + achievement.points_reward,
          updated_at = now();
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;