import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Note {
  id: string;
  user_id: string;
  study_plan_id: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  tags: string[];
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

// Hook to get all notes for a study plan
export const useNotes = (studyPlanId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notes', studyPlanId],
    queryFn: async () => {
      if (!user || !studyPlanId) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('study_plan_id', studyPlanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user && !!studyPlanId,
  });
};

// Hook to create a new note
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newNote: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { study_plan_id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            ...newNote,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.study_plan_id] });
    },
  });
};

// Hook to update a note
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedNote: Partial<Note> & { id: string }) => {
      const { id, ...updateData } = updatedNote;
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.study_plan_id] });
    },
  });
};

// Hook to delete a note
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};
