import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_exam_date?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  subjects: any[];
  total_weeks: number;
  current_week: number;
  completion_percentage: number;
  ai_recommendations?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyStudyGoal {
  id: string;
  study_plan_id: string;
  date: string;
  target_questions: number;
  target_time_minutes: number;
  completed_questions: number;
  time_spent_minutes: number;
  subjects_focus: any[];
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useStudyPlans = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudyPlan[];
    },
    enabled: !!user,
  });
};

export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (planData: Partial<StudyPlan>) => {
      if (!user) throw new Error('No user');
      
      const insertData = {
        user_id: user.id,
        title: planData.title!,
        description: planData.description,
        target_exam_date: planData.target_exam_date,
        difficulty_level: planData.difficulty_level || 'intermediate',
        subjects: planData.subjects || [],
        total_weeks: planData.total_weeks || 12,
        current_week: planData.current_week || 1,
        completion_percentage: planData.completion_percentage || 0,
        ai_recommendations: planData.ai_recommendations,
        is_active: planData.is_active ?? true,
      };
      
      const { data, error } = await supabase
        .from('study_plans')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
    },
  });
};

export const useDailyGoals = (studyPlanId?: string) => {
  return useQuery({
    queryKey: ['daily-goals', studyPlanId],
    queryFn: async () => {
      if (!studyPlanId) return [];
      
      const { data, error } = await supabase
        .from('daily_study_goals')
        .select('*')
        .eq('study_plan_id', studyPlanId)
        .order('date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as DailyStudyGoal[];
    },
    enabled: !!studyPlanId,
  });
};

export const useUpdateDailyGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<DailyStudyGoal> }) => {
      const { data, error } = await supabase
        .from('daily_study_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-goals'] });
    },
  });
};