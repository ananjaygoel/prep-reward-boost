import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Timer, Target, Trophy } from 'lucide-react';

interface StudySessionTimerProps {
  studyPlanId?: string;
  goalId?: string;
  onSessionComplete?: (duration: number, questionsSolved: number) => void;
}

type SessionType = 'study' | 'break' | 'long-break';
type SessionState = 'idle' | 'running' | 'paused' | 'completed';

const POMODORO_SETTINGS = {
  study: 25 * 60, // 25 minutes
  break: 5 * 60,  // 5 minutes
  'long-break': 15 * 60, // 15 minutes
};

export const StudySessionTimer: React.FC<StudySessionTimerProps> = ({
  studyPlanId,
  goalId,
  onSessionComplete
}) => {
  const { toast } = useToast();
  
  const [sessionType, setSessionType] = useState<SessionType>('study');
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_SETTINGS.study);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [sessionState, timeRemaining]);

  const handleSessionComplete = () => {
    setSessionState('completed');
    
    if (sessionType === 'study') {
      setCompletedPomodoros(prev => prev + 1);
      setTotalStudyTime(prev => prev + POMODORO_SETTINGS.study);
      setCurrentStreak(prev => prev + 1);
      
      toast({
        title: '🎉 Study Session Complete!',
        description: `Great job! You've completed a ${POMODORO_SETTINGS.study / 60}-minute study session.`,
      });
      
      // Auto-start break after study session
      setTimeout(() => {
        const breakType = completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0 ? 'long-break' : 'break';
        startSession(breakType);
      }, 2000);
    } else {
      toast({
        title: '☕ Break Complete!',
        description: "Time to get back to studying! You've got this!",
      });
      
      // Auto-start study session after break
      setTimeout(() => {
        startSession('study');
      }, 2000);
    }
  };

  const startSession = (type: SessionType = sessionType) => {
    setSessionType(type);
    setTimeRemaining(POMODORO_SETTINGS[type]);
    setSessionState('running');
  };

  const pauseSession = () => {
    setSessionState('paused');
  };

  const resumeSession = () => {
    setSessionState('running');
  };

  const resetSession = () => {
    setSessionState('idle');
    setTimeRemaining(POMODORO_SETTINGS[sessionType]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'study': return <BookOpen className="h-5 w-5" />;
      case 'break': return <Coffee className="h-5 w-5" />;
      case 'long-break': return <Coffee className="h-5 w-5" />;
    }
  };

  const getSessionTitle = () => {
    switch (sessionType) {
      case 'study': return 'Study Session';
      case 'break': return 'Short Break';
      case 'long-break': return 'Long Break';
    }
  };

  const getProgressPercentage = () => {
    const totalTime = POMODORO_SETTINGS[sessionType];
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const handleQuestionSolved = () => {
    setQuestionsSolved(prev => prev + 1);
  };

  const handleEndSession = () => {
    if (onSessionComplete) {
      onSessionComplete(totalStudyTime, questionsSolved);
    }
    
    // Reset all state
    setSessionState('idle');
    setTimeRemaining(POMODORO_SETTINGS.study);
    setSessionType('study');
    setTotalStudyTime(0);
    setCompletedPomodoros(0);
    setQuestionsSolved(0);
    setCurrentStreak(0);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {getSessionIcon()}
          {getSessionTitle()}
        </CardTitle>
        <CardDescription>
          Pomodoro Technique for focused study sessions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="text-6xl font-mono font-bold text-primary">
            {formatTime(timeRemaining)}
          </div>
          
          <Progress 
            value={getProgressPercentage()} 
            className="h-3"
          />
          
          <div className="flex justify-center gap-2">
            <Badge variant={sessionType === 'study' ? 'default' : 'secondary'}>
              {sessionType === 'study' ? 'Studying' : 'Break Time'}
            </Badge>
            
            {sessionState === 'running' && (
              <Badge variant="outline" className="animate-pulse">
                <Timer className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* Session Controls */}
        <div className="flex justify-center gap-2">
          {sessionState === 'idle' && (
            <>
              <Button onClick={() => startSession('study')}>
                <Play className="h-4 w-4 mr-2" />
                Start Study
              </Button>
              <Button variant="outline" onClick={() => startSession('break')}>
                <Coffee className="h-4 w-4 mr-2" />
                Break
              </Button>
            </>
          )}
          
          {sessionState === 'running' && (
            <>
              <Button onClick={pauseSession} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={resetSession} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}
          
          {sessionState === 'paused' && (
            <>
              <Button onClick={resumeSession}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button onClick={resetSession} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}
          
          {sessionState === 'completed' && (
            <Button onClick={() => setSessionState('idle')}>
              Start Next Session
            </Button>
          )}
        </div>

        {/* Study Progress */}
        {sessionType === 'study' && sessionState === 'running' && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Questions Solved</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{questionsSolved}</span>
                <Button size="sm" onClick={handleQuestionSolved}>
                  <Target className="h-3 w-3 mr-1" />
                  +1
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Session Stats */}
        {(completedPomodoros > 0 || totalStudyTime > 0) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">{completedPomodoros}</div>
              <div className="text-xs text-muted-foreground">Pomodoros</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">{Math.floor(totalStudyTime / 60)}m</div>
              <div className="text-xs text-muted-foreground">Study Time</div>
            </div>
          </div>
        )}

        {/* Streak Display */}
        {currentStreak > 0 && (
          <Alert className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              🔥 {currentStreak} session streak! Keep it up!
            </AlertDescription>
          </Alert>
        )}

        {/* End Session */}
        {(completedPomodoros > 0 || questionsSolved > 0) && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleEndSession}
          >
            End Study Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
};