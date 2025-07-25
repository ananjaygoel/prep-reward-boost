import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  totalSessions: number;
  todaySessions: number;
  correctAnswers: number;
  totalPoints: number;
  averageTime: number;
  subjectBreakdown: {
    physics: number;
    chemistry: number;
    mathematics: number;
  };
}

export const useStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user) throw new Error('No user');
      
      // Get today's start time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Fetch practice sessions
      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          question:questions(
            topic:topics(
              subject:subjects(code)
            )
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const todaySessions = sessions?.filter(session => 
        new Date(session.attempted_at) >= today
      ) || [];
      
      const correctAnswers = sessions?.filter(session => session.is_correct).length || 0;
      const totalPoints = sessions?.reduce((sum, session) => sum + session.points_earned, 0) || 0;
      const totalTime = sessions?.reduce((sum, session) => sum + (session.time_taken_seconds || 0), 0) || 0;
      const averageTime = sessions?.length ? Math.round(totalTime / sessions.length) : 0;
      
      // Subject breakdown
      const subjectBreakdown = {
        physics: 0,
        chemistry: 0,
        mathematics: 0,
      };
      
      sessions?.forEach(session => {
        const subjectCode = session.question?.topic?.subject?.code?.toLowerCase();
        if (subjectCode === 'phy') subjectBreakdown.physics++;
        else if (subjectCode === 'chem') subjectBreakdown.chemistry++;
        else if (subjectCode === 'math') subjectBreakdown.mathematics++;
      });
      
      return {
        totalSessions: sessions?.length || 0,
        todaySessions: todaySessions.length,
        correctAnswers,
        totalPoints,
        averageTime,
        subjectBreakdown,
      };
    },
    enabled: !!user,
  });
};