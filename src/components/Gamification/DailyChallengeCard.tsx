import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DailyChallenge, UserChallengeProgress } from '@/hooks/useGamification';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  progress?: UserChallengeProgress;
}

export const DailyChallengeCard = ({ challenge, progress }: DailyChallengeCardProps) => {
  const navigate = useNavigate();
  const isCompleted = progress?.is_completed || false;
  const currentProgress = progress?.current_progress || 0;
  const progressPercentage = Math.min((currentProgress / challenge.target_value) * 100, 100);

  const handleStartPractice = () => {
    navigate('/practice');
  };

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'bg-primary/5 border-primary/20' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Daily Challenge
          </div>
          {isCompleted && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Target: {challenge.target_value}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{currentProgress}/{challenge.target_value}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {challenge.points_reward} XP
            </Badge>
            {challenge.bonus_points > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                +{challenge.bonus_points} bonus
              </Badge>
            )}
          </div>
          
          {!isCompleted && (
            <Button size="sm" onClick={handleStartPractice}>
              Start Practice
            </Button>
          )}
        </div>
        
        {isCompleted && progress?.completed_at && (
          <div className="text-xs text-green-600 font-medium">
            ✅ Completed at {new Date(progress.completed_at).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};