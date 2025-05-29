
export enum EventStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CreateEventRequestData {
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  organizer: string;
}
