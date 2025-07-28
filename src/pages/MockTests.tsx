import React, { useState } from 'react';
import { useMockTests, useMockTestSessions, useStartMockTest, useCreateMockTest } from '@/hooks/useMockTests';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Award, 
  Target, 
  BookOpen, 
  Play, 
  Trophy, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

const MockTestCard: React.FC<{ test: any; onStart: (id: string) => void }> = ({ test, onStart }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {test.title}
        </CardTitle>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {test.duration_minutes} minutes
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            {test.total_marks} marks
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Question Distribution:</div>
          <div className="flex flex-wrap gap-2">
            {test.question_distribution && Object.entries(test.question_distribution).map(([subject, count]: [string, any]) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}: {count}
              </Badge>
            ))}
          </div>
        </div>
        
        {test.is_full_length && (
          <Badge className="bg-gradient-primary text-primary-foreground">
            Full Length Test
          </Badge>
        )}
        
        <Button 
          onClick={() => onStart(test.id)} 
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Test
        </Button>
      </CardContent>
    </Card>
  );
};

const MockTestSessionCard: React.FC<{ session: any }> = ({ session }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{session.mock_test?.title}</span>
          <Badge 
            variant={session.status === 'completed' ? 'default' : 
                    session.status === 'in_progress' ? 'secondary' : 'destructive'}
          >
            {session.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
            {session.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
            {session.status === 'abandoned' && <AlertCircle className="h-3 w-3 mr-1" />}
            {session.status.replace('_', ' ')}
          </Badge>
        </CardTitle>
        <CardDescription>
          Started: {new Date(session.start_time).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.status === 'completed' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{session.total_score}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{session.accuracy_percentage?.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
            
            {session.rank && (
              <div className="flex items-center justify-between p-3 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Rank: #{session.rank}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {session.percentile?.toFixed(1)}th percentile
                </div>
              </div>
            )}
            
            {session.subject_scores && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Subject-wise Scores:</div>
                {Object.entries(session.subject_scores).map(([subject, scores]: [string, any]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <span className="text-sm">{subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{scores.score}</span>
                      <Progress value={(scores.correct / scores.attempted) * 100} className="w-16 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {session.status === 'in_progress' && (
          <Button 
            onClick={() => navigate(`/mock-test/${session.id}`)}
            className="w-full"
          >
            Continue Test
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const MockTests: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isContentCreator, isAdmin } = useUserRoles();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: mockTests, isLoading } = useMockTests();
  const { data: sessions } = useMockTestSessions();
  const startTestMutation = useStartMockTest();
  const createTestMutation = useCreateMockTest();

  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    duration_minutes: 180,
    total_marks: 300,
    is_full_length: true,
    question_distribution: { physics: 30, chemistry: 30, mathematics: 30 },
    difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
  });

  const handleStartTest = async (testId: string) => {
    try {
      const result = await startTestMutation.mutateAsync(testId);
      navigate(`/mock-test/${result.session.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start mock test',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTest = async () => {
    try {
      await createTestMutation.mutateAsync(newTest);
      toast({
        title: 'Success',
        description: 'Mock test created successfully!',
      });
      setShowCreateForm(false);
      setNewTest({
        title: '',
        description: '',
        duration_minutes: 180,
        total_marks: 300,
        is_full_length: true,
        question_distribution: { physics: 30, chemistry: 30, mathematics: 30 },
        difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create mock test',
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
            <h1 className="text-3xl font-bold text-gradient">Mock Tests</h1>
            <p className="text-muted-foreground">Full JEE simulation experience with real-time analytics</p>
          </div>
          {(isContentCreator || isAdmin) && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mock Test
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Mock Test</DialogTitle>
                  <DialogDescription>
                    Design a comprehensive mock test for JEE preparation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label htmlFor="title">Test Title</Label>
                    <Input
                      id="title"
                      value={newTest.title}
                      onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                      placeholder="e.g., JEE Mains Mock Test 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTest.description}
                      onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                      placeholder="Test description and instructions"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newTest.duration_minutes}
                        onChange={(e) => setNewTest({ ...newTest, duration_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="marks">Total Marks</Label>
                      <Input
                        id="marks"
                        type="number"
                        value={newTest.total_marks}
                        onChange={(e) => setNewTest({ ...newTest, total_marks: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Question Distribution</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <Label htmlFor="physics" className="text-xs">Physics</Label>
                        <Input
                          id="physics"
                          type="number"
                          value={newTest.question_distribution.physics}
                          onChange={(e) => setNewTest({
                            ...newTest,
                            question_distribution: {
                              ...newTest.question_distribution,
                              physics: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chemistry" className="text-xs">Chemistry</Label>
                        <Input
                          id="chemistry"
                          type="number"
                          value={newTest.question_distribution.chemistry}
                          onChange={(e) => setNewTest({
                            ...newTest,
                            question_distribution: {
                              ...newTest.question_distribution,
                              chemistry: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="math" className="text-xs">Mathematics</Label>
                        <Input
                          id="math"
                          type="number"
                          value={newTest.question_distribution.mathematics}
                          onChange={(e) => setNewTest({
                            ...newTest,
                            question_distribution: {
                              ...newTest.question_distribution,
                              mathematics: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTest} disabled={createTestMutation.isPending}>
                    {createTestMutation.isPending ? 'Creating...' : 'Create Test'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="history">My Results</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTests?.map((test) => (
                <MockTestCard 
                  key={test.id} 
                  test={test} 
                  onStart={handleStartTest}
                />
              ))}
            </div>
            
            {(!mockTests || mockTests.length === 0) && (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Mock Tests Available</h3>
                  <p className="text-muted-foreground">
                    Mock tests will appear here once they are created by content creators.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {sessions && sessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map((session) => (
                  <MockTestSessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Test History</h3>
                  <p className="text-muted-foreground mb-4">
                    Take your first mock test to see your results and track your progress.
                  </p>
                  <Button onClick={() => {
                    // Switch to available tests tab
                    const availableTab = document.querySelector('[value="available"]') as HTMLElement;
                    availableTab?.click();
                  }}>
                    Browse Available Tests
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MockTests;