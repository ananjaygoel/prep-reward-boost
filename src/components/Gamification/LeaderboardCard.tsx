import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Zap } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useGamification';

export const LeaderboardCard = () => {
  const { data: leaderboard, isLoading } = useLeaderboard();

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return 'default' as const;
      case 1:
      case 2:
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard?.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>
              
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user.profiles?.full_name?.charAt(0) || user.profiles?.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.profiles?.full_name || user.profiles?.username || 'Anonymous'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Level {user.current_level}</span>
                  <Badge variant={getRankBadgeVariant(index)} className="text-xs px-1.5 py-0">
                    <Zap className="h-3 w-3 mr-1" />
                    {user.total_xp}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          
          {!leaderboard?.length && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No rankings yet</p>
              <p className="text-xs">Start practicing to see your rank!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};