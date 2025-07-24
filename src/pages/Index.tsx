import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/Layout/Navbar';
import StatsCard from '@/components/Dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  Zap, 
  TrendingUp,
  ChevronRight,
  Star,
  Calendar,
  Award
} from 'lucide-react';

const Index = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to conquer JEE {profile?.target_year}? Let's practice some questions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Points"
            value={profile?.total_points || 0}
            description="Points earned from practice"
            icon={Trophy}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Current Streak"
            value={`${profile?.streak_days || 0} days`}
            description="Consecutive practice days"
            icon={Zap}
          />
          <StatsCard
            title="Target Year"
            value={profile?.target_year || 2025}
            description="JEE exam year"
            icon={Target}
          />
          <StatsCard
            title="Practice Sessions"
            value="0"
            description="Questions attempted today"
            icon={BookOpen}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Start Practice Session
              </CardTitle>
              <CardDescription>
                Jump into a practice session with questions tailored to your level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Easy
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Medium
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Hard
                </Button>
              </div>
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                Start Random Practice
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Your latest rewards and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <p className="font-medium">First Steps</p>
                    <p className="text-sm text-muted-foreground">Complete your first question!</p>
                  </div>
                  <Badge variant="secondary">+50 pts</Badge>
                </div>
                <Button variant="ghost" className="w-full justify-center">
                  View All Achievements
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Practice by Subject
            </CardTitle>
            <CardDescription>
              Choose your subject and start practicing specific topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-smooth"
              >
                <div className="text-2xl">⚛️</div>
                <span className="font-medium">Physics</span>
                <span className="text-xs text-muted-foreground">Mechanics, Optics, Modern Physics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-200 transition-smooth"
              >
                <div className="text-2xl">🧪</div>
                <span className="font-medium">Chemistry</span>
                <span className="text-xs text-muted-foreground">Organic, Inorganic, Physical</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-200 transition-smooth"
              >
                <div className="text-2xl">📐</div>
                <span className="font-medium">Mathematics</span>
                <span className="text-xs text-muted-foreground">Calculus, Algebra, Geometry</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
