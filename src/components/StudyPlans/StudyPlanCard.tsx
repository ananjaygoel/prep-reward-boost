import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/hooks/useStudyPlans';
import { BookOpen, Calendar, Target, Clock, Play, Edit } from 'lucide-react';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onSelect: (planId: string) => void;
  onEdit?: (plan: StudyPlan) => void;
  onStart?: (plan: StudyPlan) => void;
  isSelected?: boolean;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({
  plan,
  onSelect,
  onEdit,
  onStart,
  isSelected = false,
}) => {
  const difficultyColor = {
    beginner: 'secondary',
    intermediate: 'default',
    advanced: 'destructive',
  } as const;

  const timeRemaining = plan.target_exam_date 
    ? Math.ceil((new Date(plan.target_exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card 
      className={`hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={() => onSelect(plan.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              {plan.title}
            </CardTitle>
            <CardDescription className="mt-1">{plan.description}</CardDescription>
          </div>
          {plan.is_active && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{plan.completion_percentage.toFixed(0)}%</span>
          </div>
          <Progress value={plan.completion_percentage} className="h-2" />
        </div>
        
        {/* Week Progress */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Week {plan.current_week} of {plan.total_weeks}
          </div>
          <Badge variant={difficultyColor[plan.difficulty_level]}>
            {plan.difficulty_level}
          </Badge>
        </div>
        
        {/* Target Exam Date */}
        {plan.target_exam_date && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              Exam Date: {new Date(plan.target_exam_date).toLocaleDateString()}
            </div>
            {timeRemaining && (
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                <span className={timeRemaining < 30 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                  {timeRemaining}d left
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Subjects */}
        {plan.subjects && plan.subjects.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Subjects:</span>
            <div className="flex flex-wrap gap-1">
              {plan.subjects.map((subject: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {subject.subject || subject.name} 
                  {subject.weightage && ` (${subject.weightage.toFixed(0)}%)`}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onStart?.(plan);
            }}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Study
          </Button>
          {onEdit && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};