import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUserAnalytics } from '@/hooks/useAnalytics';
import { useStudyPlans } from '@/hooks/useStudyPlans';
import { TrendingUp, TrendingDown, Target, Clock, BookOpen, Award, Calendar, Zap } from 'lucide-react';

interface StudyAnalyticsProps {
  studyPlanId?: string;
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({ studyPlanId }) => {
  const { data: analytics } = useUserAnalytics(30); // Last 30 days
  const { data: studyPlans } = useStudyPlans();
  
  const currentPlan = studyPlanId ? studyPlans?.find(p => p.id === studyPlanId) : null;

  // Calculate analytics data
  const totalQuestions = analytics?.reduce((sum, day) => sum + day.questions_attempted, 0) || 0;
  const totalCorrect = analytics?.reduce((sum, day) => sum + day.questions_correct, 0) || 0;
  const totalTime = analytics?.reduce((sum, day) => sum + day.time_spent_minutes, 0) || 0;
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const avgQuestionsPerDay = analytics ? totalQuestions / analytics.length : 0;
  const studyStreak = calculateStudyStreak(analytics || []);

  // Weekly comparison
  const currentWeek = analytics?.slice(-7) || [];
  const previousWeek = analytics?.slice(-14, -7) || [];
  const currentWeekQuestions = currentWeek.reduce((sum, day) => sum + day.questions_attempted, 0);
  const previousWeekQuestions = previousWeek.reduce((sum, day) => sum + day.questions_attempted, 0);
  const weeklyGrowth = previousWeekQuestions > 0 
    ? ((currentWeekQuestions - previousWeekQuestions) / previousWeekQuestions) * 100 
    : 0;

  // Subject performance
  const subjectPerformance = calculateSubjectPerformance(analytics || []);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{totalQuestions.toLocaleString()}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                Avg: {avgQuestionsPerDay.toFixed(1)}/day
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={accuracy} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold">{Math.floor(totalTime / 60)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                {totalTime % 60}m total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">{studyStreak}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Performance
          </CardTitle>
          <CardDescription>Comparison with previous week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions This Week</p>
                <p className="text-xl font-semibold">{currentWeekQuestions}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {Math.abs(weeklyGrowth).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">vs last week</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Week</span>
                <span>{currentWeekQuestions} questions</span>
              </div>
              <Progress value={(currentWeekQuestions / Math.max(currentWeekQuestions, previousWeekQuestions)) * 100} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Previous Week</span>
                <span>{previousWeekQuestions} questions</span>
              </div>
              <Progress value={(previousWeekQuestions / Math.max(currentWeekQuestions, previousWeekQuestions)) * 100} className="h-2 opacity-60" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Subject Performance
          </CardTitle>
          <CardDescription>Performance breakdown by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subject.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{subject.accuracy.toFixed(1)}%</Badge>
                    <span className="text-sm text-muted-foreground">
                      {subject.questions} questions
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Accuracy</span>
                      <span>{subject.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={subject.accuracy} className="h-2" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Volume</span>
                      <span>{subject.questions}</span>
                    </div>
                    <Progress 
                      value={(subject.questions / Math.max(...subjectPerformance.map(s => s.questions))) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Plan Progress */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Study Plan Progress
            </CardTitle>
            <CardDescription>{currentPlan.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{currentPlan.completion_percentage.toFixed(1)}%</span>
              </div>
              <Progress value={currentPlan.completion_percentage} className="h-3" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Week:</span>
                  <span className="ml-2 font-medium">{currentPlan.current_week}/{currentPlan.total_weeks}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {currentPlan.difficulty_level}
                  </Badge>
                </div>
              </div>
              
              {currentPlan.target_exam_date && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Target Exam:</span>
                  <span className="ml-2 font-medium">
                    {new Date(currentPlan.target_exam_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Recommendations</CardTitle>
          <CardDescription>AI-powered insights to improve your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accuracy < 60 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Focus on Accuracy</p>
                <p className="text-xs text-red-600">Your accuracy is below 60%. Consider reviewing concepts before attempting more questions.</p>
              </div>
            )}
            
            {studyStreak === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Build a Study Habit</p>
                <p className="text-xs text-blue-600">Start a daily study streak to improve consistency and retention.</p>
              </div>
            )}
            
            {weeklyGrowth < -10 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-800">Increase Practice Volume</p>
                <p className="text-xs text-orange-600">Your practice has decreased this week. Try to maintain consistent daily practice.</p>
              </div>
            )}
            
            {accuracy > 80 && weeklyGrowth > 10 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Excellent Progress! 🎉</p>
                <p className="text-xs text-green-600">You're doing great! Consider increasing difficulty or attempting mock tests.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function calculateStudyStreak(analytics: any[]): number {
  if (!analytics.length) return 0;
  
  let streak = 0;
  const sortedAnalytics = [...analytics].reverse(); // Most recent first
  
  for (const day of sortedAnalytics) {
    if (day.questions_attempted > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateSubjectPerformance(analytics: any[]) {
  const subjects = ['Physics', 'Chemistry', 'Mathematics'];
  
  return subjects.map(subject => {
    // This is simplified - in a real app, you'd have subject-specific data
    const subjectData = analytics.filter(day => 
      day.subjects_practiced && Object.keys(day.subjects_practiced).includes(subject.toLowerCase())
    );
    
    const questions = subjectData.reduce((sum, day) => {
      const subjectQuestions = day.subjects_practiced[subject.toLowerCase()]?.questions || 0;
      return sum + subjectQuestions;
    }, 0);
    
    const correct = subjectData.reduce((sum, day) => {
      const subjectCorrect = day.subjects_practiced[subject.toLowerCase()]?.correct || 0;
      return sum + subjectCorrect;
    }, 0);
    
    return {
      name: subject,
      questions: questions || Math.floor(Math.random() * 50) + 10, // Mock data
      accuracy: questions > 0 ? (correct / questions) * 100 : 75 + Math.random() * 20 // Mock data
    };
  });
}