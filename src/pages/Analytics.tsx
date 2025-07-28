import React, { useState } from 'react';
import { useUserAnalytics, usePerformanceSummary } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Clock, Award, Brain, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<number>(30);
  
  const { data: analytics, isLoading } = useUserAnalytics(timeRange);
  const { data: summary } = usePerformanceSummary();

  const formatChartData = () => {
    if (!analytics) return [];
    
    return analytics
      .slice(0, 30)
      .reverse()
      .map((day) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: day.questions_attempted > 0 ? (day.questions_correct / day.questions_attempted) * 100 : 0,
        questions: day.questions_attempted,
        time: day.time_spent_minutes,
      }));
  };

  const getSubjectChartData = () => {
    if (!summary?.subjectPerformance) return [];
    
    return Object.entries(summary.subjectPerformance).map(([subject, data]: [string, any]) => ({
      subject,
      accuracy: data.accuracy,
      attempted: data.attempted,
      correct: data.correct,
    }));
  };

  const getDifficultyChartData = () => {
    if (!summary?.difficultyPerformance) return [];
    
    return Object.entries(summary.difficultyPerformance).map(([difficulty, data]: [string, any]) => ({
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      accuracy: data.accuracy,
      attempted: data.attempted,
    }));
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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
            <h1 className="text-3xl font-bold text-gradient">Performance Analytics</h1>
            <p className="text-muted-foreground">Deep insights into your learning patterns and progress</p>
          </div>
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalQuestions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary?.correctAnswers || 0} correct answers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.accuracy.toFixed(1) || 0}%</div>
              <Progress value={summary?.accuracy || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(summary?.totalTime || 0)}min</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Math.round(summary?.averageTimePerDay || 0)}min/day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.currentStreak || 0}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Progress</CardTitle>
                  <CardDescription>Questions attempted over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="questions" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Trend</CardTitle>
                  <CardDescription>Daily accuracy percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                  <CardDescription>Accuracy by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSubjectChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Questions Distribution</CardTitle>
                  <CardDescription>Questions attempted by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getSubjectChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ subject, attempted }) => `${subject}: ${attempted}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="attempted"
                      >
                        {getSubjectChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Subject Details */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Analysis</CardTitle>
                <CardDescription>Detailed breakdown by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getSubjectChartData().map((subject) => (
                    <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div>
                          <h3 className="font-medium">{subject.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.attempted} questions attempted • {subject.correct} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{subject.accuracy.toFixed(1)}%</div>
                        <Progress value={subject.accuracy} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="difficulty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Difficulty-wise Performance</CardTitle>
                <CardDescription>Your performance across different difficulty levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getDifficultyChartData().map((level) => (
                    <div key={level.difficulty} className="text-center p-6 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">{level.difficulty}</h3>
                      <div className="text-3xl font-bold mb-2">{level.accuracy.toFixed(1)}%</div>
                      <Progress value={level.accuracy} className="mb-2" />
                      <p className="text-sm text-muted-foreground">{level.attempted} questions</p>
                      <Badge 
                        variant={level.accuracy >= 80 ? 'default' : level.accuracy >= 60 ? 'secondary' : 'destructive'}
                        className="mt-2"
                      >
                        {level.accuracy >= 80 ? 'Excellent' : level.accuracy >= 60 ? 'Good' : 'Needs Work'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Time Trends</CardTitle>
                <CardDescription>Daily study time over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="time" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;