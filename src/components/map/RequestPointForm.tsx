
import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMapPointRequests } from '@/hooks/useMapPointRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const RequestPointForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createRequest, isLoading } = useMapPointRequests();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('recycling-point');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para solicitar pontos.");
      navigate("/login");
      return;
    }
    
    if (!name || !type || !address || !description) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    try {
      await createRequest({
        name,
        type: type as 'recycling-point' | 'recycling-center' | 'seedling-distribution' | 'plant-sales' | 'lamp-collection' | 'oil-collection' | 'medicine-collection' | 'electronics-donation',
        description,
        impact,
        address,
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating map point request:", error);
      toast.error("Erro ao criar solicitação. Tente novamente mais tarde.");
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Solicitar Novo Ponto Ecológico</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para solicitar a adição de um novo ponto ecológico no mapa. Sua solicitação será analisada por um administrador.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="name" className="font-medium">Nome do Ponto*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ponto de Coleta Vila Marcondes"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Escolha um nome descritivo e claro
            </p>
          </div>
          
          <div>
            <Label htmlFor="type" className="font-medium">Tipo de Ponto*</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de ponto" />
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
          
          <div>
            <Label htmlFor="address" className="font-medium">Endereço Completo*</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. Brasil, 500, Centro - Presidente Prudente"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Informe o endereço completo para que possamos localizar no mapa
            </p>
          </div>
          
          <div>
            <Label htmlFor="description" className="font-medium">Descrição*</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o ponto ecológico e seu propósito"
              rows={3}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="impact" className="font-medium">Impacto Ambiental</Label>
            <Textarea
              id="impact"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="Descreva qual é o impacto ambiental positivo deste ponto"
              rows={2}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Campo opcional
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-eco-green hover:bg-eco-green-dark"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
