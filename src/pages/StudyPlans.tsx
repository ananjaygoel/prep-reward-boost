import React, { useState } from 'react';
import { useStudyPlans, useDailyGoals } from '@/hooks/useStudyPlans';
import { useAIInsights, useGenerateInsights, useAcknowledgeInsight } from '@/hooks/useAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { StudyPlanCard } from '@/components/StudyPlans/StudyPlanCard';
import { WeeklySchedule } from '@/components/StudyPlans/WeeklySchedule';
import { CreatePlanDialog } from '@/components/StudyPlans/CreatePlanDialog';
import { StudyPlanTemplates } from '@/components/StudyPlans/StudyPlanTemplates';
import { StudySessionTimer } from '@/components/StudyPlans/StudySessionTimer';
import { StudyAnalytics } from '@/components/StudyPlans/StudyAnalytics';
import { RevisionScheduler } from '@/components/StudyPlans/RevisionScheduler';
import { NotesManager } from '@/components/StudyPlans/NotesManager';
import { FlashcardsSystem } from '@/components/StudyPlans/FlashcardsSystem';
import { StudyCalendar } from '@/components/StudyPlans/StudyCalendar';
import { ProgressDashboard } from '@/components/StudyPlans/ProgressDashboard';
import { StudyHistory } from '@/components/StudyPlans/StudyHistory';
import { TrendingUp, Lightbulb, CheckCircle, Brain, Plus, Timer, BarChart3, RefreshCw, Zap, StickyNote, Zap as FlashIcon, Calendar as CalendarIcon, TrendingUp as ProgressIcon, History } from 'lucide-react';

const StudyPlans: React.FC = () => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [activeTab, setActiveTab] = useState('plans');
  
  const { data: studyPlans, isLoading } = useStudyPlans();
  const { data: dailyGoals } = useDailyGoals(selectedPlan);
  const { data: aiInsights } = useAIInsights();
  
  const generateInsightsMutation = useGenerateInsights();
  const acknowledgeInsightMutation = useAcknowledgeInsight();

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
            <p className="text-muted-foreground">Comprehensive study management with analytics and revision tracking</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerateInsights} disabled={generateInsightsMutation.isPending}>
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-11 overflow-x-auto">
            <TabsTrigger value="templates" className="flex items-center gap-2 whitespace-nowrap">
              <Zap className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              My Plans
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center gap-2 whitespace-nowrap">
              <Timer className="h-4 w-4" />
              Study Timer
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="revision" className="flex items-center gap-2 whitespace-nowrap">
              <RefreshCw className="h-4 w-4" />
              Revision
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2 whitespace-nowrap">
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2 whitespace-nowrap">
              <FlashIcon className="h-4 w-4" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 whitespace-nowrap">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 whitespace-nowrap">
              <ProgressIcon className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 whitespace-nowrap">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <StudyPlanTemplates onTemplateSelect={(template) => {
              toast({
                title: 'Template Selected',
                description: `You can customize the "${template.title}" template before creating your plan.`,
              });
              setShowCreateDialog(true);
            }} />
          </TabsContent>

          {/* My Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyPlans?.map((plan) => (
                <StudyPlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={setSelectedPlan}
                  isSelected={selectedPlan === plan.id}
                  onStart={(plan) => {
                    setActiveTab('timer');
                    toast({
                      title: 'Starting Study Session',
                      description: `Starting focused study for ${plan.title}`,
                    });
                  }}
                />
              ))}
            </div>

            {/* Empty State for Plans */}
            {(!studyPlans || studyPlans.length === 0) && (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Study Plans Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first AI-powered study plan to get started with personalized learning.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setActiveTab('templates')}>
                      Browse Templates
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                      Create Custom Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Study Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <StudySessionTimer
                studyPlanId={selectedPlan}
                onSessionComplete={(duration, questions) => {
                  toast({
                    title: 'Session Complete! 🎉',
                    description: `You studied for ${Math.floor(duration / 60)} minutes and solved ${questions} questions.`,
                  });
                }}
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <StudyAnalytics studyPlanId={selectedPlan} />
          </TabsContent>

          {/* Revision Tab */}
          <TabsContent value="revision" className="space-y-6">
            <RevisionScheduler studyPlanId={selectedPlan} />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {selectedPlan && dailyGoals ? (
              <WeeklySchedule 
                goals={dailyGoals}
                onStartStudy={(goal) => {
                  setActiveTab('timer');
                  toast({
                    title: 'Starting Daily Goal',
                    description: `Starting study session for ${new Date(goal.date).toLocaleDateString()}`,
                  });
                }}
              />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Study Plan Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a study plan to view your weekly schedule and daily goals.
                  </p>
                  <Button onClick={() => setActiveTab('plans')}>
                    View My Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <NotesManager />
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-6">
            <FlashcardsSystem />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <StudyCalendar />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressDashboard />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <StudyHistory />
          </TabsContent>
        </Tabs>

        {/* Create Plan Dialog */}
        <CreatePlanDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </div>
  );
};

export default StudyPlans;