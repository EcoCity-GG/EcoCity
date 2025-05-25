
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from 'lucide-react';

export const AddPointForm = ({ 
  newPointForm, 
  setNewPointForm, 
  newPointPosition,
  setNewPointPosition,
  setIsAddingPoint,
  handleAddNewPoint
}: { 
  newPointForm: any;
  setNewPointForm: (value: any) => void;
  newPointPosition: {lat: number, lng: number} | null;
  setNewPointPosition: (value: {lat: number, lng: number} | null) => void;
  setIsAddingPoint: (value: boolean) => void;
  handleAddNewPoint: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPointForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setNewPointForm(prev => ({ 
      ...prev, 
      type: value as 'recycling-point' | 'recycling-center' | 'seedling-distribution' | 'plant-sales' | 'lamp-collection'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await handleAddNewPoint();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 w-full max-w-md bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-lg border border-eco-green/30 z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Adicionar Novo Ponto</h3>
        <button 
          onClick={() => setIsAddingPoint(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Ponto*</Label>
          <Input
            id="name"
            name="name"
            value={newPointForm.name}
            onChange={handleChange}
            placeholder="Ex: Ponto de Coleta Centro"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Tipo de Ponto*</Label>
          <Select
            value={newPointForm.type}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recycling-point">Ponto de Coleta de Recicláveis</SelectItem>
              <SelectItem value="recycling-center">Ponto de Coleta de Lixo Eletrônico</SelectItem>
              <SelectItem value="seedling-distribution">Ponto de Distribuição de Mudas</SelectItem>
              <SelectItem value="plant-sales">Venda de Mudas</SelectItem>
              <SelectItem value="lamp-collection">Coleta de Lâmpadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="address">Endereço*</Label>
          <Input
            id="address"
            name="address"
            value={newPointForm.address}
            onChange={handleChange}
            placeholder="Ex: Av. Brasil, 500, Centro - Presidente Prudente"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Informe o endereço completo para que possamos localizar no mapa.
          </p>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição*</Label>
          <Textarea
            id="description"
            name="description"
            value={newPointForm.description}
            onChange={handleChange}
            placeholder="Descreva o ponto ecológico..."
            rows={3}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="impact">Impacto Ambiental</Label>
          <Textarea
            id="impact"
            name="impact"
            value={newPointForm.impact}
            onChange={handleChange}
            placeholder="Descreva o impacto ambiental deste ponto..."
            rows={2}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddingPoint(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-eco-green hover:bg-eco-green-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Ponto'}
          </Button>
        </div>
      </form>
    </div>
  );
};
