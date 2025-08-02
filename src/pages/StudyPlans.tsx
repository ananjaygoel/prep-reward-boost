import React, { useState } from 'react';
import { useStudyPlans, useDailyGoals } from '@/hooks/useStudyPlans';
import { useAIInsights, useGenerateInsights, useAcknowledgeInsight } from '@/hooks/useAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { StudyPlanCard } from '@/components/StudyPlans/StudyPlanCard';
import { WeeklySchedule } from '@/components/StudyPlans/WeeklySchedule';
import { CreatePlanDialog } from '@/components/StudyPlans/CreatePlanDialog';
import { TrendingUp, Lightbulb, CheckCircle, Brain, Target, Plus } from 'lucide-react';

const StudyPlans: React.FC = () => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
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
            <p className="text-muted-foreground">Personalized adaptive learning paths for JEE success</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleGenerateInsights} disabled={generateInsightsMutation.isPending}>
              <Brain className="h-4 w-4 mr-2" />
              {generateInsightsMutation.isPending ? 'Generating...' : 'Generate AI Insights'}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Study Plan
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

        {/* Study Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyPlans?.map((plan) => (
            <StudyPlanCard
              key={plan.id}
              plan={plan}
              onSelect={setSelectedPlan}
              isSelected={selectedPlan === plan.id}
              onStart={(plan) => {
                // TODO: Navigate to practice page with plan context
                toast({
                  title: 'Starting Study Session',
                  description: `Starting focused study for ${plan.title}`,
                });
              }}
            />
          ))}
        </div>

        {/* Weekly Schedule for Selected Plan */}
        {selectedPlan && dailyGoals && (
          <WeeklySchedule 
            goals={dailyGoals}
            onStartStudy={(goal) => {
              // TODO: Navigate to practice page with daily goal context
              toast({
                title: 'Starting Daily Goal',
                description: `Starting study session for ${new Date(goal.date).toLocaleDateString()}`,
              });
            }}
          />
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
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        )}

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