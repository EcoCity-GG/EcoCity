// useImageUpload.ts
import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '@/services/firebaseConfig'; // Agora auth e storage serão importados corretamente

import { toast } from 'sonner';

// As variáveis globais __app_id é fornecida automaticamente pelo ambiente Canvas.
declare const __app_id: string; // Para usar __app_id no hook

interface UseImageUploadReturn {
  uploadImage: (file: File, userId: string, oldImageUrl?: string) => Promise<string | null>;
  uploadProgress: number;
  isUploading: boolean;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File, userId: string, oldImageUrl?: string): Promise<string | null> => {
    if (!file || !userId) {
      toast.error('Erro: Arquivo ou ID do usuário não fornecido.');
      console.error('Upload aborted: File or userId not provided.');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      console.error('Upload aborted: Invalid file type. Only images are allowed.');
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB.');
      console.error('Upload aborted: Image size exceeds 5MB limit.');
      return null;
    }

    // *** Crucial check for authentication before upload ***
    // Ensure Firebase Auth is initialized and a user is signed in
    // auth agora deve estar definido devido à exportação em firebase.ts
    if (!auth.currentUser) { // Removido !auth pois auth deve ser uma instância agora
      toast.error('Erro: Usuário não autenticado. Por favor, faça login e tente novamente.');
      console.error('Upload aborted: User is not authenticated. auth.currentUser is null.');
      setIsUploading(false); // Ensure state is reset
      setUploadProgress(0);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    toast.info('Iniciando upload da imagem...');

    try {
      // Create storage reference
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Use __app_id para construir o caminho completo conforme as regras do Storage
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; 
      // O caminho DEVE CORRESPONDER às suas regras de segurança do Storage
      const storagePath = `artifacts/${appId}/public/data/profile_pictures/${userId}/${sanitizedFileName}`;
      
      const storageRef = ref(storage, storagePath);

      console.log('Attempting to upload to Storage path:', storagePath); // Log para depuração

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            // console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error('Upload error:', error);
            setIsUploading(false);
            setUploadProgress(0);
            let errorMessage = 'Erro ao fazer upload da imagem.';
            if (error.code === 'storage/unauthenticated') {
              errorMessage = 'Erro: Usuário não autenticado. Por favor, faça login e tente novamente.';
            } else if (error.code === 'storage/unauthorized') {
              errorMessage = 'Erro: Permissão negada para fazer upload da imagem. Verifique as regras de segurança do Storage.';
            } else if (error.code === 'storage/quota-exceeded') {
                errorMessage = 'Erro: Cota de armazenamento excedida. Por favor, entre em contato com o suporte.';
            }
            toast.error(errorMessage);
            reject(error);
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Upload completed, download URL:', downloadURL);

              // Delete old image if it exists and is from Firebase Storage
              if (oldImageUrl && oldImageUrl.includes('firebasestorage.googleapis.com')) {
                try {
                  // Extrair o caminho do URL da imagem antiga de forma robusta
                  const url = new URL(oldImageUrl);
                  // O caminho no storage começa após /o/ e é URL-encoded
                  let oldImagePath = url.pathname.substring(url.pathname.indexOf('/o/') + 3);
                  oldImagePath = decodeURIComponent(oldImagePath);

                  // Verifique se o caminho da imagem antiga corresponde ao padrão do seu aplicativo
                  // Isso é importante para não tentar deletar arquivos de outros apps ou caminhos.
                  if (oldImagePath.startsWith(`artifacts/${appId}/public/data/profile_pictures/${userId}/`)) {
                    console.log("Attempting to delete old image at path:", oldImagePath);
                    const oldImageRef = ref(storage, oldImagePath);
                    await deleteObject(oldImageRef);
                    console.log('Old image deleted successfully from:', oldImagePath);
                  } else {
                    console.warn('Old image URL path does not match expected format for deletion, skipping:', oldImagePath);
                  }
                } catch (deleteError: any) {
                  console.warn('Could not delete old image:', deleteError);
                  if (deleteError.code === 'storage/object-not-found') {
                    console.warn('Old image not found in storage (might have been deleted already or path was incorrect).');
                  } else if (deleteError.code === 'storage/unauthorized') {
                    console.warn('Permission denied when trying to delete old image.');
                  }
                  // Continue anyway, as the new upload was successful
                }
              }

              setIsUploading(false);
              setUploadProgress(0);
              toast.success('Imagem carregada com sucesso!');
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL or deleting old image:', error);
              setIsUploading(false);
              setUploadProgress(0);
              toast.error('Erro ao finalizar upload ou excluir imagem antiga.');
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload initialization error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Erro ao inicializar o processo de upload.');
      return null;
    }
  };

  return {
    uploadImage,
    uploadProgress,
    isUploading
  };
};
