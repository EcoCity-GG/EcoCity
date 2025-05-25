
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { geocodeAddress } from '@/services/geocoding';
import { firebaseFirestore } from '@/services/firebaseFirestore';
import { eventApi } from '@/services/api';

// Tipos
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  organizer: string;
  lat: number;
  lng: number;
  createdBy: string;
  createdAt: string;
}

export interface EventRequest {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  organizer: string;
  createdBy: string;
  createdAt: string;
}

export function useEventStore() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Buscar eventos na inicialização
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await eventApi.getAllEvents();
        if (response.success && response.data) {
          setEvents(response.data);
        } else {
          toast.error("Erro ao carregar eventos");
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error("Erro ao carregar eventos");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Buscar solicitações de eventos (somente admin)
  const fetchEventRequests = useCallback(async () => {
    if (!user?.isAdmin) {
      toast.error("Apenas administradores podem acessar solicitações de eventos");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await eventApi.getEventRequests();
      if (response.success && response.data) {
        setEventRequests(response.data);
      } else {
        toast.error("Erro ao carregar solicitações de eventos");
      }
    } catch (error) {
      console.error('Error fetching event requests:', error);
      toast.error("Erro ao carregar solicitações de eventos");
    } finally {
      setIsLoading(false);
    }
  }, [user?.isAdmin]);
  
  // Adicionar novo evento (somente admin)
  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'lat' | 'lng'>) => {
    if (!user?.isAdmin) {
      toast.error("Apenas administradores podem adicionar eventos");
      return;
    }
    
    setIsLoading(true);
    try {
      // Geocodificar o endereço para obter coordenadas
      const coordinates = await geocodeAddress(eventData.address);
      if (!coordinates) {
        toast.error("Não foi possível encontrar as coordenadas do endereço fornecido");
        return;
      }
      
      const response = await eventApi.addEvent({
        ...eventData,
        lat: coordinates.lat,
        lng: coordinates.lng
      });
      
      if (response.success && response.data) {
        setEvents(prev => [...prev, response.data!]);
        return response.data;
      } else {
        toast.error("Erro ao adicionar evento");
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error("Erro ao adicionar evento");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.isAdmin]);
  
  // Atualizar evento existente (somente admin)
  const updateEvent = useCallback(async (eventId: string, eventData: Omit<Event, 'id' | 'lat' | 'lng'>) => {
    if (!user?.isAdmin) {
      toast.error("Apenas administradores podem atualizar eventos");
      return;
    }
    
    setIsLoading(true);
    try {
      // Geocodificar o endereço para obter coordenadas
      const coordinates = await geocodeAddress(eventData.address);
      if (!coordinates) {
        toast.error("Não foi possível encontrar as coordenadas do endereço fornecido");
        return;
      }
      
      await firebaseFirestore.events.update(eventId, {
        ...eventData,
        lat: coordinates.lat,
        lng: coordinates.lng
      });
      
      // Buscar o evento atualizado
      const updatedEvent = await firebaseFirestore.events.getById(eventId);
      
      if (updatedEvent) {
        // Atualizar o estado local
        setEvents(prev => prev.map(event => 
          event.id === eventId ? updatedEvent : event
        ));
        
        return updatedEvent;
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Erro ao atualizar evento");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.isAdmin]);
  
  // Excluir evento (somente admin)
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user?.isAdmin) {
      toast.error("Apenas administradores podem excluir eventos");
      return;
    }
    
    try {
      await firebaseFirestore.events.delete(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("Erro ao excluir evento");
      return false;
    }
  }, [user?.isAdmin]);
  
  // Adicionar solicitação de evento (qualquer usuário)
  const addEventRequest = useCallback(async (requestData: Omit<EventRequest, 'id'>) => {
    setIsLoading(true);
    try {
      const response = await eventApi.addEventRequest(requestData);
      
      if (response.success && response.data) {
        setEventRequests(prev => [...prev, response.data!]);
        return response.data;
      } else {
        toast.error("Erro ao enviar solicitação de evento");
      }
    } catch (error) {
      console.error('Error adding event request:', error);
      toast.error("Erro ao enviar solicitação de evento");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Aprovar solicitação de evento (somente admin)
  const approveEventRequest = useCallback(async (requestId: string) => {
    if (!user?.isAdmin) {
      toast.error("Apenas administradores podem aprovar solicitações");
      return;
    }
    
    setIsLoading(true);
    try {
      // Buscar solicitação
      const requests = await firebaseFirestore.eventRequests.getAll();
      const request = requests.find(req => req.id === requestId);
      
      if (!request) {
        toast.error("Solicitação não encontrada");
        return;
      }
      
      // Geocodificar o endereço para obter coordenadas
      const coordinates = await geocodeAddress(request.address);
      if (!coordinates) {
        toast.error("Não foi possível encontrar as coordenadas do endereço fornecido");
        return;
      }
      
      // Criar novo evento a partir da solicitação
      const newEvent = await firebaseFirestore.events.add({
        title: request.title,
        description: request.description,
        date: request.date,
        time: request.time,
        address: request.address,
        organizer: request.organizer,
        lat: coordinates.lat,
        lng: coordinates.lng,
        createdBy: request.createdBy,
        createdAt: request.createdAt
      });
      
      // Adicionar o novo evento ao estado
      setEvents(prev => [...prev, newEvent]);
      
      // Excluir a solicitação
      await firebaseFirestore.eventRequests.delete(requestId);
      setEventRequests(prev => prev.filter(req => req.id !== requestId));
      
      return newEvent;
    } catch (error) {
      console.error('Error approving event request:', error);
      toast.error("Erro ao aprovar solicitação");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.isAdmin]);
  
  // Rejeitar solicitação de evento (somente admin)
  const rejectEventRequest = useCallback(async (requestId: string) => {
    if (!user?.isAdmin) {
      toast.error("Apenas administradores podem rejeitar solicitações");
      return;
    }
    
    try {
      await firebaseFirestore.eventRequests.delete(requestId);
      setEventRequests(prev => prev.filter(req => req.id !== requestId));
      return true;
    } catch (error) {
      console.error('Error rejecting event request:', error);
      toast.error("Erro ao rejeitar solicitação");
      return false;
    }
  }, [user?.isAdmin]);
  
  return {
    events,
    eventRequests,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    addEventRequest,
    fetchEventRequests,
    approveEventRequest,
    rejectEventRequest
  };
}
