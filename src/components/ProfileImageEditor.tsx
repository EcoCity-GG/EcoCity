
import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { X, Move, ZoomIn } from 'lucide-react';

interface ProfileImageEditorProps {
  image: File | string;
  onSave: (canvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

export const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({
  image,
  onSave,
  onCancel
}) => {
  const [scale, setScale] = useState(1.2);
  const editorRef = useRef<AvatarEditor | null>(null);
  
  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      onSave(canvas);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ajustar Imagem</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={250}
            height={250}
            border={0}
            borderRadius={125}
            color={[255, 255, 255, 0.6]} // RGBA
            scale={scale}
            rotate={0}
          />
        </div>
        
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="zoom-slider" className="text-sm flex items-center">
              <ZoomIn className="h-4 w-4 mr-1" /> Zoom
            </Label>
            <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
          </div>
          <Slider
            id="zoom-slider"
            min={1}
            max={3}
            step={0.01}
            value={[scale]}
            onValueChange={(values) => setScale(values[0])}
          />
        </div>
        
        <div className="text-sm text-center text-muted-foreground flex items-center justify-center">
          <Move className="h-4 w-4 mr-1" /> Arraste a imagem para ajustar a posição
        </div>
        
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className="w-1/2 bg-eco-green hover:bg-eco-green-dark"
            onClick={handleSave}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageEditor;
