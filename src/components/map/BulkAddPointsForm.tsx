
import { useState } from 'react';
import { Upload, Download, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useMapPoints } from '@/hooks/useMapPoints';

interface BulkPointData {
  name: string;
  type: string;
  description: string;
  address: string;
  impact: string;
  openingHours: string;
  contact: string;
  website: string;
}

export const BulkAddPointsForm = () => {
  const { addMapPoint } = useMapPoints();
  const [points, setPoints] = useState<BulkPointData[]>([{
    name: '',
    type: '',
    description: '',
    address: '',
    impact: '',
    openingHours: '',
    contact: '',
    website: ''
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addNewPoint = () => {
    setPoints(prev => [...prev, {
      name: '',
      type: '',
      description: '',
      address: '',
      impact: '',
      openingHours: '',
      contact: '',
      website: ''
    }]);
  };

  const removePoint = (index: number) => {
    if (points.length > 1) {
      setPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePoint = (index: number, field: keyof BulkPointData, value: string) => {
    setPoints(prev => prev.map((point, i) => 
      i === index ? { ...point, [field]: value } : point
    ));
  };

  const downloadTemplate = () => {
    const template = [
      'name,type,description,address,impact,openingHours,contact,website',
      'Ponto Exemplo,recycling-point,Descrição do ponto,Rua Exemplo 123,Impacto positivo,Seg-Sex 8h-17h,(11) 1234-5678,https://exemplo.com'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_pontos_ecologicos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const newPoints: BulkPointData[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length === headers.length && values[0].trim()) {
            newPoints.push({
              name: values[0]?.trim() || '',
              type: values[1]?.trim() || '',
              description: values[2]?.trim() || '',
              address: values[3]?.trim() || '',
              impact: values[4]?.trim() || '',
              openingHours: values[5]?.trim() || '',
              contact: values[6]?.trim() || '',
              website: values[7]?.trim() || ''
            });
          }
        }
        
        if (newPoints.length > 0) {
          setPoints(newPoints);
          toast.success(`${newPoints.length} pontos carregados do arquivo CSV!`);
        }
      } catch (error) {
        toast.error('Erro ao processar arquivo CSV. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    const validPoints = points.filter(point => 
      point.name.trim() && point.type && point.description.trim() && point.address.trim()
    );

    if (validPoints.length === 0) {
      toast.error('Pelo menos um ponto deve ter nome, tipo, descrição e endereço preenchidos.');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const point of validPoints) {
      try {
        await addMapPoint({
          name: point.name.trim(),
          type: point.type,
          description: point.description.trim(),
          address: point.address.trim(),
          impact: point.impact.trim() || 'Impacto ambiental positivo.',
          openingHours: point.openingHours.trim(),
          contact: point.contact.trim(),
          website: point.website.trim()
        });
        successCount++;
      } catch (error) {
        console.error('Erro ao adicionar ponto:', error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} pontos adicionados com sucesso!`);
      setPoints([{
        name: '',
        type: '',
        description: '',
        address: '',
        impact: '',
        openingHours: '',
        contact: '',
        website: ''
      }]);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} pontos falharam ao ser adicionados.`);
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Múltiplos Pontos
        </CardTitle>
        <CardDescription>
          Adicione vários pontos ecológicos de uma vez usando o formulário ou importando um arquivo CSV.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Baixar Template CSV
          </Button>
          <div className="flex-1">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Importar CSV
                </span>
              </Button>
            </Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          {points.map((point, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Ponto {index + 1}</h4>
                {points.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Ponto *</Label>
                  <Input
                    value={point.name}
                    onChange={(e) => updatePoint(index, 'name', e.target.value)}
                    placeholder="Ex: Ponto de Coleta Norte"
                  />
                </div>

                <div>
                  <Label>Tipo *</Label>
                  <Select value={point.type} onValueChange={(value) => updatePoint(index, 'type', value)}>
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

                <div className="md:col-span-2">
                  <Label>Descrição *</Label>
                  <Textarea
                    value={point.description}
                    onChange={(e) => updatePoint(index, 'description', e.target.value)}
                    placeholder="Descreva o ponto ecológico..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Endereço *</Label>
                  <Input
                    value={point.address}
                    onChange={(e) => updatePoint(index, 'address', e.target.value)}
                    placeholder="Ex: Rua das Flores, 123, Centro"
                  />
                </div>

                <div>
                  <Label>Horário de Funcionamento</Label>
                  <Input
                    value={point.openingHours}
                    onChange={(e) => updatePoint(index, 'openingHours', e.target.value)}
                    placeholder="Ex: Seg-Sex: 8h às 17h"
                  />
                </div>

                <div>
                  <Label>Contato</Label>
                  <Input
                    value={point.contact}
                    onChange={(e) => updatePoint(index, 'contact', e.target.value)}
                    placeholder="Ex: (11) 1234-5678"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Website</Label>
                  <Input
                    value={point.website}
                    onChange={(e) => updatePoint(index, 'website', e.target.value)}
                    placeholder="Ex: https://exemplo.com"
                    type="url"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Impacto Ambiental</Label>
                  <Textarea
                    value={point.impact}
                    onChange={(e) => updatePoint(index, 'impact', e.target.value)}
                    placeholder="Descreva o impacto ambiental positivo..."
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={addNewPoint} className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Outro Ponto
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Salvando...' : `Salvar ${points.length} Ponto(s)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
