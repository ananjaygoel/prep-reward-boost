import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, TrendingUp } from 'lucide-react';
import { useUserLevel } from '@/hooks/useGamification';

const LevelProgress = () => {
  const { data: userLevel, isLoading } = useUserLevel();

  if (isLoading || !userLevel) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = ((userLevel.experience_points / (userLevel.experience_points + userLevel.points_to_next_level)) * 100);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Star className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-sm">
                Level {userLevel.current_level}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {userLevel.experience_points} XP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {userLevel.points_to_next_level} to go
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Next level at {userLevel.experience_points + userLevel.points_to_next_level} XP</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgress;