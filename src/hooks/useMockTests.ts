import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MockTest {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  question_distribution: any;
  difficulty_distribution: any;
  is_full_length: boolean;
  syllabus_coverage?: any;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockTestSession {
  id: string;
  user_id: string;
  mock_test_id: string;
  questions: any;
  user_answers: any;
  start_time: string;
  end_time?: string;
  time_spent_seconds?: number;
  total_score: number;
  subject_scores?: any;
  accuracy_percentage?: number;
  rank?: number;
  percentile?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
  mock_test?: MockTest;
}

export const useMockTests = () => {
  return useQuery({
    queryKey: ['mock-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MockTest[];
    },
  });
};

export const useCreateMockTest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (testData: Partial<MockTest>) => {
      if (!user) throw new Error('No user');
      
      const insertData = {
        title: testData.title!,
        description: testData.description,
        duration_minutes: testData.duration_minutes || 180,
        total_marks: testData.total_marks || 300,
        question_distribution: testData.question_distribution || {},
        difficulty_distribution: testData.difficulty_distribution || {},
        is_full_length: testData.is_full_length ?? true,
        syllabus_coverage: testData.syllabus_coverage,
        created_by: user.id,
        is_active: testData.is_active ?? true,
      };
      
      const { data, error } = await supabase
        .from('mock_tests')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-tests'] });
    },
  });
};

export const useStartMockTest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (mockTestId: string) => {
      if (!user) throw new Error('No user');
      
      // Get mock test details
      const { data: mockTest, error: testError } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', mockTestId)
        .single();
      
      if (testError) throw testError;
      
      // Generate questions based on distribution
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          topic:topics(
            name,
            subject:subjects(name, code)
          )
        `)
        .eq('is_active', true)
        .limit(90); // For a full JEE test (30 per subject)
      
      if (questionsError) throw questionsError;
      
      // Shuffle and select questions based on distribution
      const shuffledQuestions = questions?.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions?.slice(0, 90) || [];
      
      // Create test session
      const { data, error } = await supabase
        .from('mock_test_sessions')
        .insert({
          user_id: user.id,
          mock_test_id: mockTestId,
          questions: selectedQuestions.map(q => q.id),
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      return { session: data, questions: selectedQuestions };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-test-sessions'] });
    },
  });
};

export const useMockTestSessions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mock-test-sessions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('mock_test_sessions')
        .select(`
          *,
          mock_test:mock_tests(
            id, title, description, duration_minutes, total_marks,
            question_distribution, difficulty_distribution, is_full_length
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });
};

export const useSubmitMockTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      userAnswers, 
      timeSpent 
    }: { 
      sessionId: string; 
      userAnswers: any; 
      timeSpent: number; 
    }) => {
      // Get session and questions
      const { data: session, error: sessionError } = await supabase
        .from('mock_test_sessions')
        .select(`
          *,
          mock_test:mock_tests(*)
        `)
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      // Get question details for scoring
      const questionIds = Array.isArray(session.questions) 
        ? session.questions.filter((id: any) => typeof id === 'string') as string[]
        : [];
      
      if (questionIds.length === 0) {
        throw new Error('No valid question IDs found in session');
      }
      
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          topic:topics(
            name,
            subject:subjects(name, code)
          )
        `)
        .in('id', questionIds);
      
      if (questionsError) throw questionsError;
      
      // Calculate scores
      let totalScore = 0;
      let correctAnswers = 0;
      const subjectScores: any = {};
      
      questions?.forEach((question) => {
        const userAnswer = userAnswers[question.id];
        const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correct_answer);
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.points;
          
          const subjectName = question.topic.subject.name;
          if (!subjectScores[subjectName]) {
            subjectScores[subjectName] = { score: 0, attempted: 0, correct: 0 };
          }
          subjectScores[subjectName].score += question.points;
          subjectScores[subjectName].correct++;
        }
        
        const subjectName = question.topic.subject.name;
        if (!subjectScores[subjectName]) {
          subjectScores[subjectName] = { score: 0, attempted: 0, correct: 0 };
        }
        subjectScores[subjectName].attempted++;
      });
      
      const accuracy = questions?.length ? (correctAnswers / questions.length) * 100 : 0;
      
      // Update session
      const { data, error } = await supabase
        .from('mock_test_sessions')
        .update({
          user_answers: userAnswers,
          end_time: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          total_score: totalScore,
          subject_scores: subjectScores,
          accuracy_percentage: accuracy,
          status: 'completed',
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-test-sessions'] });
    },
  });
};