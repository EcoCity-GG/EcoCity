
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, MapPin, Send, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { EventForm } from '@/components/events/EventForm';
import { EventList } from '@/components/events/EventList';
import { EventRequests } from '@/components/events/EventRequests';
import EventMap from '@/components/events/EventMap';
import { useIsMobile } from '@/hooks/use-mobile';
import { MyEventRequests } from '@/components/events/MyEventRequests';
import { cn } from '@/lib/utils';

const Events = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("eventos");
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao início</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-eco-green-dark">Eventos Ecológicos</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Fique por dentro dos eventos ecológicos na cidade e região
            </p>
          </div>
          
          {user?.isAdmin && (
            <Button
              onClick={() => setActiveTab("adicionar")}
              className="bg-eco-green hover:bg-eco-green-dark self-start md:self-auto"
            >
              <CalendarPlus className="mr-2 h-5 w-5" />
              Adicionar Evento
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className={cn(
              "grid w-full",
              user?.isAdmin 
                ? (isMobile ? "grid-cols-4 min-w-[500px]" : "grid-cols-4") 
                : (isMobile ? "grid-cols-3 min-w-[500px]" : "grid-cols-3")
            )}>
              <TabsTrigger value="eventos">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="mapa">
                <MapPin className="mr-2 h-4 w-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="solicitar">
                <Send className="mr-2 h-4 w-4" />
                Solicitar
              </TabsTrigger>
              {user?.isAdmin && (
                <TabsTrigger value="adicionar">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="eventos" className="space-y-4">
            <EventList />
          </TabsContent>
          
          <TabsContent value="mapa" className="space-y-4">
            <Card className="p-0 overflow-hidden">
              <EventMap /> 
            </Card>
          </TabsContent>
          
          <TabsContent value="solicitar" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Solicite a Adição de um Evento</h2>
              <p className="text-muted-foreground mb-6">
                Preencha o formulário abaixo para solicitar a adição de um evento ecológico. 
                Nossa equipe irá revisar e aprovar sua solicitação em breve.
              </p>
              <EventForm isRequest={true} />
            </Card>
            
            {user && (
              <Card className="p-6">
                <MyEventRequests />
              </Card>
            )}
          </TabsContent>
          
          {user?.isAdmin && (
            <TabsContent value="adicionar" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Evento</h2>
                  <p className="text-muted-foreground mb-6">
                    Como administrador, você pode adicionar eventos diretamente ao mapa e à lista.
                  </p>
                  <EventForm isRequest={false} isAdmin={true} />
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Solicitações de Eventos</h2>
                  <p className="text-muted-foreground mb-6">
                    Gerencie as solicitações de eventos enviadas pelos usuários.
                  </p>
                  <EventRequests />
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
