
import { useState, useEffect, useCallback } from 'react';
import { firebaseFirestore } from '@/services/firebaseFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventStatus } from '@/types/events';
import { toast } from 'sonner';

// Define event types
export interface EventRequest {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  organizer: string;
  createdBy?: string;
  status?: EventStatus;
  createdAt?: string;
}

export const useEventStore = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedEvents = await firebaseFirestore.events.getAll();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching events'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new event
  const addEvent = async (eventData: Omit<Event, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.isAdmin) {
      toast.error('Você precisa ser administrador para adicionar eventos');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newEvent = await firebaseFirestore.events.add({
        ...eventData,
        status: EventStatus.APPROVED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setEvents(prev => [newEvent, ...prev]);
      toast.success('Evento adicionado com sucesso!');
      return newEvent;
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding event'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update event
  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    if (!user?.isAdmin) {
      toast.error('Você precisa ser administrador para editar eventos');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await firebaseFirestore.events.update(id, {
        ...eventData,
        updatedAt: new Date().toISOString()
      });
      
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...eventData, updatedAt: new Date().toISOString() } : event
      ));
      
      toast.success('Evento atualizado com sucesso!');
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating event'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    if (!user?.isAdmin) {
      toast.error('Você precisa ser administrador para remover eventos');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await firebaseFirestore.events.delete(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      
      toast.success('Evento removido com sucesso!');
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting event'));
      toast.error('Erro ao remover evento');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Event request functions
  const addEventRequest = async (requestData: Omit<EventRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const request = await firebaseFirestore.eventRequests.add({
        ...requestData,
        status: EventStatus.PENDING,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Solicitação de evento enviada com sucesso!');
      return request;
    } catch (err) {
      console.error('Error adding event request:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding event request'));
      toast.error('Erro ao solicitar evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    addEventRequest,
    refreshEvents: fetchEvents
  };
};
