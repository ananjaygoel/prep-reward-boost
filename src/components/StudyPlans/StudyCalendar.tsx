import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, BookOpen, Target, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface StudyEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'study' | 'revision' | 'mock_test' | 'assignment';
  subject?: string;
  topic?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  description?: string;
}

const mockEvents: StudyEvent[] = [
  {
    id: '1',
    title: 'Physics - Mechanics',
    start: new Date(2024, 0, 16, 9, 0),
    end: new Date(2024, 0, 16, 11, 0),
    type: 'study',
    subject: 'Physics',
    topic: 'Mechanics',
    priority: 'high',
    completed: false,
    description: 'Newton\'s laws and motion problems'
  },
  {
    id: '2',
    title: 'Mathematics - Calculus Revision',
    start: new Date(2024, 0, 16, 15, 0),
    end: new Date(2024, 0, 16, 17, 0),
    type: 'revision',
    subject: 'Mathematics',
    topic: 'Calculus',
    priority: 'medium',
    completed: true,
    description: 'Integration and differentiation practice'
  },
  {
    id: '3',
    title: 'Chemistry Mock Test',
    start: new Date(2024, 0, 17, 10, 0),
    end: new Date(2024, 0, 17, 13, 0),
    type: 'mock_test',
    subject: 'Chemistry',
    priority: 'high',
    completed: false,
    description: 'Full syllabus mock test'
  },
  {
    id: '4',
    title: 'Physics Assignment',
    start: new Date(2024, 0, 18, 14, 0),
    end: new Date(2024, 0, 18, 16, 0),
    type: 'assignment',
    subject: 'Physics',
    topic: 'Thermodynamics',
    priority: 'medium',
    completed: false,
    description: 'Problem solving on heat transfer'
  },
  {
    id: '5',
    title: 'Mathematics - Trigonometry',
    start: new Date(2024, 0, 19, 9, 0),
    end: new Date(2024, 0, 19, 11, 0),
    type: 'study',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    priority: 'high',
    completed: false,
    description: 'Trigonometric identities and equations'
  }
];

export const StudyCalendar: React.FC = () => {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<StudyEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const eventStyleGetter = (event: StudyEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'study':
        backgroundColor = event.completed ? '#22c55e' : '#3b82f6';
        break;
      case 'revision':
        backgroundColor = event.completed ? '#16a34a' : '#f59e0b';
        break;
      case 'mock_test':
        backgroundColor = event.completed ? '#15803d' : '#ef4444';
        break;
      case 'assignment':
        backgroundColor = event.completed ? '#166534' : '#8b5cf6';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: event.completed ? 0.7 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: StudyEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ));
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study':
        return <BookOpen className="h-4 w-4" />;
      case 'revision':
        return <Clock className="h-4 w-4" />;
      case 'mock_test':
        return <Target className="h-4 w-4" />;
      case 'assignment':
        return <Plus className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study':
        return 'bg-blue-500';
      case 'revision':
        return 'bg-yellow-500';
      case 'mock_test':
        return 'bg-red-500';
      case 'assignment':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const todaysEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.start);
    return eventDate > today && eventDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Study Calendar</h2>
          <p className="text-muted-foreground">Manage your study schedule and track progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Study Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView(Views.DAY)}
                    className={view === Views.DAY ? 'bg-primary text-primary-foreground' : ''}
                  >
                    Day
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView(Views.WEEK)}
                    className={view === Views.WEEK ? 'bg-primary text-primary-foreground' : ''}
                  >
                    Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView(Views.MONTH)}
                    className={view === Views.MONTH ? 'bg-primary text-primary-foreground' : ''}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ height: '500px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  popup
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysEvents.length > 0 ? (
                todaysEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
                    onClick={() => handleSelectEvent(event)}
                  >
                    <div className={`p-2 rounded-full ${getTypeColor(event.type)} text-white`}>
                      {getTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </p>
                    </div>
                    {event.completed && (
                      <Badge variant="secondary" className="text-xs">Done</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
                    onClick={() => handleSelectEvent(event)}
                  >
                    <div className={`p-2 rounded-full ${getTypeColor(event.type)} text-white`}>
                      {getTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.start, 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Events</span>
                <Badge variant="secondary">{events.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <Badge variant="secondary">
                  {events.filter(e => e.completed).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <Badge variant="destructive">
                  {events.filter(e => !e.completed).length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${getTypeColor(selectedEvent?.type || '')} text-white`}>
                {getTypeIcon(selectedEvent?.type || '')}
              </div>
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedEvent.type.replace('_', ' ')}</Badge>
                <Badge variant={selectedEvent.priority === 'high' ? 'destructive' : 
                              selectedEvent.priority === 'medium' ? 'default' : 'secondary'}>
                  {selectedEvent.priority} priority
                </Badge>
                {selectedEvent.completed && <Badge variant="secondary">Completed</Badge>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(selectedEvent.start, 'MMM dd, yyyy HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                  </span>
                </div>
                
                {selectedEvent.subject && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedEvent.subject}
                      {selectedEvent.topic && ` • ${selectedEvent.topic}`}
                    </span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant={selectedEvent.completed ? "secondary" : "default"}
                  onClick={() => toggleEventComplete(selectedEvent.id)}
                >
                  {selectedEvent.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                <Button variant="outline">Edit</Button>
                <Button variant="outline">Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};