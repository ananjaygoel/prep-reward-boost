import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DailyStudyGoal } from '@/hooks/useStudyPlans';
import { Calendar, Clock, Target, CheckCircle, Play } from 'lucide-react';

interface WeeklyScheduleProps {
  goals: DailyStudyGoal[];
  onStartStudy?: (goal: DailyStudyGoal) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ goals, onStartStudy }) => {
  const today = new Date().toDateString();
  
  const getGoalStatus = (goal: DailyStudyGoal) => {
    if (goal.is_completed) return 'completed';
    if (new Date(goal.date).toDateString() === today) return 'today';
    if (new Date(goal.date) < new Date()) return 'missed';
    return 'upcoming';
  };

  const statusConfig = {
    completed: { 
      color: 'bg-green-50 border-green-200', 
      badge: 'bg-green-100 text-green-800',
      textColor: 'text-green-700'
    },
    today: { 
      color: 'bg-blue-50 border-blue-200', 
      badge: 'bg-blue-100 text-blue-800',
      textColor: 'text-blue-700'
    },
    missed: { 
      color: 'bg-red-50 border-red-200', 
      badge: 'bg-red-100 text-red-800',
      textColor: 'text-red-700'
    },
    upcoming: { 
      color: 'bg-gray-50 border-gray-200', 
      badge: 'bg-gray-100 text-gray-800',
      textColor: 'text-gray-700'
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Study Schedule
        </CardTitle>
        <CardDescription>Your daily study goals and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.slice(0, 7).map((goal) => {
            const status = getGoalStatus(goal);
            const config = statusConfig[status];
            const questionProgress = (goal.completed_questions / goal.target_questions) * 100;
            const timeProgress = (goal.time_spent_minutes / goal.target_time_minutes) * 100;
            
            return (
              <div 
                key={goal.id} 
                className={`p-4 rounded-lg border ${config.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[60px]">
                      <div className={`text-sm font-medium ${config.textColor}`}>
                        {new Date(goal.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(goal.date).toLocaleDateString('en-US', { 
                          weekday: 'short' 
                        })}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4" />
                          <span>Questions: {goal.completed_questions}/{goal.target_questions}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Time: {goal.time_spent_minutes}/{goal.target_time_minutes}min</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Questions:</span>
                          <Progress value={questionProgress} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground w-10">{questionProgress.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Time:</span>
                          <Progress value={timeProgress} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground w-10">{timeProgress.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={config.badge}>
                      {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {status === 'completed' ? 'Complete' : 
                       status === 'today' ? 'Today' :
                       status === 'missed' ? 'Missed' : 'Upcoming'}
                    </Badge>
                    
                    {status === 'today' && !goal.is_completed && onStartStudy && (
                      <Button 
                        size="sm" 
                        onClick={() => onStartStudy(goal)}
                        className="ml-2"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Subject Focus */}
                {goal.subjects_focus && Array.isArray(goal.subjects_focus) && goal.subjects_focus.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Focus:</span>
                    <div className="flex flex-wrap gap-1">
                      {goal.subjects_focus.map((subject: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof subject === 'string' ? subject : subject.name || subject.subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};