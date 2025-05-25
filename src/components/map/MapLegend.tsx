
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from "@/lib/utils";

export const MapLegend = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-eco-green-light/30 z-20",
      isMobile ? "max-w-[calc(100%-2rem)] text-xs" : ""
    )}>
      <h4 className="text-sm font-medium mb-2">Legenda</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-eco-green shadow-sm flex-shrink-0"></div>
          <span className="line-clamp-2">{t('Ponto Reciclagem')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-eco-blue shadow-sm flex-shrink-0"></div>
          <span className="line-clamp-2">{t('Ponto Lixo Eletrônico')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-eco-brown shadow-sm flex-shrink-0"></div>
          <span className="line-clamp-2">{t('Ponto Distribuição de Mudas')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600 shadow-sm flex-shrink-0"></div>
          <span className="line-clamp-2">Venda de Mudas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm flex-shrink-0"></div>
          <span className="line-clamp-2">Coleta de Lâmpadas</span>
        </div>
      </div>
    </div>
  );
};
