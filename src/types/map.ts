
export interface MapPoint {
  id: number;
  name: string;
  type: 'recycling-point' | 'recycling-center' | 'seedling-distribution' | 'plant-sales' | 'lamp-collection';
  lat: number;
  lng: number;
  description: string;
  impact: string;
  address?: string;
}

export interface NewPoint extends Omit<MapPoint, 'id' | 'lat' | 'lng'> {
  address: string;
}
