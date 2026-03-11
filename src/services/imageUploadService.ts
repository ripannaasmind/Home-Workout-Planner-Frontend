const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fit-home-workout-planner-backend.onrender.com/api';

// Cache the key in memory to avoid fetching on every upload
let _cachedImgbbKey: string | null = null;

async function getImgbbApiKey(): Promise<string> {
  if (_cachedImgbbKey) return _cachedImgbbKey;
  try {
    const res = await fetch(`${API_URL}/imgbb-key`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.imgbbApiKey) {
        _cachedImgbbKey = json.data.imgbbApiKey;
        return _cachedImgbbKey!;
      }
    }
  } catch {
    // fall through to fallback
  }
  // Use env var as fallback if backend key is not set
  return process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';
}

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
    const apiKey = await getImgbbApiKey();
    if (!apiKey) throw new Error('ImgBB API key is not configured. Please set it in the admin panel.');

    const formData = new FormData();
    formData.append('key', apiKey);

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
