-- Create enum types for better data integrity
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_type AS ENUM ('single_correct', 'multiple_correct', 'numerical', 'assertion_reason');
CREATE TYPE subject_type AS ENUM ('physics', 'chemistry', 'mathematics');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  target_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM NOW()) + 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code subject_type NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weightage INTEGER DEFAULT 5, -- percentage weightage in JEE
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, name)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  options JSONB, -- for MCQ options
  correct_answer JSONB NOT NULL, -- stores correct answer(s)
  explanation TEXT,
  solution_steps TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 180,
  year_appeared INTEGER, -- which JEE year this appeared
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user practice sessions
CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions ON DELETE CASCADE,
  user_answer JSONB,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  points_earned INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards system
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT, -- icon name or emoji
  condition_type TEXT NOT NULL, -- 'streak', 'points', 'questions_solved', 'perfect_score'
  condition_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user rewards (earned rewards)
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for public data (subjects, topics, questions, rewards)
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view topics" ON public.topics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active questions" ON public.questions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active rewards" ON public.rewards
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user-specific data
CREATE POLICY "Users can view their own practice sessions" ON public.practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice sessions" ON public.practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rewards" ON public.user_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards" ON public.user_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_questions_topic_difficulty ON public.questions(topic_id, difficulty);
CREATE INDEX idx_questions_subject_via_topic ON public.questions(topic_id);
CREATE INDEX idx_practice_sessions_user_date ON public.practice_sessions(user_id, attempted_at DESC);
CREATE INDEX idx_user_rewards_user_earned ON public.user_rewards(user_id, earned_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial data for subjects
INSERT INTO public.subjects (name, code, description) VALUES
  ('Physics', 'physics', 'Classical mechanics, thermodynamics, electromagnetism, optics, and modern physics'),
  ('Chemistry', 'chemistry', 'Physical chemistry, organic chemistry, and inorganic chemistry'),
  ('Mathematics', 'mathematics', 'Algebra, calculus, coordinate geometry, trigonometry, and statistics');

-- Insert sample topics for Physics
INSERT INTO public.topics (subject_id, name, description, weightage) VALUES
  ((SELECT id FROM public.subjects WHERE code = 'physics'), 'Mechanics', 'Motion, forces, work and energy', 20),
  ((SELECT id FROM public.subjects WHERE code = 'physics'), 'Thermodynamics', 'Heat and thermal processes', 10),
  ((SELECT id FROM public.subjects WHERE code = 'physics'), 'Electromagnetism', 'Electric and magnetic fields', 25),
  ((SELECT id FROM public.subjects WHERE code = 'physics'), 'Optics', 'Light and optical phenomena', 15),
  ((SELECT id FROM public.subjects WHERE code = 'physics'), 'Modern Physics', 'Quantum mechanics and relativity', 15);

-- Insert sample topics for Chemistry
INSERT INTO public.topics (subject_id, name, description, weightage) VALUES
  ((SELECT id FROM public.subjects WHERE code = 'chemistry'), 'Physical Chemistry', 'Chemical kinetics, thermodynamics', 35),
  ((SELECT id FROM public.subjects WHERE code = 'chemistry'), 'Organic Chemistry', 'Carbon compounds and reactions', 40),
  ((SELECT id FROM public.subjects WHERE code = 'chemistry'), 'Inorganic Chemistry', 'Elements and their compounds', 25);

-- Insert sample topics for Mathematics  
INSERT INTO public.topics (subject_id, name, description, weightage) VALUES
  ((SELECT id FROM public.subjects WHERE code = 'mathematics'), 'Algebra', 'Equations, sequences, and series', 25),
  ((SELECT id FROM public.subjects WHERE code = 'mathematics'), 'Calculus', 'Limits, derivatives, and integration', 30),
  ((SELECT id FROM public.subjects WHERE code = 'mathematics'), 'Coordinate Geometry', 'Analytical geometry in 2D and 3D', 20),
  ((SELECT id FROM public.subjects WHERE code = 'mathematics'), 'Trigonometry', 'Trigonometric functions and identities', 15),
  ((SELECT id FROM public.subjects WHERE code = 'mathematics'), 'Probability', 'Statistics and probability theory', 10);

-- Insert sample rewards
INSERT INTO public.rewards (name, description, icon, condition_type, condition_value, points_reward) VALUES
  ('First Steps', 'Complete your first question!', '🎯', 'questions_solved', 1, 50),
  ('Getting Started', 'Solve 10 questions', '⭐', 'questions_solved', 10, 100),
  ('Dedicated Student', 'Solve 50 questions', '🏆', 'questions_solved', 50, 300),
  ('JEE Warrior', 'Solve 100 questions', '👑', 'questions_solved', 100, 500),
  ('Streak Master', 'Maintain 7-day practice streak', '🔥', 'streak', 7, 200),
  ('Perfect Week', 'Maintain 7-day streak with 100% accuracy', '💎', 'perfect_streak', 7, 400),
  ('Point Collector', 'Earn 1000 points', '💰', 'points', 1000, 200),
  ('Speed Demon', 'Answer 5 questions in under 30 seconds each', '⚡', 'speed', 5, 150);