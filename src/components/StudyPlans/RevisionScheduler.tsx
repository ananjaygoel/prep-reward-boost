import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, RefreshCw, BookOpen, Clock, Target, AlertCircle } from 'lucide-react';

interface RevisionItem {
  id: string;
  topic: string;
  subject: string;
  lastReviewed: Date;
  nextReview: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: number; // 0-100
  reviewCount: number;
  intervalDays: number;
}

interface RevisionSchedulerProps {
  studyPlanId?: string;
}

// Mock data for revision items
const REVISION_ITEMS: RevisionItem[] = [
  {
    id: '1',
    topic: 'Kinematics',
    subject: 'Physics',
    lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextReview: new Date(),
    difficulty: 'medium',
    masteryLevel: 75,
    reviewCount: 3,
    intervalDays: 4
  },
  {
    id: '2',
    topic: 'Organic Reactions',
    subject: 'Chemistry',
    lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    difficulty: 'hard',
    masteryLevel: 60,
    reviewCount: 2,
    intervalDays: 3
  },
  {
    id: '3',
    topic: 'Calculus Integration',
    subject: 'Mathematics',
    lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    difficulty: 'hard',
    masteryLevel: 45,
    reviewCount: 1,
    intervalDays: 2
  },
  {
    id: '4',
    topic: 'Thermodynamics',
    subject: 'Physics',
    lastReviewed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    difficulty: 'medium',
    masteryLevel: 85,
    reviewCount: 4,
    intervalDays: 7
  },
  {
    id: '5',
    topic: 'Coordinate Geometry',
    subject: 'Mathematics',
    lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    difficulty: 'easy',
    masteryLevel: 90,
    reviewCount: 5,
    intervalDays: 10
  }
];

export const RevisionScheduler: React.FC<RevisionSchedulerProps> = ({ studyPlanId }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize revision items
  const overdueItems = REVISION_ITEMS.filter(item => {
    const reviewDate = new Date(item.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate < today;
  });

  const todayItems = REVISION_ITEMS.filter(item => {
    const reviewDate = new Date(item.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate.getTime() === today.getTime();
  });

  const upcomingItems = REVISION_ITEMS.filter(item => {
    const reviewDate = new Date(item.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate > today;
  }).slice(0, 5);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'bg-blue-100 text-blue-800';
      case 'Chemistry': return 'bg-purple-100 text-purple-800';
      case 'Mathematics': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays > 0) return `In ${diffInDays} days`;
    return `${Math.abs(diffInDays)} days ago`;
  };

  const RevisionItemCard: React.FC<{ item: RevisionItem; isOverdue?: boolean }> = ({ item, isOverdue }) => (
    <div className={`p-4 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{item.topic}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getSubjectColor(item.subject)} variant="outline">
              {item.subject}
            </Badge>
            <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
              {item.difficulty}
            </Badge>
          </div>
        </div>
        
        {isOverdue && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Mastery Level</span>
          <span className="font-medium">{item.masteryLevel}%</span>
        </div>
        <Progress value={item.masteryLevel} className="h-1.5" />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Next review: {formatRelativeTime(item.nextReview)}</span>
          <span>#{item.reviewCount} review</span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1">
          <BookOpen className="h-3 w-3 mr-1" />
          Study
        </Button>
        <Button size="sm" variant="outline">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Reviews</p>
                <p className="text-2xl font-bold text-red-600">{overdueItems.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold text-blue-600">{todayItems.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Mastery</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(REVISION_ITEMS.reduce((sum, item) => sum + item.masteryLevel, 0) / REVISION_ITEMS.length)}%
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Items */}
      {overdueItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Overdue Reviews ({overdueItems.length})
            </CardTitle>
            <CardDescription>These topics need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {overdueItems.map(item => (
                <RevisionItemCard key={item.id} item={item} isOverdue={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Reviews ({todayItems.length})
          </CardTitle>
          <CardDescription>Topics scheduled for review today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayItems.length > 0 ? (
            <div className="grid gap-4">
              {todayItems.map(item => (
                <RevisionItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews scheduled for today!</p>
              <p className="text-sm">Great job staying on top of your revision schedule.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Reviews
          </CardTitle>
          <CardDescription>Next topics coming up for revision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {upcomingItems.map(item => (
              <RevisionItemCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revision Algorithm Info */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Spaced repetition algorithm for optimal retention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">High Mastery (80%+)</p>
                <p className="text-muted-foreground">Reviews spaced 7-14 days apart</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Medium Mastery (60-80%)</p>
                <p className="text-muted-foreground">Reviews spaced 3-7 days apart</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Low Mastery (&lt;60%)</p>
                <p className="text-muted-foreground">Reviews spaced 1-3 days apart</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};