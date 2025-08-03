import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Clock, Book, Award, Calendar, Activity } from 'lucide-react';

interface SubjectProgress {
  name: string;
  completed: number;
  total: number;
  accuracy: number;
  timeSpent: number;
  weeklyProgress: number[];
}

interface WeeklyData {
  week: string;
  studyHours: number;
  questionsAttempted: number;
  accuracy: number;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  fullMark: number;
}

const mockSubjectProgress: SubjectProgress[] = [
  {
    name: 'Physics',
    completed: 145,
    total: 200,
    accuracy: 78,
    timeSpent: 45,
    weeklyProgress: [12, 15, 18, 22, 25, 28, 32]
  },
  {
    name: 'Chemistry',
    completed: 120,
    total: 180,
    accuracy: 82,
    timeSpent: 38,
    weeklyProgress: [10, 14, 19, 24, 28, 30, 35]
  },
  {
    name: 'Mathematics',
    completed: 180,
    total: 220,
    accuracy: 85,
    timeSpent: 52,
    weeklyProgress: [15, 20, 25, 30, 35, 40, 45]
  }
];

const mockWeeklyData: WeeklyData[] = [
  { week: 'W1', studyHours: 25, questionsAttempted: 150, accuracy: 75 },
  { week: 'W2', studyHours: 30, questionsAttempted: 180, accuracy: 78 },
  { week: 'W3', studyHours: 28, questionsAttempted: 165, accuracy: 80 },
  { week: 'W4', studyHours: 35, questionsAttempted: 200, accuracy: 82 },
  { week: 'W5', studyHours: 32, questionsAttempted: 185, accuracy: 84 },
  { week: 'W6', studyHours: 38, questionsAttempted: 220, accuracy: 86 },
  { week: 'W7', studyHours: 40, questionsAttempted: 245, accuracy: 88 }
];

const mockRadarData: SubjectPerformance[] = [
  { subject: 'Physics', score: 78, fullMark: 100 },
  { subject: 'Chemistry', score: 82, fullMark: 100 },
  { subject: 'Mathematics', score: 85, fullMark: 100 },
  { subject: 'English', score: 72, fullMark: 100 },
  { subject: 'Biology', score: 68, fullMark: 100 }
];

const pieData = [
  { name: 'Mathematics', value: 35, color: '#3b82f6' },
  { name: 'Physics', value: 28, color: '#ef4444' },
  { name: 'Chemistry', value: 25, color: '#22c55e' },
  { name: 'Others', value: 12, color: '#f59e0b' }
];

export const ProgressDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const totalStudyTime = mockSubjectProgress.reduce((sum, subject) => sum + subject.timeSpent, 0);
  const totalQuestions = mockSubjectProgress.reduce((sum, subject) => sum + subject.completed, 0);
  const overallAccuracy = Math.round(mockSubjectProgress.reduce((sum, subject) => sum + subject.accuracy, 0) / mockSubjectProgress.length);
  const completionRate = Math.round((mockSubjectProgress.reduce((sum, subject) => sum + (subject.completed / subject.total * 100), 0)) / mockSubjectProgress.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Progress Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive view of your study progress and performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </Button>
          <Button
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold">{totalStudyTime}h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12% this week</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions Solved</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+8% this week</span>
                </div>
              </div>
              <Book className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{overallAccuracy}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+3% this week</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+5% this week</span>
                </div>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Study Time */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Study Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="studyHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <div className="grid gap-4">
            {mockSubjectProgress.map((subject, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subject.completed} / {subject.total} questions completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{subject.accuracy}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{subject.timeSpent}h</p>
                          <p className="text-xs text-muted-foreground">Time Spent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((subject.completed / subject.total) * 100)}%</span>
                    </div>
                    <Progress value={(subject.completed / subject.total) * 100} />
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Weekly Progress</p>
                    <div className="flex items-end gap-1 h-16">
                      {subject.weeklyProgress.map((progress, idx) => (
                        <div
                          key={idx}
                          className="bg-primary flex-1 rounded-t"
                          style={{ height: `${(progress / Math.max(...subject.weeklyProgress)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Questions Attempted */}
            <Card>
              <CardHeader>
                <CardTitle>Questions Attempted</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="questionsAttempted"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRadarData.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant={subject.score >= 80 ? 'default' : subject.score >= 60 ? 'secondary' : 'destructive'}>
                        {subject.score}%
                      </Badge>
                    </div>
                    <Progress value={subject.score} />
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Focus more on Biology - lowest performance</li>
                    <li>• Maintain strong performance in Mathematics</li>
                    <li>• Increase practice frequency in English</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};