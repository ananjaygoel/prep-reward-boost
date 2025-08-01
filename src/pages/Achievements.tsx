import Navbar from '@/components/Layout/Navbar';
import { AchievementCard } from '@/components/Gamification/AchievementCard';
import { LevelDisplay } from '@/components/Gamification/LevelDisplay';
import { DailyChallengeCard } from '@/components/Gamification/DailyChallengeCard';
import { LeaderboardCard } from '@/components/Gamification/LeaderboardCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Target, BookOpen, Flame, Clock } from 'lucide-react';
import { 
  useAchievements, 
  useUserAchievements, 
  useUserLevel,
  useDailyChallenge,
  useUserChallengeProgress
} from '@/hooks/useGamification';

const categoryIcons = {
  practice: BookOpen,
  streak: Flame,
  accuracy: Target,
  speed: Clock,
  social: Trophy,
};

export const Achievements = () => {
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: userAchievements, isLoading: userAchievementsLoading } = useUserAchievements();
  const { data: userLevel, isLoading: levelLoading } = useUserLevel();
  const { data: dailyChallenge } = useDailyChallenge();
  const { data: challengeProgress } = useUserChallengeProgress();

  const getUserAchievement = (achievementId: string) => {
    return userAchievements?.find(ua => ua.achievement_id === achievementId);
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements?.filter(a => a.category === category) || [];
  };

  const categories = achievements ? [...new Set(achievements.map(a => a.category))] : [];

  if (achievementsLoading || userAchievementsLoading || levelLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-10 w-48" />
              <div className="grid gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Achievements</h1>
            </div>

            {dailyChallenge && (
              <DailyChallengeCard 
                challenge={dailyChallenge} 
                progress={challengeProgress || undefined} 
              />
            )}

            <Tabs defaultValue={categories[0]} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                {categories.map((category) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Trophy;
                  return (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="capitalize hidden sm:inline">{category}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid gap-4">
                    {getAchievementsByCategory(category).map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        userAchievement={getUserAchievement(achievement.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="space-y-6">
            {userLevel && <LevelDisplay userLevel={userLevel} />}
            
            <LeaderboardCard />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {userAchievements?.filter(ua => ua.is_completed).length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {userLevel?.total_xp || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">Level {userLevel?.current_level || 1}</div>
                  <div className="text-xs text-muted-foreground">
                    {userLevel?.xp_for_next_level || 0} XP to next level
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};