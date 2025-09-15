const cloudinary = require('cloudinary').v2;
const path = require("path");
const fs = require('fs');
const os = require('os');
// Configure cloudinary (make sure you call this during app setup)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string|object} file - File path or multer/temp file object
 * @param {string} folder - Folder path in Cloudinary
 * @param {number} [height] - Optional height for resizing
 * @param {number} [quality] - Optional quality
 * @returns {Promise<string>} secure_url
 */
const uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    const options = {
      folder,
      resource_type: "image", 
    };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    const filePath = typeof file === 'string'
      ? file
      : file.tempFilePath || file.path || file;

    const result = await cloudinary.uploader.upload(filePath, options);
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};

const uploadFileToCloudinary = async (filePath, folder, originalName) => {
  try {
    const ext = path.extname(originalName); // ".pdf"
    const baseName = path.basename(originalName, ext); // "mydoc"

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
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
/**
 * Delete an asset (image or file) from Cloudinary by public ID
 * @param {string} publicId
 * @returns {Promise<void>}
 */
const deleteImageFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image", 
    });
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    throw err;
  }
};

/**
 * Delete raw file (e.g., PDF, DOCX) from Cloudinary by publicId
 * @param {string} publicId
 */
const deleteFileFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch (err) {
    console.error("Cloudinary File Delete Error:", err);
    throw err;
  }
};


module.exports = {
  uploadImageToCloudinary,
  uploadFileToCloudinary,
  deleteImageFromCloudinary,
  deleteFileFromCloudinary,
};
