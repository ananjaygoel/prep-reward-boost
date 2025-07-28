import React, { useState } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useQuestions } from '@/hooks/useQuestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Users, BarChart3 } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const questionSchema = z.object({
  question_text: z.string().min(10, 'Question must be at least 10 characters'),
  question_type: z.enum(['single_correct', 'multiple_correct', 'numerical', 'assertion_reason']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic_id: z.string().min(1, 'Please select a topic'),
  options: z.array(z.string()).optional(),
  correct_answer: z.any(),
  explanation: z.string().optional(),
  solution_steps: z.string().optional(),
  points: z.number().min(1).max(100),
  time_limit_seconds: z.number().min(30).max(600),
  year_appeared: z.number().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

const InternPortal: React.FC = () => {
  const { isContentCreator, loading: rolesLoading } = useUserRoles();
  const { data: questions, isLoading } = useQuestions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: '',
      question_type: 'single_correct',
      difficulty: 'medium',
      topic_id: '',
      points: 10,
      time_limit_seconds: 180,
      options: [],
      explanation: '',
      solution_steps: '',
    },
  });

  // Fetch subjects and topics
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          subject:subjects(*)
        `)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const questionData = {
        question_text: data.question_text,
        question_type: data.question_type,
        difficulty: data.difficulty,
        topic_id: data.topic_id,
        points: data.points,
        time_limit_seconds: data.time_limit_seconds,
        year_appeared: data.year_appeared,
        explanation: data.explanation,
        solution_steps: data.solution_steps,
        options: data.question_type === 'numerical' ? null : options.filter(opt => opt.trim()),
        correct_answer: data.question_type === 'numerical' 
          ? parseFloat(data.correct_answer as string)
          : data.correct_answer,
      };

      const { error } = await supabase
        .from('questions')
        .insert(questionData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Question added successfully!',
      });
      form.reset();
      setOptions(['', '', '', '']);
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add question. Please try again.',
        variant: 'destructive',
      });
      console.error('Error adding question:', error);
    },
  });

  if (rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isContentCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need content creator privileges to access the intern portal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const onSubmit = (data: QuestionFormData) => {
    addQuestionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Intern Portal</h1>
            <p className="text-muted-foreground">Manage questions and content</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topics?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Create a new question for the question bank</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="question_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter the question..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="question_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single_correct">Single Correct</SelectItem>
                              <SelectItem value="multiple_correct">Multiple Correct</SelectItem>
                              <SelectItem value="numerical">Numerical</SelectItem>
                              <SelectItem value="assertion_reason">Assertion & Reason</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="topic_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {topics?.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                  {topic.name} ({topic.subject?.name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Options for non-numerical questions */}
                  {form.watch('question_type') !== 'numerical' && (
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {options.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                      <Button type="button" variant="outline" onClick={addOption}>
                        Add Option
                      </Button>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="correct_answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          {form.watch('question_type') === 'numerical' ? (
                            <Input type="number" {...field} placeholder="Enter numerical answer" />
                          ) : (
                            <Input {...field} placeholder="Enter correct answer index (0, 1, 2...)" />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time_limit_seconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (seconds)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year_appeared"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Appeared (optional)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation (optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Explain the answer..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solution_steps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solution Steps (optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Step-by-step solution..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={addQuestionMutation.isPending}>
                      {addQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
            <CardDescription>Questions you've added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions found. Add your first question!
              </div>
            ) : (
              <div className="space-y-4">
                {questions?.slice(0, 10).map((question) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{question.question_text}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {question.difficulty}
                          </span>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {question.question_type}
                          </span>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            {question.topic.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{question.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternPortal;