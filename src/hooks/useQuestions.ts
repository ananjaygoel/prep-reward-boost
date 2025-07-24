import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Question {
  id: string;
  question_text: string;
  question_type: 'single_correct' | 'multiple_correct' | 'numerical' | 'assertion_reason';
  difficulty: 'easy' | 'medium' | 'hard';
  options: any[];
  correct_answer: any;
  explanation: string;
  solution_steps: string;
  points: number;
  time_limit_seconds: number;
  year_appeared: number | null;
  topic: {
    id: string;
    name: string;
    subject: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface QuestionFilters {
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  year?: number;
}

export const useQuestions = (filters: QuestionFilters = {}) => {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select(`
          *,
          topic:topics(
            id,
            name,
            subject:subjects(
              id,
              name,
              code
            )
          )
        `)
        .eq('is_active', true);
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      if (filters.year) {
        query = query.eq('year_appeared', filters.year);
      }
      
      if (filters.topic) {
        query = query.eq('topic_id', filters.topic);
      }
      
      // Note: Subject filtering would need a join or separate query
      // This is simplified for now
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Question[];
    },
  });
};

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      questionId,
      userAnswer,
      isCorrect,
      timeTaken,
      pointsEarned,
    }: {
      questionId: string;
      userAnswer: any;
      isCorrect: boolean;
      timeTaken: number;
      pointsEarned: number;
    }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          question_id: questionId,
          user_answer: userAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken,
          points_earned: pointsEarned,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // TODO: Update user profile points when function is created
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
    },
  });
};