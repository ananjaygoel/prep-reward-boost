import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Calendar,
  Award,
  Medal,
  Crown
} from 'lucide-react';

const Achievements = () => {
  const { user } = useAuth();
  
  // Fetch user rewards
  const { data: userRewards } = useQuery({
    queryKey: ['user-rewards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all available rewards
  const { data: allRewards } = useQuery({
    queryKey: ['all-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('condition_value');
      
      if (error) throw error;
      return data;
    },
  });

  const earnedRewardIds = userRewards?.map(ur => ur.reward_id) || [];
  const unlockedRewards = allRewards?.filter(reward => earnedRewardIds.includes(reward.id)) || [];
  const lockedRewards = allRewards?.filter(reward => !earnedRewardIds.includes(reward.id)) || [];

  const getRewardIcon = (rewardName: string) => {
    if (rewardName.toLowerCase().includes('first')) return <Star className="h-6 w-6" />;
    if (rewardName.toLowerCase().includes('streak')) return <Zap className="h-6 w-6" />;
    if (rewardName.toLowerCase().includes('master')) return <Crown className="h-6 w-6" />;
    if (rewardName.toLowerCase().includes('champion')) return <Medal className="h-6 w-6" />;
    return <Trophy className="h-6 w-6" />;
  };

  const getRewardColor = (rewardName: string) => {
    if (rewardName.toLowerCase().includes('master') || rewardName.toLowerCase().includes('champion')) return 'text-yellow-500';
    if (rewardName.toLowerCase().includes('streak')) return 'text-blue-500';
    if (rewardName.toLowerCase().includes('first')) return 'text-green-500';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Achievements</h1>
          <p className="text-muted-foreground">
            Track your progress and unlock rewards as you master JEE preparation
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{unlockedRewards.length}</div>
                  <p className="text-sm text-muted-foreground">Achievements Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{allRewards?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {userRewards?.reduce((sum, ur) => sum + (ur.reward?.points_reward || 0), 0) || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Bonus Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Your achievement completion rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{unlockedRewards.length} / {allRewards?.length || 0}</span>
              </div>
              <Progress 
                value={allRewards?.length ? (unlockedRewards.length / allRewards.length) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Unlocked Achievements */}
        {unlockedRewards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Unlocked Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedRewards.map((reward) => {
                const userReward = userRewards?.find(ur => ur.reward_id === reward.id);
                return (
                  <Card key={reward.id} className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-green-100 dark:bg-green-900/50 rounded-full ${getRewardColor(reward.name)}`}>
                          {getRewardIcon(reward.name)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {reward.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              +{reward.points_reward} pts
                            </Badge>
                            {userReward && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(userReward.earned_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedRewards.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-muted-foreground" />
              Available Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedRewards.map((reward) => (
                <Card key={reward.id} className="border-muted bg-muted/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-full text-muted-foreground">
                        {getRewardIcon(reward.name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-muted-foreground">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {reward.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            +{reward.points_reward} pts
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {reward.condition_type === 'questions_correct' && `Answer ${reward.condition_value} questions correctly`}
                            {reward.condition_type === 'points_earned' && `Earn ${reward.condition_value} points`}
                            {reward.condition_type === 'streak_days' && `Maintain ${reward.condition_value} day streak`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!allRewards || allRewards.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Achievements Available</h3>
              <p className="text-muted-foreground">
                Start practicing questions to unlock your first achievements!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Achievements;