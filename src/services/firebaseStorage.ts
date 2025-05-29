
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './firebaseConfig';

// Initialize Firebase Storage
const storage = getStorage(app);

export const firebaseStorage = {
  // Upload profile image
  uploadProfileImage: async (file: File, userId: string): Promise<string | null> => {
    if (!file) {
      console.log("Nenhum arquivo selecionado!");
      return null;
    }

    // Create a reference for the file
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-images/${fileName}`);

    try {
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload da imagem de perfil concluído!', snapshot);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL da imagem:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      return null;
    }
  },

  // Delete profile image
  deleteProfileImage: async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract the path from the URL
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      console.log('Imagem removida com sucesso');
      return true;
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      return false;
    }
  },

  // Upload general images
  uploadImage: async (file: File, path: string, customName?: string): Promise<string | null> => {
    if (!file) {
      console.log("Nenhum arquivo selecionado!");
      return null;
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = customName || `image-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload da imagem concluído!', snapshot);

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL da imagem:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      return null;
    }
  }
};

export { storage };
