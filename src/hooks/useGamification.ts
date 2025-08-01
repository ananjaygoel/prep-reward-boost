import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  condition_type: string;
  condition_value: number;
  points_reward: number;
  badge_color: string;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  is_completed: boolean;
  achievement?: Achievement;
}

export interface DailyChallenge {
  id: string;
  date: string;
  challenge_type: string;
  target_value: number;
  subject_filter?: string;
  difficulty_filter?: string;
  points_reward: number;
  bonus_points: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  points_earned: number;
  created_at: string;
  challenge?: DailyChallenge;
}

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  total_xp: number;
  xp_for_next_level: number;
  level_rewards_claimed: string[];
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  current_level: number;
  total_xp: number;
  profiles: {
    username: string;
    full_name: string;
  };
}

// Achievements hooks
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });
};

export const useUserAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user,
  });
};

// Daily challenges hooks
export const useDailyChallenge = () => {
  return useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyChallenge | null;
    },
  });
};

export const useUserChallengeProgress = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-challenge-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select(`
          *,
          challenge:daily_challenges(*)
        `)
        .eq('user_id', user.id)
        .eq('challenge.date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserChallengeProgress | null;
    },
    enabled: !!user,
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: progress,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenge-progress'] });
    },
  });
};

// User level hooks
export const useUserLevel = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // If no level record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('user_levels')
            .insert({
              user_id: user.id,
              current_level: 1,
              total_xp: 0,
              xp_for_next_level: 100,
            })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newData as UserLevel;
        }
        throw error;
      }
      
      return data as UserLevel;
    },
    enabled: !!user,
  });
};

// Leaderboard hook
export const useLeaderboard = (timeFrame: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  return useQuery({
    queryKey: ['leaderboard', timeFrame],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_levels')
        .select(`
          id,
          current_level,
          total_xp,
          profiles!inner(username, full_name)
        `)
        .order('total_xp', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as any[];
    },
  });
};