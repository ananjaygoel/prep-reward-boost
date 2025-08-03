import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Brain, RotateCcw, Check, X, Plus, Play, BookOpen, Clock, Target } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: string | null;
  nextReview: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  correctStreak: number;
}

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'What is the derivative of sin(x)?',
    back: 'cos(x)',
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'easy',
    lastReviewed: '2024-01-15',
    nextReview: '2024-01-17',
    repetitions: 3,
    easeFactor: 2.5,
    interval: 2,
    correctStreak: 2
  },
  {
    id: '2',
    front: 'State Newton\'s Second Law',
    back: 'F = ma (Force equals mass times acceleration)',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'medium',
    lastReviewed: '2024-01-14',
    nextReview: '2024-01-16',
    repetitions: 2,
    easeFactor: 2.3,
    interval: 1,
    correctStreak: 1
  },
  {
    id: '3',
    front: 'What is the molecular formula of benzene?',
    back: 'C₆H₆',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    difficulty: 'easy',
    lastReviewed: null,
    nextReview: '2024-01-16',
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0,
    correctStreak: 0
  },
  {
    id: '4',
    front: 'Explain the photoelectric effect',
    back: 'When light hits a metal surface, electrons are emitted if the light frequency exceeds a threshold. The kinetic energy of emitted electrons depends on light frequency, not intensity. This proved light\'s particle nature.',
    subject: 'Physics',
    topic: 'Modern Physics',
    difficulty: 'hard',
    lastReviewed: '2024-01-13',
    nextReview: '2024-01-18',
    repetitions: 1,
    easeFactor: 2.1,
    interval: 3,
    correctStreak: 0
  }
];

export const FlashcardsSystem: React.FC = () => {
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [studyProgress, setStudyProgress] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    subject: '',
    topic: '',
    difficulty: 'medium' as const
  });

  const today = new Date().toISOString().split('T')[0];
  
  const dueCards = flashcards.filter(card => card.nextReview <= today);
  const totalCards = flashcards.length;
  const reviewedToday = flashcards.filter(card => card.lastReviewed === today).length;

  const startStudySession = () => {
    const queue = dueCards.length > 0 ? dueCards : flashcards.slice(0, 10);
    setStudyQueue([...queue]);
    setCurrentCard(queue[0] || null);
    setShowAnswer(false);
    setStudyMode(true);
    setStudyProgress(0);
  };

  const calculateNextReview = (card: Flashcard, quality: number): Flashcard => {
    const newCard = { ...card };
    
    if (quality >= 3) {
      if (newCard.repetitions === 0) {
        newCard.interval = 1;
      } else if (newCard.repetitions === 1) {
        newCard.interval = 6;
      } else {
        newCard.interval = Math.round(newCard.interval * newCard.easeFactor);
      }
      newCard.repetitions += 1;
      newCard.correctStreak += 1;
    } else {
      newCard.repetitions = 0;
      newCard.interval = 1;
      newCard.correctStreak = 0;
    }

    newCard.easeFactor = Math.max(1.3, newCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newCard.interval);
    newCard.nextReview = nextDate.toISOString().split('T')[0];
    newCard.lastReviewed = today;

    return newCard;
  };

  const handleCardResponse = (quality: number) => {
    if (!currentCard) return;

    const updatedCard = calculateNextReview(currentCard, quality);
    setFlashcards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    const newQueue = studyQueue.slice(1);
    setStudyQueue(newQueue);
    setStudyProgress(((studyQueue.length - newQueue.length) / studyQueue.length) * 100);
    
    if (newQueue.length > 0) {
      setCurrentCard(newQueue[0]);
      setShowAnswer(false);
    } else {
      setStudyMode(false);
      setCurrentCard(null);
      toast({
        title: 'Study Session Complete! 🎉',
        description: `You reviewed ${studyQueue.length} flashcards.`
      });
    }
  };

  const handleCreateCard = () => {
    if (!newCard.front || !newCard.back) {
      toast({
        title: 'Error',
        description: 'Please fill in both front and back of the card',
        variant: 'destructive'
      });
      return;
    }

    const card: Flashcard = {
      id: Date.now().toString(),
      ...newCard,
      lastReviewed: null,
      nextReview: today,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
      correctStreak: 0
    };

    setFlashcards([card, ...flashcards]);
    setNewCard({
      front: '',
      back: '',
      subject: '',
      topic: '',
      difficulty: 'medium'
    });
    setShowCreateDialog(false);
    
    toast({
      title: 'Success',
      description: 'Flashcard created successfully'
    });
  };

  if (studyMode && currentCard) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Study Session</h2>
          <Progress value={studyProgress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Card {studyQueue.length - studyQueue.length + 1} of {studyQueue.length}
          </p>
        </div>

        <Card className="min-h-[400px]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Badge variant="outline" className="mb-2">
                  {currentCard.subject} • {currentCard.topic}
                </Badge>
                <Badge variant={
                  currentCard.difficulty === 'easy' ? 'secondary' :
                  currentCard.difficulty === 'medium' ? 'default' : 'destructive'
                }>
                  {currentCard.difficulty}
                </Badge>
              </div>
              <Button variant="outline" onClick={() => setStudyMode(false)}>
                Exit Study
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                {showAnswer ? 'Answer:' : 'Question:'}
              </h3>
              <div className="text-lg p-6 bg-muted rounded-lg min-h-[150px] flex items-center justify-center">
                {showAnswer ? currentCard.back : currentCard.front}
              </div>
            </div>

            {!showAnswer ? (
              <div className="text-center">
                <Button onClick={() => setShowAnswer(true)} size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Show Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  How well did you know this?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleCardResponse(1)}
                    className="flex flex-col p-4 h-auto"
                  >
                    <X className="h-5 w-5 mb-1" />
                    <span className="text-xs">Again</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCardResponse(2)}
                    className="flex flex-col p-4 h-auto"
                  >
                    <span className="text-lg mb-1">😐</span>
                    <span className="text-xs">Hard</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleCardResponse(3)}
                    className="flex flex-col p-4 h-auto"
                  >
                    <span className="text-lg mb-1">🙂</span>
                    <span className="text-xs">Good</span>
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleCardResponse(4)}
                    className="flex flex-col p-4 h-auto"
                  >
                    <Check className="h-5 w-5 mb-1" />
                    <span className="text-xs">Easy</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Flashcards</h2>
          <p className="text-muted-foreground">Spaced repetition learning system</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Flashcard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Subject"
                    value={newCard.subject}
                    onChange={(e) => setNewCard({ ...newCard, subject: e.target.value })}
                  />
                  <Input
                    placeholder="Topic"
                    value={newCard.topic}
                    onChange={(e) => setNewCard({ ...newCard, topic: e.target.value })}
                  />
                </div>
                <select
                  value={newCard.difficulty}
                  onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <Textarea
                  placeholder="Front of card (question)"
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  rows={3}
                />
                <Textarea
                  placeholder="Back of card (answer)"
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateCard}>Create Card</Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={startStudySession} disabled={totalCards === 0}>
            <Play className="h-4 w-4 mr-2" />
            Start Study
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{totalCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{dueCards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reviewed Today</p>
                <p className="text-2xl font-bold">{reviewedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {totalCards > 0 ? Math.round((flashcards.filter(c => c.correctStreak > 0).length / totalCards) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcards List */}
      <div className="grid gap-4">
        {flashcards.map(card => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {card.subject} • {card.topic}
                    </Badge>
                    <Badge variant={
                      card.difficulty === 'easy' ? 'secondary' :
                      card.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {card.difficulty}
                    </Badge>
                    {card.nextReview <= today && (
                      <Badge variant="destructive">Due</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Q: {card.front}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>A: {card.back}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Next: {card.nextReview}</p>
                  <p>Streak: {card.correctStreak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalCards === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Flashcards Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first flashcard to start learning with spaced repetition
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create First Card
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};