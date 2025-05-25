
import { MapPoint } from '@/types/map';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface PointDetailsProps {
  selectedPoint: MapPoint;
  setSelectedPoint: (point: MapPoint | null) => void;
  handleDeletePoint: (pointId: number) => void;
  centerOnPoint: (lat: number, lng: number) => void;
  typeInfo: {
    [key: string]: { 
      label: string;
      color: string; 
      description: string;
    }
  };
  getMarkerIcon: (type: string) => JSX.Element;
}

export const PointDetails = ({
  selectedPoint,
  setSelectedPoint,
  handleDeletePoint,
  centerOnPoint,
  typeInfo,
  getMarkerIcon
}: PointDetailsProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const pointType = selectedPoint.type as keyof typeof typeInfo;
  
  return (
    <div className={cn(
      "absolute right-4 bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-lg border border-eco-green-light/30 z-20",
      isMobile ? "bottom-16 left-4" : "bottom-4 max-w-md"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${typeInfo[pointType]?.color || 'bg-eco-green'}`}>
            <div className="text-white">
              {getMarkerIcon(pointType)}
            </div>
          </div>
          <h3 className="font-medium truncate max-w-[180px] md:max-w-xs">{selectedPoint.name}</h3>
        </div>
        <button 
          onClick={() => setSelectedPoint(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="mt-3 space-y-2 text-sm">
        <p>{selectedPoint.description}</p>
        
        {selectedPoint.address && (
          <div className="flex items-start gap-2 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-eco-green-dark mt-0.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{selectedPoint.address}</span>
          </div>
        )}
        
        {selectedPoint.impact && (
          <div className="mt-2 p-2 bg-eco-green-light/10 rounded">
            <div className="font-medium text-eco-green-dark">Impacto Ambiental:</div>
            <p>{selectedPoint.impact}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => centerOnPoint(selectedPoint.lat, selectedPoint.lng)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
          Centralizar
        </Button>
        
        {user?.isAdmin && (
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => handleDeletePoint(selectedPoint.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
};
