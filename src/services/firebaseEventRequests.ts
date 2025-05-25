
import { EventStatus, EventRequest, CreateEventRequestData } from '@/types/events';
import { firebaseFirestore } from './firebaseFirestore';
import { useAuth } from '@/contexts/AuthContext';

// Get all event requests (admin only)
export const getAllEventRequests = async (): Promise<EventRequest[]> => {
  try {
    return await firebaseFirestore.eventRequests.getAll();
  } catch (error) {
    console.error('Error getting all event requests:', error);
    return [];
  }
};

// Get current user's event requests
export const getMyEventRequests = async (): Promise<EventRequest[]> => {
  // Get current user from session storage
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return [];
  
  const user = JSON.parse(currentUser);
  
  try {
    return await firebaseFirestore.eventRequests.getByUser(user.id);
  } catch (error) {
    console.error('Error getting user event requests:', error);
    return [];
  }
};

// Create new event request
export const createEventRequest = async (data: CreateEventRequestData): Promise<EventRequest> => {
  // Get current user from session storage
  const currentUser = sessionStorage.getItem('currentUser');
  let userId = 'anonymous';
  
  if (currentUser) {
    const user = JSON.parse(currentUser);
    userId = user.id;
  }
  
  try {
    const requestData: Omit<EventRequest, 'id'> = {
      ...data,
      createdBy: userId,
      status: EventStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    
    return await firebaseFirestore.eventRequests.add(requestData);
  } catch (error) {
    console.error('Error creating event request:', error);
    throw error;
  }
};

// Delete event request
export const deleteEventRequest = async (id: string): Promise<void> => {
  try {
    await firebaseFirestore.eventRequests.delete(id);
  } catch (error) {
    console.error('Error deleting event request:', error);
    throw error;
  }
};

// Approve event request
export const approveEventRequest = async (id: string): Promise<boolean> => {
  try {
    // 1. Get the request
    const requests = await firebaseFirestore.eventRequests.getAll();
    const request = requests.find(req => req.id === id);
    
    if (!request) {
      console.error(`Event request with ID ${id} not found`);
      return false;
    }
    
    // 2. Update request status
    await firebaseFirestore.eventRequests.update(id, { status: EventStatus.APPROVED });
    
    // 3. Create a new event from the request
    await firebaseFirestore.events.add({
      title: request.title,
      description: request.description,
      date: request.date,
      time: request.time,
      address: request.address,
      organizer: request.organizer,
      lat: 0, // These should be geocoded in a real implementation
      lng: 0,
      createdBy: request.createdBy,
      status: EventStatus.APPROVED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error approving event request:', error);
    return false;
  }
};

// Reject event request
export const rejectEventRequest = async (id: string): Promise<boolean> => {
  try {
    await firebaseFirestore.eventRequests.update(id, { status: EventStatus.REJECTED });
    return true;
  } catch (error) {
    console.error('Error rejecting event request:', error);
    return false;
  }
};
