
export enum EventStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  lat: number;
  lng: number;
  organizer: string;
  contactEmail?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}
