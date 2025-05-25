
import { toast } from "sonner";

const IMGBB_API_KEY = "210ba7e09171e845292e127f7355d792";

export const uploadImageToImgBB = async (file: File): Promise<string | null> => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_API_KEY);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log("Image uploaded successfully:", data.data.url);
      return data.data.url;
    } else {
      console.error("ImgBB upload failed:", data);
      toast.error("Falha ao fazer upload da imagem.");
      return null;
    }
  } catch (error) {
    console.error("Error uploading image to ImgBB:", error);
    toast.error("Erro ao enviar imagem para o servidor.");
    return null;
  }
};
