import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestions, useSubmitAnswer, type Question } from '@/hooks/useQuestions';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Clock, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Trophy,
  ArrowRight
} from 'lucide-react';

const Practice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | undefined;
  const subject = searchParams.get('subject');
  
  const { data: questions, isLoading } = useQuestions({ difficulty, subject });
  const submitAnswer = useSubmitAnswer();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes default
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  
  const currentQuestion = questions?.[currentQuestionIndex];
  
  // Timer effect
  useEffect(() => {
    if (!currentQuestion || showResult) return;
    
    setTimeLeft(currentQuestion.time_limit_seconds || 180);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestionIndex, currentQuestion, showResult]);
  
  const handleSubmit = async (timeUp = false) => {
    if (!currentQuestion) return;
    
    const isCorrect = checkAnswer();
    const timeTaken = (currentQuestion.time_limit_seconds || 180) - timeLeft;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;
    
    try {
      await submitAnswer.mutateAsync({
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        isCorrect,
        timeTaken,
        pointsEarned,
      });
      
      setSessionScore(prev => prev + pointsEarned);
      if (isCorrect) setSessionCorrect(prev => prev + 1);
      setShowResult(true);
      
      if (timeUp) {
        toast({
          title: "Time's up!",
          description: "The question has been auto-submitted.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const checkAnswer = () => {
    if (!currentQuestion || selectedAnswer === null) return false;
    
    if (currentQuestion.question_type === 'single_correct') {
      return selectedAnswer === currentQuestion.correct_answer;
    }
    
    if (currentQuestion.question_type === 'multiple_correct') {
      const correct = Array.isArray(currentQuestion.correct_answer) 
        ? currentQuestion.correct_answer 
        : [currentQuestion.correct_answer];
      const selected = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
      return JSON.stringify(correct.sort()) === JSON.stringify(selected.sort());
    }
    
    return selectedAnswer === currentQuestion.correct_answer;
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Session complete
      toast({
        title: "Session Complete!",
        description: `You scored ${sessionCorrect}/${questions?.length || 0} correct answers!`,
      });
      navigate('/');
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
          <p className="text-muted-foreground mb-4">
            Sorry, there are no questions available for the selected criteria.
          </p>
          <Button onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-primary" />
              <span>{sessionScore} points</span>
            </div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mb-6">
          <Progress 
            value={(currentQuestionIndex / questions.length) * 100} 
            className="h-2"
          />
        </div>
        
        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={
                  currentQuestion?.difficulty === 'easy' ? 'default' : 
                  currentQuestion?.difficulty === 'medium' ? 'secondary' : 
                  'destructive'
                }>
                  {currentQuestion?.difficulty}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion?.topic?.subject?.name}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion?.topic?.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 30 ? 'text-destructive font-semibold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion?.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion?.question_type === 'single_correct' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option: any, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => !showResult && setSelectedAnswer(index)}
                    disabled={showResult}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold min-w-[20px]">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {showResult && index === currentQuestion.correct_answer && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentQuestion.correct_answer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            {currentQuestion?.question_type === 'numerical' && (
              <div className="space-y-4">
                <input
                  type="number"
                  step="any"
                  placeholder="Enter your answer"
                  className="w-full p-3 border rounded-lg"
                  value={selectedAnswer || ''}
                  onChange={(e) => !showResult && setSelectedAnswer(Number(e.target.value))}
                  disabled={showResult}
                />
              </div>
            )}
            
            {/* Show explanation after answering */}
            {showResult && currentQuestion?.explanation && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  {checkAnswer() ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Correct! (+{currentQuestion.points} points)
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      Incorrect
                    </>
                  )}
                </h4>
                <p className="text-sm mb-2">{currentQuestion.explanation}</p>
                {currentQuestion.solution_steps && (
                  <div className="text-sm">
                    <strong>Solution:</strong>
                    <pre className="whitespace-pre-wrap font-sans mt-1">
                      {currentQuestion.solution_steps}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <div></div>
          {!showResult ? (
            <Button 
              onClick={() => handleSubmit()}
              disabled={selectedAnswer === null || submitAnswer.isPending}
              className="bg-gradient-primary"
            >
              {submitAnswer.isPending ? 'Submitting...' : 'Submit Answer'}
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-gradient-primary">
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Complete Session'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;