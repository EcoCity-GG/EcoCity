
import { useState, useEffect } from 'react';
import { MapPin, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPoint } from '@/types/map';
import { firebaseFirestore } from '@/services/firebaseFirestore';

interface EditMapPointFormProps {
  point: MapPoint;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditMapPointForm = ({ point, onSuccess, onCancel }: EditMapPointFormProps) => {
  const [formData, setFormData] = useState({
    name: point.name || '',
    type: point.type || '',
    description: point.description || '',
    address: point.address || '',
    impact: point.impact || '',
    openingHours: point.openingHours || '',
    contact: point.contact || '',
    website: point.website || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type || !formData.description.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!point.firebaseId) {
        toast.error('ID do ponto não encontrado.');
        return;
      }

      await firebaseFirestore.mapPoints.update(point.firebaseId, {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        address: formData.address.trim(),
        impact: formData.impact.trim(),
        openingHours: formData.openingHours.trim(),
        contact: formData.contact.trim(),
        website: formData.website.trim()
      });

      toast.success('Ponto atualizado com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar ponto:', error);
      toast.error('Erro ao atualizar ponto: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Editar Ponto Ecológico
        </CardTitle>
        <CardDescription>
          Edite as informações do ponto selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Ponto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Ponto de Coleta Zona Norte"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo do Ponto *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recycling-point">Ponto de Reciclagem</SelectItem>
                  <SelectItem value="recycling-center">Ponto de Lixo Eletrônico</SelectItem>
                  <SelectItem value="seedling-distribution">Distribuição de Mudas</SelectItem>
                  <SelectItem value="plant-sales">Venda de Mudas</SelectItem>
                  <SelectItem value="lamp-collection">Coleta de Lâmpadas</SelectItem>
                  <SelectItem value="oil-collection">Coleta de Óleo</SelectItem>
                  <SelectItem value="medicine-collection">Coleta de Cartela de Remédio</SelectItem>
                  <SelectItem value="electronics-donation">Doação de Eletrônicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o ponto ecológico..."
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Ex: Rua das Flores, 123, Centro"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingHours">Horário de Funcionamento</Label>
              <Input
                id="openingHours"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                placeholder="Ex: Seg-Sex: 8h às 17h"
              />
            </div>

            <div>
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="Ex: (11) 1234-5678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="Ex: https://exemplo.com"
              type="url"
            />
          </div>

          <div>
            <Label htmlFor="impact">Impacto Ambiental</Label>
            <Textarea
              id="impact"
              value={formData.impact}
              onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
              placeholder="Descreva o impacto ambiental positivo..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
