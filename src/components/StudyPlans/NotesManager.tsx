import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Search, Tag, Calendar, Edit, Trash2, Star } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  tags: string[];
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Newton\'s Laws of Motion',
    content: 'First Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\nSecond Law: F = ma - Force equals mass times acceleration.\n\nThird Law: For every action, there is an equal and opposite reaction.',
    subject: 'Physics',
    topic: 'Mechanics',
    tags: ['fundamental', 'important', 'formulas'],
    isImportant: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16'
  },
  {
    id: '2',
    title: 'Integration Techniques',
    content: 'Key integration methods:\n1. Substitution method\n2. Integration by parts\n3. Partial fractions\n4. Trigonometric substitution\n\nRemember: ∫udv = uv - ∫vdu (integration by parts)',
    subject: 'Mathematics',
    topic: 'Calculus',
    tags: ['calculus', 'integration', 'techniques'],
    isImportant: true,
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Organic Reaction Mechanisms',
    content: 'Common mechanisms:\n- SN1: Single step, carbocation intermediate\n- SN2: Concerted, backside attack\n- E1: Elimination, carbocation intermediate\n- E2: Concerted elimination\n\nFactors affecting: Substrate structure, nucleophile strength, leaving group, solvent',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    tags: ['organic', 'mechanisms', 'reactions'],
    isImportant: false,
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13'
  }
];

export const NotesManager: React.FC = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: '',
    topic: '',
    tags: '',
    isImportant: false
  });

  const subjects = ['all', ...Array.from(new Set(notes.map(note => note.subject)))];
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: 'Error',
        description: 'Please fill in title and content',
        variant: 'destructive'
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      ...newNote,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setNotes([note, ...notes]);
    setNewNote({
      title: '',
      content: '',
      subject: '',
      topic: '',
      tags: '',
      isImportant: false
    });
    setShowCreateDialog(false);
    
    toast({
      title: 'Success',
      description: 'Note created successfully'
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast({
      title: 'Success',
      description: 'Note deleted successfully'
    });
  };

  const toggleImportant = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, isImportant: !note.isImportant } : note
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Study Notes</h2>
          <p className="text-muted-foreground">Organize and manage your study notes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Subject"
                  value={newNote.subject}
                  onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                />
                <Input
                  placeholder="Topic"
                  value={newNote.topic}
                  onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                />
              </div>
              <Input
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              />
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={6}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={newNote.isImportant}
                  onChange={(e) => setNewNote({ ...newNote, isImportant: e.target.checked })}
                />
                <label htmlFor="important">Mark as important</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateNote}>Create Note</Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject === 'all' ? 'All Subjects' : subject}
            </option>
          ))}
        </select>
      </div>

      {/* Notes List */}
      <div className="grid gap-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    {note.isImportant && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{note.subject}</span>
                    <span>•</span>
                    <span>{note.topic}</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{note.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleImportant(note.id)}
                  >
                    <Star className={`h-4 w-4 ${note.isImportant ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notes Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedSubject !== 'all' 
                ? 'No notes match your search criteria'
                : 'Start creating notes to organize your study materials'
              }
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};