import React, { useState } from 'react';
import { useStudyPlans, useCreateStudyPlan, useDailyGoals } from '@/hooks/useStudyPlans';
import { useAIInsights, useGenerateInsights, useAcknowledgeInsight } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Calendar, Target, TrendingUp, Lightbulb, CheckCircle, Clock, Brain } from 'lucide-react';

const StudyPlans: React.FC = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const { data: studyPlans, isLoading } = useStudyPlans();
  const { data: dailyGoals } = useDailyGoals(selectedPlan);
  const { data: aiInsights } = useAIInsights();
  
  const createPlanMutation = useCreateStudyPlan();
  const generateInsightsMutation = useGenerateInsights();
  const acknowledgeInsightMutation = useAcknowledgeInsight();

  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    difficulty_level: 'intermediate' as const,
    target_exam_date: '',
    total_weeks: 12,
  });

  const handleCreatePlan = async () => {
    try {
      await createPlanMutation.mutateAsync({
        ...newPlan,
        subjects: [
          { subject: 'Physics', weightage: 33.33 },
          { subject: 'Chemistry', weightage: 33.33 },
          { subject: 'Mathematics', weightage: 33.34 },
        ],
      });
      
      toast({
        title: 'Success',
        description: 'Study plan created successfully!',
      });
      
      setShowCreateForm(false);
      setNewPlan({
        title: '',
        description: '',
        difficulty_level: 'intermediate',
        target_exam_date: '',
        total_weeks: 12,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create study plan',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateInsights = async () => {
    try {
      await generateInsightsMutation.mutateAsync();
      toast({
        title: 'Success',
        description: 'AI insights generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate insights',
        variant: 'destructive',
      });
    }
  };

  const handleAcknowledgeInsight = async (insightId: string) => {
    try {
      await acknowledgeInsightMutation.mutateAsync(insightId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge insight',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">AI Study Plans</h1>
            <p className="text-muted-foreground">Personalized adaptive learning paths for JEE success</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleGenerateInsights} disabled={generateInsightsMutation.isPending}>
              <Brain className="h-4 w-4 mr-2" />
              {generateInsightsMutation.isPending ? 'Generating...' : 'Generate AI Insights'}
            </Button>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Create Study Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Study Plan</DialogTitle>
                  <DialogDescription>
                    Design a personalized study plan tailored to your goals.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Plan Title</Label>
                    <Input
                      id="title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                      placeholder="e.g., JEE Mains 2024 Preparation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                      placeholder="Brief description of your goals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={newPlan.difficulty_level}
                      onValueChange={(value: any) => setNewPlan({ ...newPlan, difficulty_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exam-date">Target Exam Date</Label>
                    <Input
                      id="exam-date"
                      type="date"
                      value={newPlan.target_exam_date}
                      onChange={(e) => setNewPlan({ ...newPlan, target_exam_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeks">Study Duration (weeks)</Label>
                    <Input
                      id="weeks"
                      type="number"
                      value={newPlan.total_weeks}
                      onChange={(e) => setNewPlan({ ...newPlan, total_weeks: parseInt(e.target.value) })}
                      min="1"
                      max="52"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
                    {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && aiInsights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">AI Insights & Recommendations</h2>
            <div className="grid gap-4">
              {aiInsights.map((insight) => (
                <Alert key={insight.id} className={
                  insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                  insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{insight.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.priority === 'high' ? 'destructive' : 
                                   insight.priority === 'medium' ? 'default' : 'secondary'}>
                        {insight.priority}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcknowledgeInsight(insight.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertTitle>
                  <AlertDescription>{insight.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Study Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyPlans?.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedPlan(plan.id)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {plan.title}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{plan.completion_percentage.toFixed(1)}%</span>
                </div>
                <Progress value={plan.completion_percentage} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Week {plan.current_week} of {plan.total_weeks}
                  </div>
                  <Badge variant={plan.difficulty_level === 'advanced' ? 'destructive' : 
                                plan.difficulty_level === 'intermediate' ? 'default' : 'secondary'}>
                    {plan.difficulty_level}
                  </Badge>
                </div>
                
                {plan.target_exam_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Target: {new Date(plan.target_exam_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Goals for Selected Plan */}
        {selectedPlan && dailyGoals && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Study Goals</CardTitle>
              <CardDescription>Track your daily progress and targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {dailyGoals?.slice(0, 7).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4" />
                          Questions: {goal.completed_questions}/{goal.target_questions}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          Time: {goal.time_spent_minutes}/{goal.target_time_minutes}min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(goal.completed_questions / goal.target_questions) * 100} 
                        className="w-20 h-2" 
                      />
                      {goal.is_completed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!studyPlans || studyPlans.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Study Plans Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI-powered study plan to get started with personalized learning.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudyPlans;