import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Brain, RotateCcw, Check, X, Plus, Play, BookOpen, Clock, Target, Trash2 } from 'lucide-react';
import { useFlashcards, useCreateFlashcard, useUpdateFlashcard, useDeleteFlashcard, Flashcard } from '@/hooks/useFlashcards';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface FlashcardsSystemProps {
  studyPlanId: string | null;
}

export const FlashcardsSystem: React.FC<FlashcardsSystemProps> = ({ studyPlanId }) => {
  const { toast } = useToast();
  const { data: flashcards = [], isLoading, isError } = useFlashcards(studyPlanId);
  const createFlashcard = useCreateFlashcard();
  const updateFlashcard = useUpdateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();

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
  
  const dueCards = flashcards.filter(card => card.next_review_at <= today);
  const totalCards = flashcards.length;
  const reviewedToday = flashcards.filter(card => card.last_reviewed_at?.startsWith(today)).length;

  const startStudySession = () => {
    const queue = dueCards.length > 0 ? dueCards : flashcards.slice(0, 10);
    setStudyQueue([...queue]);
    setCurrentCard(queue[0] || null);
    setShowAnswer(false);
    setStudyMode(true);
    setStudyProgress(0);
  };

  const calculateNextReview = (card: Flashcard, quality: number): Partial<Flashcard> => {
    let { repetitions, ease_factor, interval } = card;
    
    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ease_factor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    const next_review_at = nextDate.toISOString();
    const last_reviewed_at = new Date().toISOString();

    return { repetitions, ease_factor, interval, next_review_at, last_reviewed_at };
  };

  const handleCardResponse = async (quality: number) => {
    if (!currentCard) return;

    const updates = calculateNextReview(currentCard, quality);
    await updateFlashcard.mutateAsync({ id: currentCard.id, ...updates });

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

  const handleCreateCard = async () => {
    if (!newCard.front || !newCard.back || !studyPlanId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields and select a study plan.',
        variant: 'destructive'
      });
      return;
    }

    await createFlashcard.mutateAsync({
      ...newCard,
      study_plan_id: studyPlanId
    });

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

  const handleDeleteCard = async (id: string) => {
    await deleteFlashcard.mutateAsync(id);
    toast({
      title: 'Success',
      description: 'Flashcard deleted successfully'
    });
  };

  if (!studyPlanId) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Study Plan Selected</h3>
          <p className="text-muted-foreground">
            Please select a study plan to manage flashcards.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error loading flashcards.</div>;
  }

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
                <Select
                  value={newCard.difficulty}
                  onValueChange={(value) => setNewCard({ ...newCard, difficulty: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Button onClick={handleCreateCard} disabled={createFlashcard.isPending}>
                    {createFlashcard.isPending ? 'Creating...' : 'Create Card'}
                  </Button>
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
                  {totalCards > 0 ? Math.round((flashcards.filter(c => (c.repetitions || 0) > 0).length / totalCards) * 100) : 0}%
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
                    {card.next_review_at <= today && (
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
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Next: {new Date(card.next_review_at).toLocaleDateString()}</p>
                    <p>Reps: {card.repetitions}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deleteFlashcard.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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