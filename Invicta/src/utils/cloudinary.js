// Cloudinary configuration and upload utilities

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Invicta_Preset';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dhsu5h91l';

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Cloudinary folder name (optional)
 * @returns {Promise<string>} - Returns the secure URL of uploaded image
 */
export const uploadToCloudinary = async (file, folder = 'payment-proofs') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Add timestamp to filename for uniqueness
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    formData.append('public_id', fileName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed. Please try again.');
  }
};

/**
 * Upload QR code to Cloudinary (for admin)
 * @param {File} file - The QR code image file
 * @returns {Promise<string>} - Returns the secure URL of uploaded QR code
 */
export const uploadQRToCloudinary = async (file) => {
  return uploadToCloudinary(file, 'admin/qr-codes');
};

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

// Configuration object for easy access
export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  apiUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
};
