import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserAnalytics {
  id: string;
  user_id: string;
  date: string;
  questions_attempted: number;
  questions_correct: number;
  time_spent_minutes: number;
  subjects_practiced: any;
  difficulty_performance: any;
  peak_performance_time?: string;
  weak_topics: any[];
  strong_topics: any[];
  study_streak: number;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: 'study_plan' | 'performance' | 'recommendation';
  title: string;
  description: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  is_acknowledged: boolean;
  expires_at?: string;
  created_at: string;
}

export const useUserAnalytics = (days: number = 30) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-analytics', user?.id, days],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as UserAnalytics[];
    },
    enabled: !!user,
  });
};

export const usePerformanceSummary = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['performance-summary', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Get last 7 days analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (analyticsError) throw analyticsError;
      
      // Get practice sessions for detailed analysis
      const { data: sessions, error: sessionsError } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          question:questions(
            difficulty,
            topic:topics(
              name,
              subject:subjects(name)
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('attempted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('attempted_at', { ascending: false });
      
      if (sessionsError) throw sessionsError;
      
      // Calculate summary metrics
      const totalQuestions = sessions?.length || 0;
      const correctAnswers = sessions?.filter(s => s.is_correct).length || 0;
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      const totalTime = analytics?.reduce((sum, day) => sum + day.time_spent_minutes, 0) || 0;
      const averageTimePerDay = analytics?.length > 0 ? totalTime / analytics.length : 0;
      
      // Subject-wise performance
      const subjectPerformance = sessions?.reduce((acc: any, session: any) => {
        const subject = session.question?.topic?.subject?.name || 'Unknown';
        if (!acc[subject]) {
          acc[subject] = { attempted: 0, correct: 0, accuracy: 0 };
        }
        acc[subject].attempted++;
        if (session.is_correct) acc[subject].correct++;
        acc[subject].accuracy = (acc[subject].correct / acc[subject].attempted) * 100;
        return acc;
      }, {}) || {};
      
      // Difficulty-wise performance
      const difficultyPerformance = sessions?.reduce((acc: any, session: any) => {
        const difficulty = session.question?.difficulty || 'unknown';
        if (!acc[difficulty]) {
          acc[difficulty] = { attempted: 0, correct: 0, accuracy: 0 };
        }
        acc[difficulty].attempted++;
        if (session.is_correct) acc[difficulty].correct++;
        acc[difficulty].accuracy = (acc[difficulty].correct / acc[difficulty].attempted) * 100;
        return acc;
      }, {}) || {};
      
      return {
        totalQuestions,
        correctAnswers,
        accuracy,
        totalTime,
        averageTimePerDay,
        subjectPerformance,
        difficultyPerformance,
        dailyAnalytics: analytics || [],
        currentStreak: analytics?.[0]?.study_streak || 0,
      };
    },
    enabled: !!user,
  });
};

export const useAIInsights = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ai-insights', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_acknowledged', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIInsight[];
    },
    enabled: !!user,
  });
};

export const useAcknowledgeInsight = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_acknowledged: true })
        .eq('id', insightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
  });
};

export const useGenerateInsights = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');
      
      // Call the database function to generate recommendations
      const { data, error } = await supabase
        .rpc('generate_study_recommendations', { target_user_id: user.id });
      
      if (error) throw error;
      
      // Insert the recommendations as AI insights
      const insights = data.map((rec: any) => ({
        user_id: user.id,
        insight_type: 'recommendation',
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        data: { recommendation_type: rec.recommendation_type },
      }));
      
      if (insights.length > 0) {
        const { error: insertError } = await supabase
          .from('ai_insights')
          .insert(insights);
        
        if (insertError) throw insertError;
      }
      
      return insights;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
  });
};