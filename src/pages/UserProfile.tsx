import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Edit, Image, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ProfileImageEditor } from '@/components/ProfileImageEditor';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { uploadImage, uploadProgress, isUploading } = useImageUpload();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setName(user.name || '');
    setBio(user.bio || '');
  }, [user, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type before processing
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não suportado. Use apenas JPG, PNG ou WebP');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('A imagem deve ter no máximo 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setPhotoFile(file);
      setShowImageEditor(true);
    }
  };

  const handleImageSave = (canvas: HTMLCanvasElement) => {
    // Convert canvas to blob/file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], photoFile?.name || 'profile.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now() 
        });
        
        setPhotoFile(file);
        setPhotoPreview(canvas.toDataURL('image/jpeg'));
        setShowImageEditor(false);
      }
    }, 'image/jpeg', 0.95);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload photo if changed
      let photoURL = user?.photoURL || '';
      
      if (photoFile && user) {
        console.log('Uploading new profile image...');
        const uploadedUrl = await uploadImage(photoFile, user.id, user.photoURL);
        if (uploadedUrl) {
          photoURL = uploadedUrl;
          console.log('Image uploaded successfully:', uploadedUrl);
        } else {
          toast.error('Erro ao fazer upload da imagem');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare update data - only include fields that are defined
      const updateData: { name?: string; bio?: string; photoURL?: string } = {};
      
      // Only include name if it's different and not empty
      if (name && name.trim() !== '' && name !== user?.name) {
        updateData.name = name.trim();
      }
      
      // Always include bio (can be empty string)
      updateData.bio = bio;
      
      // Only include photoURL if it's different
      if (photoURL !== user?.photoURL) {
        updateData.photoURL = photoURL;
      }
      
      console.log('Updating profile with data:', updateData);
      
      // Update profile
      const success = await updateUserProfile(updateData);
      
      if (success) {
        setIsEditing(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar o perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) return null;
  
  // If image editor is active, show that instead of the regular form
  if (showImageEditor && photoFile) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <div className="container px-4 py-8">
          <div className="max-w-md mx-auto">
            <ProfileImageEditor
              image={photoFile}
              onSave={handleImageSave}
              onCancel={() => {
                setShowImageEditor(false);
                setPhotoFile(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Início</span>
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-eco-green-dark">
            Perfil do Usuário
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Visualize e edite suas informações pessoais
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    {photoPreview ? (
                      <AvatarImage src={photoPreview} alt={name} />
                    ) : user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-eco-green text-4xl text-white">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-xl">{user.name || 'Usuário'}</h3>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                    {user.isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-eco-green text-white">
                        Administrador
                      </span>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? "Atualize suas informações pessoais abaixo."
                    : "Visualize suas informações pessoais."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Digite seu nome"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Conte um pouco sobre você..."
                          rows={5}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="photo" className="block mb-2">Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="w-20 h-20">
                            {photoPreview ? (
                              <AvatarImage src={photoPreview} alt={name} />
                            ) : user.photoURL ? (
                              <AvatarImage src={user.photoURL} alt={user.name} />
                            ) : (
                              <AvatarFallback className="bg-eco-green text-3xl text-white">
                                {name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className="flex-1">
                            <Input
                              id="photo"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handlePhotoChange}
                              className="cursor-pointer"
                              disabled={isUploading}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Apenas JPG, PNG ou WebP. Máximo 5MB. Você poderá ajustar após selecionar.
                            </p>
                            {isUploading && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-eco-green h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Enviando: {Math.round(uploadProgress)}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setName(user.name || '');
                          setBio(user.bio || '');
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        disabled={isSubmitting || isUploading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      
                      <Button
                        type="submit"
                        className="bg-eco-green hover:bg-eco-green-dark"
                        disabled={isSubmitting || isUploading}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Email</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Biografia</h3>
                      {user.bio ? (
                        <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          Nenhuma biografia adicionada. Clique em "Editar Perfil" para adicionar.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
