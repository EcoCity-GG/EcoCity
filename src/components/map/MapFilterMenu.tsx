
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MapFilterMenuProps {
  filter: string;
  setFilter: (filter: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

export const MapFilterMenu = ({ 
  filter, 
  setFilter, 
  isFilterOpen, 
  setIsFilterOpen 
}: MapFilterMenuProps) => {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center gap-2 py-2 px-4 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 hover:bg-eco-green-light/10"
      >
        <Filter className="h-4 w-4" />
        <span>Filtrar</span>
      </button>
      
      {isFilterOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-30">
          <div className="p-2">
            <button
              onClick={() => { setFilter('all'); setIsFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md",
                filter === 'all' ? "bg-eco-green-light/20 text-eco-green-dark" : "hover:bg-eco-green-light/10"
              )}
            >
              Todos os Pontos
            </button>
            
            <button
              onClick={() => { setFilter('recycling-point'); setIsFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md flex items-center gap-2",
                filter === 'recycling-point' ? "bg-eco-green-light/20 text-eco-green-dark" : "hover:bg-eco-green-light/10"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-eco-green"></div>
              {t('recycling-point')}
            </button>
            
            <button
              onClick={() => { setFilter('recycling-center'); setIsFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md flex items-center gap-2",
                filter === 'recycling-center' ? "bg-eco-green-light/20 text-eco-green-dark" : "hover:bg-eco-green-light/10"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-eco-blue"></div>
              {t('recycling-center')}
            </button>
            
            <button
              onClick={() => { setFilter('seedling-distribution'); setIsFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md flex items-center gap-2",
                filter === 'seedling-distribution' ? "bg-eco-green-light/20 text-eco-green-dark" : "hover:bg-eco-green-light/10"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-eco-brown"></div>
              {t('seedling-distribution')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
