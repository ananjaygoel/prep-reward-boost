import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Target, BookOpen, Search, Filter, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface StudySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  subject: string;
  topic: string;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  averageTimePerQuestion: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  sessionType: 'practice' | 'revision' | 'mock_test' | 'timed_practice';
  pointsEarned: number;
  weakTopics: string[];
  strongTopics: string[];
  notes?: string;
}

const mockSessions: StudySession[] = [
  {
    id: '1',
    date: '2024-01-16',
    startTime: '09:00',
    endTime: '11:30',
    duration: 150,
    subject: 'Physics',
    topic: 'Mechanics',
    questionsAttempted: 25,
    questionsCorrect: 19,
    accuracy: 76,
    averageTimePerQuestion: 6,
    difficulty: 'medium',
    sessionType: 'practice',
    pointsEarned: 190,
    weakTopics: ['Rotational Motion', 'Work-Energy Theorem'],
    strongTopics: ['Newton\'s Laws', 'Projectile Motion'],
    notes: 'Need to practice more rotational motion problems'
  },
  {
    id: '2',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    subject: 'Mathematics',
    topic: 'Calculus',
    questionsAttempted: 30,
    questionsCorrect: 26,
    accuracy: 87,
    averageTimePerQuestion: 4,
    difficulty: 'hard',
    sessionType: 'timed_practice',
    pointsEarned: 260,
    weakTopics: ['Integration by Parts'],
    strongTopics: ['Differentiation', 'Chain Rule', 'Limits'],
    notes: 'Excellent session, focus maintained throughout'
  },
  {
    id: '3',
    date: '2024-01-14',
    startTime: '10:00',
    endTime: '13:00',
    duration: 180,
    subject: 'Chemistry',
    topic: 'Full Syllabus',
    questionsAttempted: 60,
    questionsCorrect: 42,
    accuracy: 70,
    averageTimePerQuestion: 3,
    difficulty: 'mixed',
    sessionType: 'mock_test',
    pointsEarned: 420,
    weakTopics: ['Organic Mechanisms', 'Electrochemistry'],
    strongTopics: ['Atomic Structure', 'Periodic Table'],
    notes: 'Mock test - need improvement in organic chemistry'
  },
  {
    id: '4',
    date: '2024-01-13',
    startTime: '16:00',
    endTime: '17:30',
    duration: 90,
    subject: 'Physics',
    topic: 'Thermodynamics',
    questionsAttempted: 18,
    questionsCorrect: 15,
    accuracy: 83,
    averageTimePerQuestion: 5,
    difficulty: 'medium',
    sessionType: 'revision',
    pointsEarned: 150,
    weakTopics: ['Heat Engines'],
    strongTopics: ['First Law', 'Second Law'],
    notes: 'Good revision session'
  },
  {
    id: '5',
    date: '2024-01-12',
    startTime: '09:30',
    endTime: '12:00',
    duration: 150,
    subject: 'Mathematics',
    topic: 'Algebra',
    questionsAttempted: 35,
    questionsCorrect: 31,
    accuracy: 89,
    averageTimePerQuestion: 4.3,
    difficulty: 'easy',
    sessionType: 'practice',
    pointsEarned: 310,
    weakTopics: ['Complex Numbers'],
    strongTopics: ['Quadratic Equations', 'Sequences & Series'],
    notes: 'Solid fundamentals, confident in algebra'
  }
];

export const StudyHistory: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>(mockSessions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  const subjects = ['all', ...Array.from(new Set(sessions.map(s => s.subject)))];
  const sessionTypes = ['all', 'practice', 'revision', 'mock_test', 'timed_practice'];

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || session.subject === selectedSubject;
    const matchesType = selectedSessionType === 'all' || session.sessionType === selectedSessionType;
    return matchesSearch && matchesSubject && matchesType;
  });

  // Calculate statistics
  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalPoints = sessions.reduce((sum, s) => sum + s.pointsEarned, 0);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return 'bg-blue-500';
      case 'revision': return 'bg-yellow-500';
      case 'mock_test': return 'bg-red-500';
      case 'timed_practice': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'secondary';
      case 'medium': return 'default';
      case 'hard': return 'destructive';
      case 'mixed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Study History</h2>
          <p className="text-muted-foreground">Track your study sessions and progress over time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.round(totalStudyTime / 60)}h</p>
            <p className="text-sm text-muted-foreground">Study Time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalQuestions}</p>
            <p className="text-sm text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{overallAccuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-6 w-6 bg-yellow-500 rounded mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 border rounded-md min-w-[120px]"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject === 'all' ? 'All Subjects' : subject}
            </option>
          ))}
        </select>
        
        <select
          value={selectedSessionType}
          onChange={(e) => setSelectedSessionType(e.target.value)}
          className="px-3 py-2 border rounded-md min-w-[140px]"
        >
          {sessionTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredSessions.map(session => (
              <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getSessionTypeColor(session.sessionType)} text-white`}>
                        {session.sessionType === 'practice' && <BookOpen className="h-4 w-4" />}
                        {session.sessionType === 'revision' && <Clock className="h-4 w-4" />}
                        {session.sessionType === 'mock_test' && <Target className="h-4 w-4" />}
                        {session.sessionType === 'timed_practice' && <Calendar className="h-4 w-4" />}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{session.subject} - {session.topic}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{session.date}</span>
                          <span>{session.startTime} - {session.endTime}</span>
                          <span>{session.duration} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{session.questionsCorrect}/{session.questionsAttempted}</p>
                        <p className="text-sm text-muted-foreground">{session.accuracy}% accuracy</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant={getDifficultyColor(session.difficulty)}>
                          {session.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {session.sessionType.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary">
                          +{session.pointsEarned} pts
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid gap-6">
            {filteredSessions.map(session => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${getSessionTypeColor(session.sessionType)} text-white`}>
                        {session.sessionType === 'practice' && <BookOpen className="h-4 w-4" />}
                        {session.sessionType === 'revision' && <Clock className="h-4 w-4" />}
                        {session.sessionType === 'mock_test' && <Target className="h-4 w-4" />}
                        {session.sessionType === 'timed_practice' && <Calendar className="h-4 w-4" />}
                      </div>
                      {session.subject} - {session.topic}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {session.sessionType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{session.duration}</p>
                      <p className="text-sm text-muted-foreground">Minutes</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{session.questionsAttempted}</p>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{session.accuracy}%</p>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{session.pointsEarned}</p>
                      <p className="text-sm text-muted-foreground">Points</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Weak Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {session.weakTopics.map((topic, idx) => (
                          <Badge key={idx} variant="destructive">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Strong Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {session.strongTopics.map((topic, idx) => (
                          <Badge key={idx} variant="default">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                        {session.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredSessions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Sessions Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedSubject !== 'all' || selectedSessionType !== 'all'
                ? 'No sessions match your search criteria'
                : 'Start studying to build your session history'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};