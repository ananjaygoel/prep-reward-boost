-- Fix the generate_study_recommendations function
CREATE OR REPLACE FUNCTION public.generate_study_recommendations(target_user_id uuid)
 RETURNS TABLE(recommendation_type text, title text, description text, priority text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_performance RECORD;
  weak_subjects TEXT[];
BEGIN
  -- Get user's recent performance
  SELECT 
    AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) as accuracy,
    COUNT(*) as total_questions,
    COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(attempted_at::date))), 999) as days_since_last_practice
  INTO user_performance
  FROM public.practice_sessions 
  WHERE user_id = target_user_id 
    AND attempted_at >= CURRENT_DATE - INTERVAL '7 days';
    
  -- Handle case where no recent practice sessions exist
  IF user_performance.total_questions = 0 OR user_performance.total_questions IS NULL THEN
    user_performance.days_since_last_practice := 999;
    user_performance.accuracy := 0;
    user_performance.total_questions := 0;
  END IF;
    
  -- Generate recommendations based on performance
  IF user_performance.days_since_last_practice > 2 THEN
    RETURN QUERY SELECT 
      'consistency'::TEXT,
      'Improve Study Consistency'::TEXT,
      CASE 
        WHEN user_performance.days_since_last_practice >= 999 THEN 'Start your practice journey! Regular practice is key to success.'
        ELSE 'You haven''t practiced in ' || user_performance.days_since_last_practice || ' days. Regular practice is key to success!'
      END::TEXT,
      'high'::TEXT;
  END IF;
  
  IF user_performance.accuracy < 0.6 AND user_performance.total_questions > 0 THEN
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
  
  -- Always provide at least one recommendation for new users
  IF user_performance.total_questions = 0 THEN
    RETURN QUERY SELECT 
      'getting_started'::TEXT,
      'Welcome to JEE Prep!'::TEXT,
      'Start with some practice questions to get personalized insights and study recommendations.'::TEXT,
      'medium'::TEXT;
  END IF;
  
  RETURN;
END;
$function$;