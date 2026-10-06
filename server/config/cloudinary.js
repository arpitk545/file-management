const cloudinary = require('cloudinary').v2;
const path = require("path");
const fs = require('fs');
const os = require('os');
const { uploadToCatbox } = require('./catbox');
const { uploadToImgbb } = require('./imgbb');

// Configure cloudinary (make sure you call this during app setup)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary (with ImgBB fallback)
 * @param {string|object} file - File path or multer/temp file object
 * @param {string} folder - Folder path in Cloudinary
 * @param {number} [height] - Optional height for resizing
 * @param {number} [quality] - Optional quality
 * @returns {Promise<string>} secure_url
 */
const uploadImageToCloudinary = async (file, folder, height, quality) => {
  const filePath = typeof file === 'string'
    ? file
    : file?.tempFilePath || file?.path || file;

  try {
    const options = {
      folder,
      resource_type: "image", 
    };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    const result = await cloudinary.uploader.upload(filePath, options);
    return result.secure_url;
  } catch (err) {
    try {
      const fileName = file?.name || path.basename(filePath) || "image.jpg";
      const imgbbUrl = await uploadToImgbb(filePath, fileName);
      if (imgbbUrl) {
        return imgbbUrl;
      }
    } catch (_) {}
    throw err;
  }
};

/**
 * Upload file/document to Cloudinary (with Catbox fallback)
 * @param {string} filePath - Path to file
 * @param {string} folder - Folder path
 * @param {string} originalName - Original filename
 * @returns {Promise<{ url: string, fileName: string }>}
 */
const uploadFileToCloudinary = async (filePath, folder, originalName) => {
  const ext = path.extname(originalName || "") || ".pdf";
  const baseName = path.basename(originalName || "file", ext);

  try {
    const options = {
      folder,
      resource_type: "raw",
      public_id: baseName + ext,  
      use_filename: true,
      unique_filename: false,
      overwrite: true,     
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    // Return URL and full fileName with extension
    return {
      url: result.secure_url,
      fileName: baseName + ext,
    };
  } catch (error) {
    try {
      const catboxUrl = await uploadToCatbox(filePath, originalName || (baseName + ext));
      if (catboxUrl) {
        return {
          url: catboxUrl,
          fileName: baseName + ext,
        };
      }
    } catch (_) {}
    throw error;
  }
};

/**
 * Delete an asset (image or file) from Cloudinary by public ID
 * @param {string} publicId
 * @returns {Promise<void>}
 */
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;
  if (typeof publicId === 'string' && (
    publicId.includes('catbox.moe') ||
    publicId.includes('files.catbox.moe') ||
    publicId.includes('litter.catbox.moe') ||
    publicId.includes('ibb.co') ||
    publicId.includes('imgbb.com')
  )) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image", 
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Delete raw file (e.g., PDF, DOCX) from Cloudinary by publicId
 * @param {string} publicId
 */
const deleteFileFromCloudinary = async (publicId) => {
  if (!publicId) return;
  if (typeof publicId === 'string' && (publicId.includes('catbox.moe') || publicId.includes('files.catbox.moe') || publicId.includes('litter.catbox.moe'))) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch (err) {
    throw err;
  }
};


module.exports = {
  uploadImageToCloudinary,
  uploadFileToCloudinary,
  deleteImageFromCloudinary,
  deleteFileFromCloudinary,
};
