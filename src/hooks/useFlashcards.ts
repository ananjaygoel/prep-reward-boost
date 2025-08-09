import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Flashcard {
  id: string;
  user_id: string;
  study_plan_id: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  last_reviewed_at: string | null;
  next_review_at: string;
  repetitions: number;
  ease_factor: number;
  interval: number;
  created_at: string;
}

// Hook to get all flashcards for a study plan
export const useFlashcards = (studyPlanId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['flashcards', studyPlanId],
    queryFn: async () => {
      if (!user || !studyPlanId) return [];

      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .eq('study_plan_id', studyPlanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!user && !!studyPlanId,
  });
};

// Hook to create a new flashcard
export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newCard: Omit<Flashcard, 'id' | 'user_id' | 'created_at' | 'last_reviewed_at' | 'next_review_at' | 'repetitions' | 'ease_factor' | 'interval'> & { study_plan_id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcards')
        .insert([
          {
            ...newCard,
            user_id: user.id,
            last_reviewed_at: null,
            next_review_at: new Date().toISOString(),
            repetitions: 0,
            ease_factor: 2.5,
            interval: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Flashcard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', data.study_plan_id] });
    },
  });
};

// Hook to update a flashcard after review
export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedCard: Partial<Flashcard> & { id: string }) => {
      const { id, ...updateData } = updatedCard;
      const { data, error } = await supabase
        .from('flashcards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Flashcard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', data.study_plan_id] });
    },
  });
};

// Hook to delete a flashcard
export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // We don't know the study_plan_id here, so we invalidate all flashcards queries
      // A better approach might be to pass it during the mutation call
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
};
