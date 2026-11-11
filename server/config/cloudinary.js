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
 * Resilient local disk storage fallback
 * Saves files under server/uploads/<subfolder>/
 */
const saveFileLocally = (fileInput, originalName, subfolder = "files") => {
  const localUploadsDir = path.join(__dirname, "..", "uploads", subfolder);
  if (!fs.existsSync(localUploadsDir)) {
    try {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    } catch (_) {}
  }

  const defaultExt = subfolder === "images" ? ".jpg" : ".pdf";
  const ext = path.extname(originalName || "") || defaultExt;
  const baseName = path.basename(originalName || "file", ext);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "_") || "resource";
  const uniqueName = `${Date.now()}_${cleanBase}${ext}`;
  const destPath = path.join(localUploadsDir, uniqueName);

  const srcPath = typeof fileInput === "string"
    ? fileInput
    : fileInput?.tempFilePath || fileInput?.path;

  if (srcPath && fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  } else if (fileInput?.data) {
    fs.writeFileSync(destPath, fileInput.data);
  } else {
    throw new Error(`Invalid source file for local storage: ${srcPath}`);
  }

  return {
    url: `/uploads/${subfolder}/${uniqueName}`,
    fileName: originalName || uniqueName,
  };
};

/**
 * Delete a local file if URL or path points to /uploads/
 */
const deleteLocalFile = (fileOrUrl) => {
  if (!fileOrUrl || typeof fileOrUrl !== "string") return;
  if (fileOrUrl.includes("/uploads/")) {
    try {
      const relativePath = fileOrUrl.substring(fileOrUrl.indexOf("/uploads/"));
      const targetPath = path.join(__dirname, "..", relativePath);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
    } catch (_) {}
  }
};

/**
 * Upload image to Cloudinary (with ImgBB and Local fallback)
 * @param {string|object} file - File path or multer/temp file object
 * @param {string} folder - Folder path in Cloudinary
 * @param {number} [height] - Optional height for resizing
 * @param {number} [quality] - Optional quality
 * @returns {Promise<string>} secure_url or local relative path
 */
const uploadImageToCloudinary = async (file, folder, height, quality) => {
  const filePath = typeof file === 'string'
    ? file
    : file?.tempFilePath || file?.path || file;

  // 1. Try Cloudinary
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
    console.warn("Cloudinary image upload failed, trying fallbacks:", err?.message || err);

    // 2. Try ImgBB
    try {
      const fileName = file?.name || path.basename(filePath) || "image.jpg";
      const imgbbUrl = await uploadToImgbb(filePath, fileName);
      if (imgbbUrl) {
        return imgbbUrl;
      }
    } catch (_) {}

    // 3. Fallback to Local Disk Storage
    try {
      const fileName = file?.name || (typeof filePath === "string" ? path.basename(filePath) : "image.jpg");
      const localResult = saveFileLocally(file, fileName, "images");
      if (localResult?.url) {
        return localResult.url;
      }
    } catch (localErr) {
      console.error("Local image fallback failed:", localErr);
    }

    throw err;
  }
};

/**
 * Upload file/document to Cloudinary (with Catbox and Local fallback)
 * @param {string} filePath - Path to file
 * @param {string} folder - Folder path
 * @param {string} originalName - Original filename
 * @returns {Promise<{ url: string, fileName: string }>}
 */
const uploadFileToCloudinary = async (filePath, folder, originalName) => {
  const actualPath = typeof filePath === "string"
    ? filePath
    : filePath?.tempFilePath || filePath?.path;

  const ext = path.extname(originalName || "") || ".pdf";
  const baseName = path.basename(originalName || "file", ext);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "_") || "doc";
  const safeFileName = `${cleanBase}${ext}`;
  const publicId = `${Date.now()}_${cleanBase}`;

  // 1. Try Cloudinary
  try {
    const options = {
      folder,
      resource_type: "raw",
      public_id: publicId + ext,  
      use_filename: false,
      unique_filename: true,
      overwrite: true,     
    };

    const result = await cloudinary.uploader.upload(actualPath, options);

    return {
      url: result.secure_url,
      fileName: originalName || safeFileName,
    };
  } catch (error) {
    console.warn("Cloudinary file upload failed, trying fallbacks:", error?.message || error);

    // 2. Try Catbox
    try {
      const catboxUrl = await uploadToCatbox(actualPath, originalName || safeFileName);
      if (catboxUrl) {
        return {
          url: catboxUrl,
          fileName: originalName || safeFileName,
        };
      }
    } catch (catboxErr) {
      console.warn("Catbox upload failed:", catboxErr?.message || catboxErr);
    }

    // 3. Resilient Local Disk Storage Fallback
    try {
      const localResult = saveFileLocally(filePath, originalName || safeFileName, "files");
      if (localResult?.url) {
        return localResult;
      }
    } catch (localErr) {
      console.error("Local file storage fallback failed:", localErr);
      throw localErr;
    }

    throw error;
  }
};

/**
 * Delete an asset (image or file) from Cloudinary or local by public ID / URL
 * @param {string} publicId
 * @returns {Promise<void>}
 */
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;
  if (typeof publicId === "string" && publicId.includes("/uploads/")) {
    deleteLocalFile(publicId);
    return;
  }
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
    console.warn("Cloudinary delete image warning:", err?.message || err);
  }
};

/**
 * Delete raw file (e.g., PDF, DOCX) from Cloudinary or local by publicId / URL
 * @param {string} publicId
 */
const deleteFileFromCloudinary = async (publicId) => {
  if (!publicId) return;
  if (typeof publicId === "string" && publicId.includes("/uploads/")) {
    deleteLocalFile(publicId);
    return;
  }
  if (typeof publicId === 'string' && (
    publicId.includes('catbox.moe') ||
    publicId.includes('files.catbox.moe') ||
    publicId.includes('litter.catbox.moe')
  )) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch (err) {
    console.warn("Cloudinary delete file warning:", err?.message || err);
  }
};

module.exports = {
  uploadImageToCloudinary,
  uploadFileToCloudinary,
  deleteImageFromCloudinary,
  deleteFileFromCloudinary,
};
