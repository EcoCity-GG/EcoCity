
export interface MapPoint {
  id: number | string;
  firebaseId?: string; // Firebase document ID
  name: string;
  type: string;
  lat: number;
  lng: number;
  description: string;
  impact: string;
  address: string;
}
