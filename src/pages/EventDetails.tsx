
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEventStore } from '@/hooks/useEventStore';
import { Event } from '@/hooks/useEventStore';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { events, isLoading } = useEventStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventDate, setEventDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!isLoading && events.length > 0 && id) {
      const foundEvent = events.find(e => e.id === id);
      if (foundEvent) {
        setEvent(foundEvent);
        
        // Parse and validate date
        try {
          const parsedDate = parseISO(foundEvent.date);
          if (isValid(parsedDate)) {
            setEventDate(parsedDate);
          } else {
            console.error(`Invalid date format for event ${foundEvent.id}: ${foundEvent.date}`);
            setEventDate(new Date()); // Fallback to current date
          }
        } catch (error) {
          console.error(`Error parsing date for event ${foundEvent.id}: ${foundEvent.date}`, error);
          setEventDate(new Date()); // Fallback to current date
        }
      }
    }
  }, [id, events, isLoading]);

  const openInMaps = () => {
    if (event && event.lat && event.lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${event.lat},${event.lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center h-60">
            <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <div className="container px-4 py-8">
          <Link to="/events" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar aos Eventos</span>
          </Link>
          
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Link to="/events">
              <Button>Voltar aos Eventos</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <Link to="/events" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar aos Eventos</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-eco-green to-eco-blue p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-eco-green-light">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {eventDate && format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Descrição do Evento</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-eco-green" />
                    Localização
                  </h3>
                  <p className="text-muted-foreground mb-3">{event.address}</p>
                  {event.lat && event.lng && (
                    <Button variant="outline" size="sm" onClick={openInMaps}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Abrir no Google Maps
                    </Button>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-eco-green" />
                    Organizador
                  </h3>
                  <p className="text-muted-foreground">{event.organizer}</p>
                </div>
              </div>

              <Separator />

              <div className="bg-eco-sand/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Informações Importantes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Participe de eventos ecológicos e contribua para um futuro sustentável</li>
                  <li>• Traga sua própria garrafa de água para reduzir o uso de plástico</li>
                  <li>• Use transporte público ou compartilhado sempre que possível</li>
                  <li>• Respeite o meio ambiente e descarte o lixo adequadamente</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link to="/events" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver Outros Eventos
                  </Button>
                </Link>
                <Link to="/events?tab=mapa" className="flex-1">
                  <Button className="w-full bg-eco-green hover:bg-eco-green-dark">
                    Ver no Mapa de Eventos
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
