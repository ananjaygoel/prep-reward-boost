import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCreateStudyPlan } from '@/hooks/useStudyPlans';
import { Calendar, Target, BookOpen, Clock } from 'lucide-react';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBJECTS = [
  { id: 'physics', name: 'Physics', defaultWeightage: 33.33 },
  { id: 'chemistry', name: 'Chemistry', defaultWeightage: 33.33 },
  { id: 'mathematics', name: 'Mathematics', defaultWeightage: 33.34 },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Basic concepts and simple problems' },
  { value: 'intermediate', label: 'Intermediate', description: 'Moderate difficulty with mixed concepts' },
  { value: 'advanced', label: 'Advanced', description: 'Complex problems and advanced topics' },
];

export const CreatePlanDialog: React.FC<CreatePlanDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const createPlanMutation = useCreateStudyPlan();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'intermediate' as const,
    target_exam_date: '',
    total_weeks: 12,
    subjects: SUBJECTS.map(s => ({ ...s, selected: true })),
  });

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, selected: !s.selected } : s
      )
    }));
  };

  const handleWeightageChange = (subjectId: string, weightage: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, defaultWeightage: weightage } : s
      )
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a plan title',
        variant: 'destructive',
      });
      return;
    }

    const selectedSubjects = formData.subjects.filter(s => s.selected);
    if (selectedSubjects.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one subject',
        variant: 'destructive',
      });
      return;
    }

    // Normalize weightages to sum to 100%
    const totalWeightage = selectedSubjects.reduce((sum, s) => sum + s.defaultWeightage, 0);
    const normalizedSubjects = selectedSubjects.map(s => ({
      subject: s.name,
      weightage: (s.defaultWeightage / totalWeightage) * 100,
    }));

    try {
      await createPlanMutation.mutateAsync({
        ...formData,
        subjects: normalizedSubjects,
      });
      
      toast({
        title: 'Success!',
        description: 'Study plan created successfully',
      });
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty_level: 'intermediate',
        target_exam_date: '',
        total_weeks: 12,
        subjects: SUBJECTS.map(s => ({ ...s, selected: true })),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create study plan',
        variant: 'destructive',
      });
    }
  };

  const selectedSubjects = formData.subjects.filter(s => s.selected);
  const totalWeightage = selectedSubjects.reduce((sum, s) => sum + s.defaultWeightage, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Study Plan
          </DialogTitle>
          <DialogDescription>
            Design a personalized study plan tailored to your JEE preparation goals.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Plan Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., JEE Mains 2024 Preparation"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your study goals and strategy..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <Label>Difficulty Level</Label>
            <div className="grid gap-2 mt-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <div 
                  key={level.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.difficulty_level === level.value 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, difficulty_level: level.value as any }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.difficulty_level === level.value 
                        ? 'border-primary bg-primary' 
                        : 'border-gray-300'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Selection */}
          <div>
            <Label>Subjects & Weightage</Label>
            <div className="space-y-3 mt-2">
              {formData.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={subject.selected}
                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                  />
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  {subject.selected && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={subject.defaultWeightage}
                        onChange={(e) => handleWeightageChange(subject.id, Number(e.target.value))}
                        className="w-20 h-8"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  )}
                </div>
              ))}
              
              {selectedSubjects.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Total weightage: {totalWeightage.toFixed(1)}%
                  {Math.abs(totalWeightage - 100) > 0.1 && (
                    <span className="text-amber-600 ml-2">
                      (Will be normalized to 100%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Target Exam Date
              </Label>
              <Input
                id="exam-date"
                type="date"
                value={formData.target_exam_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_exam_date: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="weeks" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Study Duration
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="weeks"
                  type="number"
                  value={formData.total_weeks}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_weeks: parseInt(e.target.value) }))}
                  min="1"
                  max="52"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">weeks</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createPlanMutation.isPending}
          >
            {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};