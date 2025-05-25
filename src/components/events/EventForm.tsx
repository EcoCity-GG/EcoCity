
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEventStore } from '@/hooks/useEventStore';

interface EventFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  address: string;
  organizer: string;
}

interface EventFormProps {
  isRequest: boolean;
  isAdmin?: boolean;
  eventToEdit?: EventFormData & { id: string };
}

export const EventForm = ({ isRequest, eventToEdit }: EventFormProps) => {
  const { user } = useAuth();
  const { addEventRequest, addEvent, updateEvent } = useEventStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EventFormData>({
    defaultValues: eventToEdit ? {
      title: eventToEdit.title,
      description: eventToEdit.description,
      date: new Date(eventToEdit.date),
      time: eventToEdit.time,
      address: eventToEdit.address,
      organizer: eventToEdit.organizer
    } : {
      title: '',
      description: '',
      date: new Date(),
      time: '08:00',
      address: '',
      organizer: user?.name || ''
    }
  });
  
  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      const eventData = {
        ...data,
        date: data.date.toISOString().split('T')[0],
        createdBy: user?.id || 'anonymous',
        createdAt: new Date().toISOString()
      };
      
      if (isRequest) {
        await addEventRequest(eventData);
        toast.success("Solicitação enviada com sucesso! Aguarde a aprovação de um administrador.");
        form.reset({
          title: '',
          description: '',
          date: new Date(),
          time: '08:00',
          address: '',
          organizer: user?.name || ''
        });
      } else if (eventToEdit) {
        await updateEvent(eventToEdit.id, eventData);
        toast.success("Evento atualizado com sucesso!");
      } else {
        await addEvent(eventData);
        toast.success("Evento adicionado com sucesso!");
        form.reset({
          title: '',
          description: '',
          date: new Date(),
          time: '08:00',
          address: '',
          organizer: user?.name || ''
        });
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      toast.error("Erro ao processar o evento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Plantio de Árvores no Parque" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Evento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Avenida Manoel Goulart, 1000 - Centro" {...field} />
              </FormControl>
              <FormDescription>
                Digite o endereço completo para que possamos marcar corretamente no mapa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="organizer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizador</FormLabel>
              <FormControl>
                <Input placeholder="Nome da organização ou responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Evento</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva os detalhes do evento, como atividades planejadas, objetivo e público-alvo." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-eco-green hover:bg-eco-green-dark"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRequest ? "Enviar Solicitação" : eventToEdit ? "Atualizar Evento" : "Adicionar Evento"}
        </Button>
      </form>
    </Form>
  );
};
