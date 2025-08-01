-- Add achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'practice', 'streak', 'accuracy', 'speed', 'social'
  condition_type TEXT NOT NULL, -- 'total_questions', 'streak_days', 'accuracy_rate', 'speed_time'
  condition_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  badge_color TEXT NOT NULL DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Add daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  challenge_type TEXT NOT NULL, -- 'questions_count', 'accuracy_target', 'time_challenge', 'subject_focus'
  target_value INTEGER NOT NULL,
  subject_filter TEXT, -- optional subject filter
  difficulty_filter TEXT, -- optional difficulty filter
  points_reward INTEGER NOT NULL DEFAULT 50,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user challenge progress table
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Add user levels table
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_for_next_level INTEGER NOT NULL DEFAULT 100,
  level_rewards_claimed JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Anyone can view active achievements" 
ON public.achievements FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their achievement progress" 
ON public.user_achievements FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for daily_challenges
CREATE POLICY "Anyone can view active daily challenges" 
ON public.daily_challenges FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_challenge_progress
CREATE POLICY "Users can view their own challenge progress" 
ON public.user_challenge_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress" 
ON public.user_challenge_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" 
ON public.user_challenge_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for user_levels
CREATE POLICY "Users can view their own level" 
ON public.user_levels FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage user levels" 
ON public.user_levels FOR ALL 
USING (true);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, category, condition_type, condition_value, points_reward, badge_color) VALUES
('First Steps', 'Complete your first practice question', 'Trophy', 'practice', 'total_questions', 1, 10, '#10B981'),
('Getting Started', 'Complete 10 practice questions', 'Target', 'practice', 'total_questions', 10, 25, '#3B82F6'),
('Dedicated Learner', 'Complete 50 practice questions', 'BookOpen', 'practice', 'total_questions', 50, 50, '#8B5CF6'),
('Question Master', 'Complete 100 practice questions', 'Crown', 'practice', 'total_questions', 100, 100, '#F59E0B'),
('Consistency King', 'Maintain a 7-day study streak', 'Flame', 'streak', 'streak_days', 7, 75, '#EF4444'),
('Streak Legend', 'Maintain a 30-day study streak', 'Zap', 'streak', 'streak_days', 30, 200, '#DC2626'),
('Accuracy Expert', 'Achieve 80% accuracy in 20 questions', 'Target', 'accuracy', 'accuracy_rate', 80, 100, '#059669'),
('Speed Demon', 'Answer 10 questions in under 5 minutes', 'Clock', 'speed', 'average_time', 30, 75, '#7C3AED');

-- Insert sample daily challenge
INSERT INTO public.daily_challenges (date, challenge_type, target_value, points_reward, bonus_points, description) VALUES
(CURRENT_DATE, 'questions_count', 20, 50, 25, 'Complete 20 practice questions today');

-- Function to update user levels based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_level INTEGER;
  xp_needed INTEGER;
BEGIN
  -- Calculate new level (each level requires 100 more XP than previous)
  new_level := FLOOR(SQRT(NEW.total_xp / 50)) + 1;
  xp_needed := (new_level * new_level - new_level) * 50;
  
  -- Update level if it changed
  IF new_level != NEW.current_level THEN
    NEW.current_level := new_level;
    NEW.xp_for_next_level := ((new_level + 1) * (new_level + 1) - (new_level + 1)) * 50 - NEW.total_xp;
  ELSE
    NEW.xp_for_next_level := ((new_level + 1) * (new_level + 1) - (new_level + 1)) * 50 - NEW.total_xp;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for level updates
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE ON public.user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  achievement RECORD;
  user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT 
    COUNT(*) as total_questions,
    AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100 as accuracy_rate,
    AVG(time_taken_seconds) as avg_time
  INTO user_stats
  FROM public.practice_sessions 
  WHERE user_id = NEW.user_id;
  
  -- Get user profile for streak
  SELECT streak_days INTO user_stats.streak_days
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
         (achievement.condition_type = 'streak_days' AND user_stats.streak_days >= achievement.condition_value) OR
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

-- Create trigger to check achievements after practice sessions
CREATE TRIGGER check_achievements_trigger
  AFTER INSERT ON public.practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_achievements();

-- Add indexes for performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);
CREATE INDEX idx_user_challenge_progress_challenge_id ON public.user_challenge_progress(challenge_id);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(date);
CREATE INDEX idx_user_levels_user_id ON public.user_levels(user_id);