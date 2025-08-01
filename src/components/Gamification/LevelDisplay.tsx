import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Zap } from 'lucide-react';
import type { UserLevel } from '@/hooks/useGamification';

interface LevelDisplayProps {
  userLevel: UserLevel;
  compact?: boolean;
}

export const LevelDisplay = ({ userLevel, compact = false }: LevelDisplayProps) => {
  const xpProgress = userLevel.xp_for_next_level > 0 
    ? ((userLevel.total_xp) / (userLevel.total_xp + userLevel.xp_for_next_level)) * 100
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
          <Star className="h-3 w-3 text-primary fill-primary" />
          <span className="text-xs font-semibold text-primary">Level {userLevel.current_level}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>{userLevel.total_xp} XP</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary fill-primary" />
          Level {userLevel.current_level}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Experience Points</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {userLevel.total_xp} XP
          </Badge>
        </div>
        
        {userLevel.xp_for_next_level > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {userLevel.current_level + 1}</span>
              <span>{userLevel.xp_for_next_level} XP needed</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          {userLevel.xp_for_next_level > 0 
            ? `You're ${userLevel.xp_for_next_level} XP away from the next level!`
            : 'You\'ve reached the maximum level!'
          }
        </div>
      </CardContent>
    </Card>
  );
};