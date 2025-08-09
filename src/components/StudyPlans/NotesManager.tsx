import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Search, Tag, Calendar, Edit, Trash2, Star } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, Note } from '@/hooks/useNotes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface NotesManagerProps {
  studyPlanId: string | null;
}

export const NotesManager: React.FC<NotesManagerProps> = ({ studyPlanId }) => {
  const { toast } = useToast();
  const { data: notes = [], isLoading, isError } = useNotes(studyPlanId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [noteState, setNoteState] = useState({
    title: '',
    content: '',
    subject: '',
    topic: '',
    tags: '',
    is_important: false
  });

  const subjects = useMemo(() => ['all', ...Array.from(new Set(notes.map(note => note.subject)))], [notes]);
  
  const filteredNotes = useMemo(() => notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  }), [notes, searchTerm, selectedSubject]);

  const resetNoteState = () => {
    setNoteState({
      title: '',
      content: '',
      subject: '',
      topic: '',
      tags: '',
      is_important: false
    });
  };

  const handleCreateNote = async () => {
    if (!noteState.title || !noteState.content || !studyPlanId) {
      toast({
        title: 'Error',
        description: 'Please fill in title and content, and ensure a study plan is selected.',
        variant: 'destructive'
      });
      return;
    }

    await createNote.mutateAsync({
      ...noteState,
      study_plan_id: studyPlanId,
      tags: noteState.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });

    resetNoteState();
    setShowCreateDialog(false);
    toast({ title: 'Success', description: 'Note created successfully' });
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !noteState.title || !noteState.content) return;

    await updateNote.mutateAsync({
      id: editingNote.id,
      ...noteState,
      tags: noteState.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });

    setEditingNote(null);
    resetNoteState();
    toast({ title: 'Success', description: 'Note updated successfully' });
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote.mutateAsync(noteId);
    toast({ title: 'Success', description: 'Note deleted successfully' });
  };

  const toggleImportant = async (note: Note) => {
    await updateNote.mutateAsync({ id: note.id, is_important: !note.is_important });
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setNoteState({
      title: note.title,
      content: note.content,
      subject: note.subject,
      topic: note.topic,
      tags: note.tags.join(', '),
      is_important: note.is_important,
    });
  };

  if (!studyPlanId) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Study Plan Selected</h3>
          <p className="text-muted-foreground">
            Please select a study plan to manage your notes.
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
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error loading notes.</div>;
  }

  const NoteForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4">
      <Input
        placeholder="Note title"
        value={noteState.title}
        onChange={(e) => setNoteState({ ...noteState, title: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Subject"
          value={noteState.subject}
          onChange={(e) => setNoteState({ ...noteState, subject: e.target.value })}
        />
        <Input
          placeholder="Topic"
          value={noteState.topic}
          onChange={(e) => setNoteState({ ...noteState, topic: e.target.value })}
        />
      </div>
      <Input
        placeholder="Tags (comma separated)"
        value={noteState.tags}
        onChange={(e) => setNoteState({ ...noteState, tags: e.target.value })}
      />
      <Textarea
        placeholder="Note content"
        value={noteState.content}
        onChange={(e) => setNoteState({ ...noteState, content: e.target.value })}
        rows={6}
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="important"
          checked={noteState.is_important}
          onChange={(e) => setNoteState({ ...noteState, is_important: e.target.checked })}
        />
        <label htmlFor="important">Mark as important</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Study Notes</h2>
          <p className="text-muted-foreground">Organize and manage your study notes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(isOpen) => { setShowCreateDialog(isOpen); if (!isOpen) resetNoteState(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create New Note</DialogTitle></DialogHeader>
            <NoteForm isEditing={false} />
            <DialogFooter>
              <Button onClick={handleCreateNote} disabled={createNote.isPending}>
                {createNote.isPending ? 'Creating...' : 'Create Note'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    {note.is_important && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{note.subject}</span> • <span>{note.topic}</span> •
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleImportant(note)}>
                    <Star className={`h-4 w-4 ${note.is_important ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Dialog open={editingNote?.id === note.id} onOpenChange={(isOpen) => { if (!isOpen) setEditingNote(null); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Edit Note</DialogTitle></DialogHeader>
                      <NoteForm isEditing={true} />
                      <DialogFooter>
                        <Button onClick={handleUpdateNote} disabled={updateNote.isPending}>
                          {updateNote.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(note.id)} disabled={deleteNote.isPending}>
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