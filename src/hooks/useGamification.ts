import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  condition_type: string;
  condition_value: number;
  is_hidden: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target_value: number;
  challenge_type: string;
  points_reward: number;
  date: string;
  is_active: boolean;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
  challenge: DailyChallenge;
}

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  experience_points: number;
  points_to_next_level: number;
  updated_at: string;
}

export const useAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Using existing user_rewards table for now
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAvailableAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['available-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Using existing rewards table for now
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_required', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useDailyChallenges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['daily-challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Mock data for now until tables are created
      return [
        {
          id: '1',
          user_id: user.id,
          challenge_id: '1',
          current_progress: 3,
          is_completed: false,
          completed_at: null,
          challenge: {
            id: '1',
            title: 'Answer 5 Questions',
            description: 'Solve 5 practice questions today',
            target_value: 5,
            challenge_type: 'questions_answered',
            points_reward: 50,
            date: new Date().toISOString().split('T')[0],
            is_active: true
          }
        }
      ];
    },
    enabled: !!user,
  });
};

export const useUserLevel = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Mock data based on user profile points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();
      
      const points = profile?.total_points || 0;
      const level = Math.floor(points / 1000) + 1;
      const currentLevelPoints = points % 1000;
      const pointsToNext = 1000 - currentLevelPoints;
      
      return {
        id: '1',
        user_id: user.id,
        current_level: level,
        experience_points: currentLevelPoints,
        points_to_next_level: pointsToNext,
        updated_at: new Date().toISOString()
      };
    },
    enabled: !!user,
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, total_points')
        .order('total_points', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      if (!user) throw new Error('No user');
      
      // Mock implementation for now
      return { challengeId, progress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-level'] });
    },
  });
};