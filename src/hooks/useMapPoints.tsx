
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MapPoint } from '@/types/map';
import { geocodeAddress } from '@/services/geocoding';
import { firebaseFirestore } from '@/services/firebaseFirestore';
import { auth } from '@/services/firebaseConfig';

export const useMapPoints = () => {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchMapPoints = async () => {
    try {
      setIsLoading(true);
      console.log('useMapPoints - Fetching points from Firebase');
      const points = await firebaseFirestore.mapPoints.getAll();
      console.log('useMapPoints - Fetched points:', points);
      setMapPoints(points);
    } catch (err) {
      console.error('useMapPoints - Error fetching points:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching points'));
      
      // Fallback to empty array
      setMapPoints([]);
      toast.warning("Erro ao carregar pontos do mapa. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const addMapPoint = async (newPoint: Omit<MapPoint, 'id' | 'lat' | 'lng'> & { address: string }): Promise<MapPoint | null> => {
    console.log('useMapPoints - Auth state check:', { 
      user, 
      currentUser: auth.currentUser,
      isAdmin: user?.isAdmin 
    });

    // First check if Firebase Auth has the current user
    if (!auth.currentUser) {
      console.error('useMapPoints - No Firebase Auth currentUser');
      toast.error("Você precisa estar logado para adicionar pontos.");
      return null;
    }

    // Then check if our context user exists and is admin
    if (!user) {
      console.error('useMapPoints - No context user');
      toast.error("Dados do usuário não carregados. Tente novamente.");
      return null;
    }
    
    if (!user.isAdmin) {
      console.error('useMapPoints - User is not admin:', user);
      toast.error("Apenas administradores podem adicionar pontos diretamente. Use 'Solicitar Novo Ponto' para enviar uma solicitação.");
      return null;
    }
    
    try {
      setIsLoading(true);
      console.log('useMapPoints - Starting geocoding for address:', newPoint.address);
      
      const geoLocation = await geocodeAddress(newPoint.address);
      
      if (!geoLocation) {
        toast.error("Endereço não encontrado. Por favor, verifique e tente novamente");
        return null;
      }
      
      console.log('useMapPoints - Geocoding successful:', geoLocation);
      
      // Prepare data to be saved
      const pointToSave = {
        name: newPoint.name,
        type: newPoint.type,
        lat: geoLocation.lat,
        lng: geoLocation.lng,
        description: newPoint.description,
        impact: newPoint.impact || "Impacto ambiental não especificado.",
        address: newPoint.address,
        createdBy: auth.currentUser.uid // Add the user ID who created the point
      };
      
      console.log('useMapPoints - Attempting to save point:', pointToSave);
      
      // Use Firebase to add the point
      const createdPoint = await firebaseFirestore.mapPoints.add(pointToSave);
      
      console.log('useMapPoints - Created point:', createdPoint);
      setMapPoints(prev => [...prev, createdPoint]);
      toast.success("Ponto ecológico salvo com sucesso!");
      return createdPoint;
    } catch (err: any) {
      console.error('useMapPoints - Error adding point:', err);
      
      // Handle specific Firebase permission errors
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        toast.error("Erro de permissão: Verifique se você está logado como administrador e se as regras do Firebase permitem esta operação.");
      } else if (err.code === 'unavailable') {
        toast.error("Serviço temporariamente indisponível. Tente novamente em alguns instantes.");
      } else {
        toast.error("Erro ao salvar o ponto: " + (err.message || 'Erro desconhecido'));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMapPoint = async (pointId: number): Promise<boolean> => {
    console.log('useMapPoints - Delete request for point:', pointId);
    console.log('useMapPoints - Auth state check:', { 
      user, 
      currentUser: auth.currentUser,
      isAdmin: user?.isAdmin 
    });

    // Check Firebase Auth
    if (!auth.currentUser) {
      console.error('useMapPoints - No Firebase Auth currentUser for delete');
      toast.error("Você precisa estar logado para remover pontos.");
      return false;
    }

    // Check context user admin status
    if (!user?.isAdmin) {
      console.error('useMapPoints - User is not admin for delete:', user);
      toast.error("Você precisa ser administrador para remover pontos.");
      return false;
    }

    try {
      setIsLoading(true);
      
      console.log('useMapPoints - Attempting to delete point with numeric ID:', pointId);
      
      // Find the point to get its Firebase document ID
      const pointToDelete = mapPoints.find(point => point.id === pointId);
      if (!pointToDelete) {
        console.error('useMapPoints - Point not found in local state:', pointId);
        toast.error("Ponto não encontrado.");
        return false;
      }
      
      // Use the Firebase document ID for deletion
      const firebaseId = pointToDelete.firebaseId;
      if (!firebaseId) {
        console.error('useMapPoints - No Firebase ID found for point:', pointToDelete);
        toast.error("ID do documento não encontrado.");
        return false;
      }
      
      console.log('useMapPoints - Using Firebase document ID for deletion:', firebaseId);
      
      // Use Firebase to delete the point
      await firebaseFirestore.mapPoints.delete(firebaseId);
      console.log('useMapPoints - Point deleted from Firebase successfully');

      // Update the local state immediately
      setMapPoints(prev => {
        const updated = prev.filter(point => point.id !== pointId);
        console.log('useMapPoints - Updated local state, removed point:', pointId);
        console.log('useMapPoints - Remaining points:', updated.length);
        return updated;
      });
      
      toast.success("Ponto removido com sucesso!");
      return true;
    } catch (err: any) {
      console.error('useMapPoints - Error deleting point:', err);
      
      // Handle specific Firebase permission errors
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        toast.error("Erro de permissão: Verifique se você está logado como administrador e se as regras do Firebase permitem esta operação.");
      } else if (err.code === 'unavailable') {
        toast.error("Serviço temporariamente indisponível. Tente novamente em alguns instantes.");
      } else {
        toast.error("Erro ao remover o ponto: " + (err.message || 'Erro desconhecido'));
      }
      
      // Refresh the points to ensure consistency
      await fetchMapPoints();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapPoints();
  }, []);

  return {
    mapPoints,
    addMapPoint,
    deleteMapPoint,
    isLoading,
    error,
    refreshPoints: fetchMapPoints
  };
};
