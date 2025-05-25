
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, MapPin, SearchIcon, User } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEventStore } from '@/hooks/useEventStore';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  organizer: string;
}

export function EventList() {
  const { events, isLoading } = useEventStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const filteredEvents = events.filter((event: EventData) => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group events by month
  type EventByMonth = Record<string, EventData[]>;
  
  const eventsByMonth = filteredEvents.reduce((acc: EventByMonth, event: EventData) => {
    // Safely parse the date string and validate before using
    let date;
    try {
      date = parseISO(event.date);
      // If the date is invalid, skip this event
      if (!isValid(date)) {
        console.error(`Invalid date format for event ${event.id}: ${event.date}`);
        return acc;
      }
    } catch (error) {
      console.error(`Error parsing date for event ${event.id}: ${event.date}`, error);
      return acc;
    }
    
    const monthYear = format(date, 'MMMM yyyy', { locale: ptBR });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(event);
    return acc;
  }, {} as EventByMonth);
  
  // Sort months chronologically
  const sortedMonths = Object.keys(eventsByMonth).sort((a, b) => {
    // Extract the month and year and create comparable dates
    const monthA = a.split(' ')[0];
    const yearA = a.split(' ')[1];
    const monthB = b.split(' ')[0];
    const yearB = b.split(' ')[1];
    
    // Create dates for comparison
    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);
    
    return dateA.getTime() - dateB.getTime();
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          className="pl-10"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhum evento encontrado</p>
          </CardContent>
        </Card>
      ) : (
        sortedMonths.map((month) => (
          <div key={month} className="space-y-4">
            <h2 className="text-xl font-semibold capitalize">{month}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventsByMonth[month].map((event: EventData, index: number) => {
                // Parse and validate date safely
                let eventDate;
                try {
                  eventDate = parseISO(event.date);
                  if (!isValid(eventDate)) {
                    console.error(`Invalid date format in card render for event ${event.id}: ${event.date}`);
                    eventDate = new Date(); // Fallback to current date
                  }
                } catch (error) {
                  console.error(`Error parsing date in card render for event ${event.id}: ${event.date}`, error);
                  eventDate = new Date(); // Fallback to current date
                }
                
                return (
                  <Card key={`${event.id || index}-${event.title}`} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {format(eventDate, 'EEEE, d', { locale: ptBR })}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-eco-green" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-eco-green" />
                          <span>{event.address}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 shrink-0 mt-0.5 text-eco-green" />
                          <span>{event.organizer}</span>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <p className="line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
