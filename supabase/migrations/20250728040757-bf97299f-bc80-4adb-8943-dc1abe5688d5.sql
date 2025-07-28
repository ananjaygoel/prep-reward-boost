-- Create study plans table for AI-driven adaptive learning paths
CREATE TABLE public.study_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_exam_date DATE,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  subjects JSONB NOT NULL DEFAULT '[]', -- Array of subject IDs and weightage
  total_weeks INTEGER NOT NULL DEFAULT 12,
  current_week INTEGER NOT NULL DEFAULT 1,
  completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  ai_recommendations JSONB, -- AI-generated study recommendations
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily study goals table
CREATE TABLE public.daily_study_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  study_plan_id UUID NOT NULL,
  date DATE NOT NULL,
  target_questions INTEGER NOT NULL DEFAULT 20,
  target_time_minutes INTEGER NOT NULL DEFAULT 120,
  completed_questions INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  subjects_focus JSONB NOT NULL DEFAULT '[]', -- Array of subject priorities for the day
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(study_plan_id, date)
);

-- Create mock tests table
CREATE TABLE public.mock_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 180, -- 3 hours for full JEE
  total_marks INTEGER NOT NULL DEFAULT 300,
  question_distribution JSONB NOT NULL, -- {physics: 30, chemistry: 30, math: 30}
  difficulty_distribution JSONB NOT NULL, -- {easy: 30, medium: 40, hard: 30}
  is_full_length BOOLEAN NOT NULL DEFAULT true,
  syllabus_coverage JSONB, -- Topics covered in this test
  created_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mock test sessions table
CREATE TABLE public.mock_test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mock_test_id UUID NOT NULL,
  questions JSONB NOT NULL, -- Array of question IDs and their order
  user_answers JSONB NOT NULL DEFAULT '{}', -- User responses indexed by question_id
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  total_score INTEGER DEFAULT 0,
  subject_scores JSONB, -- Scores by subject
  accuracy_percentage DECIMAL(5,2),
  rank INTEGER, -- Rank among all users who took this test
  percentile DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user analytics table for performance tracking
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  subjects_practiced JSONB NOT NULL DEFAULT '{}', -- Subject-wise question counts
  difficulty_performance JSONB NOT NULL DEFAULT '{}', -- Performance by difficulty
  peak_performance_time TEXT, -- Time of day when user performs best
  weak_topics JSONB NOT NULL DEFAULT '[]', -- Topics needing improvement
  strong_topics JSONB NOT NULL DEFAULT '[]', -- Topics user excels in
  study_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create AI insights table
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('study_plan', 'performance', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB, -- Additional structured data
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_plans
CREATE POLICY "Users can manage their own study plans" 
ON public.study_plans 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for daily_study_goals
CREATE POLICY "Users can manage their daily goals" 
ON public.daily_study_goals 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.study_plans WHERE id = study_plan_id
  )
);

-- Create RLS policies for mock_tests
CREATE POLICY "Anyone can view active mock tests" 
ON public.mock_tests 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Content creators can manage mock tests" 
ON public.mock_tests 
FOR ALL 
USING (has_role(auth.uid(), 'content_creator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for mock_test_sessions
CREATE POLICY "Users can manage their own mock test sessions" 
ON public.mock_test_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can update analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update existing analytics" 
ON public.user_analytics 
FOR UPDATE 
USING (true);

-- Create RLS policies for ai_insights
CREATE POLICY "Users can view their own insights" 
ON public.ai_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their insights acknowledgment" 
ON public.ai_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create insights" 
ON public.ai_insights 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX idx_daily_study_goals_study_plan_date ON public.daily_study_goals(study_plan_id, date);
CREATE INDEX idx_mock_test_sessions_user_id ON public.mock_test_sessions(user_id);
CREATE INDEX idx_user_analytics_user_date ON public.user_analytics(user_id, date);
CREATE INDEX idx_ai_insights_user_type ON public.ai_insights(user_id, insight_type);

-- Create function to update analytics
CREATE OR REPLACE FUNCTION public.update_user_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update daily analytics when a practice session is completed
  INSERT INTO public.user_analytics (
    user_id, 
    date, 
    questions_attempted, 
    questions_correct, 
    time_spent_minutes
  )
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CEIL(NEW.time_taken_seconds / 60.0)
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    questions_attempted = user_analytics.questions_attempted + 1,
    questions_correct = user_analytics.questions_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    time_spent_minutes = user_analytics.time_spent_minutes + CEIL(NEW.time_taken_seconds / 60.0),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Create trigger for analytics
CREATE TRIGGER update_analytics_on_practice
AFTER INSERT ON public.practice_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_analytics();

-- Create function to generate AI study recommendations
CREATE OR REPLACE FUNCTION public.generate_study_recommendations(target_user_id UUID)
RETURNS TABLE (
  recommendation_type TEXT,
  title TEXT,
  description TEXT,
  priority TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_performance RECORD;
  weak_subjects TEXT[];
BEGIN
  -- Get user's recent performance
  SELECT 
    AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) as accuracy,
    COUNT(*) as total_questions,
    EXTRACT(DAYS FROM (CURRENT_DATE - MAX(attempted_at::date))) as days_since_last_practice
  INTO user_performance
  FROM public.practice_sessions 
  WHERE user_id = target_user_id 
    AND attempted_at >= CURRENT_DATE - INTERVAL '7 days';
    
  -- Generate recommendations based on performance
  IF user_performance.days_since_last_practice > 2 THEN
    RETURN QUERY SELECT 
      'consistency'::TEXT,
      'Improve Study Consistency'::TEXT,
      'You haven''t practiced in ' || user_performance.days_since_last_practice || ' days. Regular practice is key to success!'::TEXT,
      'high'::TEXT;
  END IF;
  
  IF user_performance.accuracy < 0.6 THEN
    RETURN QUERY SELECT 
      'difficulty'::TEXT,
      'Focus on Fundamentals'::TEXT,
      'Your accuracy is below 60%. Consider reviewing basic concepts before attempting harder questions.'::TEXT,
      'high'::TEXT;
  END IF;
  
  IF user_performance.total_questions < 10 THEN
    RETURN QUERY SELECT 
      'volume'::TEXT,
      'Increase Practice Volume'::TEXT,
      'Try to solve at least 20 questions daily for better preparation.'::TEXT,
      'medium'::TEXT;
  END IF;
  
  RETURN;
END;
$$;