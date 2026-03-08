const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '062499640037b87a330cb09793b95435';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  error?: {
    message: string;
    code: number;
  };
}



// ------- Upload Image -------
export const uploadImage = async (file: File | string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);

    if (typeof file === 'string') {
      
      const base64Data = file.includes('base64,') ? file.split('base64,')[1] : file;
      formData.append('image', base64Data);
    } else {
      
      formData.append('image', file);
    }

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result: ImgBBResponse = await response.json();

    if (result.success && result.data) {
      return result.data.display_url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image');
    }
  } catch (error) {
    throw error;
  }
};



// ------- Upload Multiple Images -------
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    throw error;
  }
};


export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};



// ------- Validate Image File -------
export const validateImageFile = (file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }

  return { isValid: true };
};

const imageUploadService = {
  uploadImage,
  uploadMultipleImages,
  fileToBase64,
  validateImageFile,
};

export default imageUploadService;
