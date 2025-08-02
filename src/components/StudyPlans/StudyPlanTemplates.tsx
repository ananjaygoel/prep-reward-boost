import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateStudyPlan } from '@/hooks/useStudyPlans';
import { useToast } from '@/hooks/use-toast';
import { Clock, Target, BookOpen, Star, Zap, Trophy, Calendar } from 'lucide-react';

interface StudyPlanTemplate {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  subjects: Array<{ subject: string; weightage: number; topics: string[] }>;
  daily_goals: {
    questions_per_day: number;
    study_hours: number;
  };
  features: string[];
  recommended_for: string[];
  popularity: number;
}

const STUDY_PLAN_TEMPLATES: StudyPlanTemplate[] = [
  {
    id: 'jee-main-intensive',
    title: 'JEE Main Intensive',
    description: 'Comprehensive 20-week plan for JEE Main preparation with balanced subject coverage',
    duration_weeks: 20,
    difficulty_level: 'intermediate',
    subjects: [
      { 
        subject: 'Physics', 
        weightage: 35, 
        topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Modern Physics'] 
      },
      { 
        subject: 'Chemistry', 
        weightage: 30, 
        topics: ['Organic', 'Inorganic', 'Physical Chemistry'] 
      },
      { 
        subject: 'Mathematics', 
        weightage: 35, 
        topics: ['Calculus', 'Algebra', 'Coordinate Geometry', 'Trigonometry'] 
      }
    ],
    daily_goals: {
      questions_per_day: 30,
      study_hours: 6
    },
    features: ['Daily practice tests', 'Weekly assessments', 'Revision cycles', 'Performance analytics'],
    recommended_for: ['12th grade students', 'Dropper students', 'Serious aspirants'],
    popularity: 95
  },
  {
    id: 'jee-advanced-elite',
    title: 'JEE Advanced Elite',
    description: 'Advanced 16-week program for JEE Advanced with focus on complex problem solving',
    duration_weeks: 16,
    difficulty_level: 'advanced',
    subjects: [
      { 
        subject: 'Physics', 
        weightage: 40, 
        topics: ['Advanced Mechanics', 'Electromagnetism', 'Quantum Physics'] 
      },
      { 
        subject: 'Chemistry', 
        weightage: 30, 
        topics: ['Advanced Organic', 'Coordination Chemistry', 'Thermochemistry'] 
      },
      { 
        subject: 'Mathematics', 
        weightage: 30, 
        topics: ['Differential Calculus', 'Vector Algebra', 'Complex Numbers'] 
      }
    ],
    daily_goals: {
      questions_per_day: 25,
      study_hours: 8
    },
    features: ['Advanced problem sets', 'IIT-level questions', 'Mentor guidance', 'Peer discussions'],
    recommended_for: ['JEE Main qualified', 'Top rankers', 'IIT aspirants'],
    popularity: 88
  },
  {
    id: 'foundation-builder',
    title: 'Foundation Builder',
    description: 'Perfect for beginners starting JEE preparation with strong fundamentals',
    duration_weeks: 24,
    difficulty_level: 'beginner',
    subjects: [
      { 
        subject: 'Physics', 
        weightage: 33, 
        topics: ['Basic Mechanics', 'Heat & Temperature', 'Light & Sound'] 
      },
      { 
        subject: 'Chemistry', 
        weightage: 34, 
        topics: ['Basic Concepts', 'Periodic Table', 'Chemical Bonding'] 
      },
      { 
        subject: 'Mathematics', 
        weightage: 33, 
        topics: ['Functions', 'Basic Calculus', 'Coordinate Geometry'] 
      }
    ],
    daily_goals: {
      questions_per_day: 20,
      study_hours: 4
    },
    features: ['Concept building', 'Basic to advanced progression', 'Video explanations', 'Practice worksheets'],
    recommended_for: ['11th grade students', 'New to JEE', 'Concept clarity needed'],
    popularity: 82
  },
  {
    id: 'last-month-rush',
    title: 'Last Month Rush',
    description: 'Intensive 4-week revision plan for last-minute preparation',
    duration_weeks: 4,
    difficulty_level: 'intermediate',
    subjects: [
      { 
        subject: 'Physics', 
        weightage: 35, 
        topics: ['Important Formulas', 'Previous Years', 'Quick Concepts'] 
      },
      { 
        subject: 'Chemistry', 
        weightage: 30, 
        topics: ['Reactions', 'Important Topics', 'Memory Tricks'] 
      },
      { 
        subject: 'Mathematics', 
        weightage: 35, 
        topics: ['Formula Sheet', 'Shortcuts', 'Quick Methods'] 
      }
    ],
    daily_goals: {
      questions_per_day: 50,
      study_hours: 10
    },
    features: ['Rapid revision', 'Formula sheets', 'Mock tests daily', 'Stress management'],
    recommended_for: ['Last month candidates', 'Quick revision needed', 'Exam in 1 month'],
    popularity: 76
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Flexible plan for working students with limited weekday time',
    duration_weeks: 32,
    difficulty_level: 'intermediate',
    subjects: [
      { 
        subject: 'Physics', 
        weightage: 33, 
        topics: ['Core Topics', 'Weekend Deep Dives', 'Quick Reviews'] 
      },
      { 
        subject: 'Chemistry', 
        weightage: 34, 
        topics: ['Memory Based', 'Weekend Practice', 'Quick Facts'] 
      },
      { 
        subject: 'Mathematics', 
        weightage: 33, 
        topics: ['Problem Solving', 'Weekend Sessions', 'Quick Formulas'] 
      }
    ],
    daily_goals: {
      questions_per_day: 15,
      study_hours: 3
    },
    features: ['Flexible scheduling', 'Weekend focus', 'Mobile friendly', 'Quick sessions'],
    recommended_for: ['Working students', 'Limited time', 'Weekend focused'],
    popularity: 71
  },
  {
    id: 'revision-master',
    title: 'Revision Master',
    description: 'Spaced repetition based 12-week revision plan for retention',
    duration_weeks: 12,
    difficulty_level: 'intermediate',
    subjects: [
      { 
        subject: 'Physics', 
        weightage: 33, 
        topics: ['Revision Cycles', 'Memory Techniques', 'Quick Tests'] 
      },
      { 
        subject: 'Chemistry', 
        weightage: 34, 
        topics: ['Spaced Practice', 'Memory Palace', 'Quick Recalls'] 
      },
      { 
        subject: 'Mathematics', 
        weightage: 33, 
        topics: ['Formula Revision', 'Method Practice', 'Quick Solving'] 
      }
    ],
    daily_goals: {
      questions_per_day: 35,
      study_hours: 5
    },
    features: ['Spaced repetition', 'Memory techniques', 'Adaptive revision', 'Performance tracking'],
    recommended_for: ['Pre-exam phase', 'Revision focused', 'Memory improvement'],
    popularity: 84
  }
];

interface StudyPlanTemplatesProps {
  onTemplateSelect: (template: StudyPlanTemplate) => void;
}

export const StudyPlanTemplates: React.FC<StudyPlanTemplatesProps> = ({ onTemplateSelect }) => {
  const createPlanMutation = useCreateStudyPlan();
  const { toast } = useToast();

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <BookOpen className="h-4 w-4" />;
      case 'intermediate': return <Target className="h-4 w-4" />;
      case 'advanced': return <Trophy className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUseTemplate = async (template: StudyPlanTemplate) => {
    try {
      await createPlanMutation.mutateAsync({
        title: template.title,
        description: template.description,
        difficulty_level: template.difficulty_level,
        total_weeks: template.duration_weeks,
        subjects: template.subjects.map(s => ({
          subject: s.subject,
          weightage: s.weightage
        }))
      });
      
      toast({
        title: 'Template Applied!',
        description: `Created study plan from "${template.title}" template`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create plan from template',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Choose Your Study Plan</h2>
        <p className="text-muted-foreground">Select a pre-designed template or create your own custom plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STUDY_PLAN_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden">
            {/* Popularity indicator */}
            {template.popularity > 80 && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge className={getDifficultyColor(template.difficulty_level)}>
                  {getDifficultyIcon(template.difficulty_level)}
                  <span className="ml-1 capitalize">{template.difficulty_level}</span>
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {template.duration_weeks}w
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Daily Goals */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Daily Goals</div>
                <div className="flex justify-between text-sm">
                  <span>{template.daily_goals.questions_per_day} questions/day</span>
                  <span>{template.daily_goals.study_hours}h study time</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Subjects</div>
                <div className="flex flex-wrap gap-1">
                  {template.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject.subject} ({subject.weightage}%)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Key Features</div>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended for */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Recommended for</div>
                <div className="flex flex-wrap gap-1">
                  {template.recommended_for.slice(0, 2).map((rec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => handleUseTemplate(template)}
                  disabled={createPlanMutation.isPending}
                  className="flex-1"
                >
                  {createPlanMutation.isPending ? 'Creating...' : 'Use Template'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onTemplateSelect(template)}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};