
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Recycle, TreeDeciduous, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMapPoints } from '@/hooks/useMapPoints';
import { cn } from '@/lib/utils';
import { MapPoint } from '@/types/map';

const MapSummary = () => {
  const { mapPoints, isLoading } = useMapPoints();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredPoints = mapPoints.filter(point => {
    const matchesSearch = 
      point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (point.address && point.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesFilter = activeFilter === 'all' || point.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getPointIcon = (type: string) => {
    switch (type) {
      case 'recycling-point':
        return <MapPin className="h-5 w-5 text-eco-green" />;
      case 'recycling-center':
        return <Recycle className="h-5 w-5 text-eco-blue" />;
      case 'seedling-distribution':
        return <TreeDeciduous className="h-5 w-5 text-eco-brown" />;
      default:
        return <MapPin className="h-5 w-5 text-eco-green" />;
    }
  };

  const getPointColor = (type: string) => {
    switch (type) {
      case 'recycling-point':
        return 'border-eco-green';
      case 'recycling-center':
        return 'border-eco-blue';
      case 'seedling-distribution':
        return 'border-eco-brown';
      default:
        return 'border-eco-green';
    }
  };

  const getPointTypeLabel = (type: string) => {
    switch (type) {
      case 'recycling-point':
        return 'Ponto de Reciclagem';
      case 'recycling-center':
        return 'Centro de Reciclagem';
      case 'seedling-distribution':
        return 'Distribuição de Mudas';
      default:
        return 'Ponto Ecológico';
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <div className="flex flex-col space-y-4">
          <Link to="/map" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para o Mapa</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-eco-green-dark">
            Sumário dos Pontos Ecológicos
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Explore informações detalhadas sobre os pontos ecológicos disponíveis em nossa cidade.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-6 mb-8">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar pontos por nome, descrição ou endereço..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'} 
              className={activeFilter === 'all' ? 'bg-eco-green hover:bg-eco-green-dark' : ''}
              onClick={() => setActiveFilter('all')}
            >
              Todos
            </Button>
            <Button 
              variant={activeFilter === 'recycling-point' ? 'default' : 'outline'}
              className={activeFilter === 'recycling-point' ? 'bg-eco-green hover:bg-eco-green-dark' : ''}
              onClick={() => setActiveFilter('recycling-point')}
            >
              <MapPin className="mr-1 h-4 w-4" />
              Pontos de Reciclagem
            </Button>
            <Button 
              variant={activeFilter === 'recycling-center' ? 'default' : 'outline'}
              className={activeFilter === 'recycling-center' ? 'bg-eco-blue hover:bg-eco-blue-dark' : ''}
              onClick={() => setActiveFilter('recycling-center')}
            >
              <Recycle className="mr-1 h-4 w-4" />
              Centros de Reciclagem
            </Button>
            <Button 
              variant={activeFilter === 'seedling-distribution' ? 'default' : 'outline'}
              className={activeFilter === 'seedling-distribution' ? 'bg-eco-brown hover:bg-eco-brown/80' : ''}
              onClick={() => setActiveFilter('seedling-distribution')}
            >
              <TreeDeciduous className="mr-1 h-4 w-4" />
              Distribuição de Mudas
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="bg-eco-sand/30 rounded-lg p-8 text-center my-8">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Nenhum ponto encontrado</h2>
            <p className="text-muted-foreground">
              Tente ajustar seus filtros ou termos de busca para encontrar pontos ecológicos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {filteredPoints.map((point) => (
              <Card key={point.id} className={cn("overflow-hidden border-l-4", getPointColor(point.type))}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-eco-sand/50">
                        {getPointIcon(point.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{point.name}</h3>
                        <span className="text-sm text-muted-foreground">{getPointTypeLabel(point.type)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p>{point.description}</p>
                    
                    {point.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{point.address}</span>
                      </div>
                    )}
                    
                    {point.impact && (
                      <div className="mt-4">
                        <h4 className="font-medium text-eco-green-dark mb-1">Impacto Ambiental:</h4>
                        <p className="text-sm bg-eco-green-light/10 p-3 rounded-md">
                          {point.impact}
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Link to={`/map?point=${point.id}`}>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Ver no Mapa
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSummary;
