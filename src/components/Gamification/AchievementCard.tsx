import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, BookOpen, Crown, Flame, Zap, Clock } from 'lucide-react';
import type { Achievement, UserAchievement } from '@/hooks/useGamification';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  progress?: number;
}

const getIcon = (iconName: string) => {
  const icons = {
    Trophy,
    Target,
    BookOpen,
    Crown,
    Flame,
    Zap,
    Clock,
  };
  
  const IconComponent = icons[iconName as keyof typeof icons] || Trophy;
  return IconComponent;
};

export const AchievementCard = ({ achievement, userAchievement, progress = 0 }: AchievementCardProps) => {
  const Icon = getIcon(achievement.icon);
  const isCompleted = userAchievement?.is_completed || false;
  const currentProgress = userAchievement?.progress || progress;
  const progressPercentage = Math.min((currentProgress / achievement.condition_value) * 100, 100);

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'bg-primary/5 border-primary/20' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted'}`}
            style={{ backgroundColor: isCompleted ? `${achievement.badge_color}20` : undefined }}
          >
            <Icon 
              className={`h-5 w-5 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}
              style={{ color: isCompleted ? achievement.badge_color : undefined }}
            />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{achievement.name}</h4>
              {isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  +{achievement.points_reward} XP
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            
            {!isCompleted && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{currentProgress}/{achievement.condition_value}</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            )}
            
            {isCompleted && userAchievement?.earned_at && (
              <p className="text-xs text-muted-foreground">
                Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};