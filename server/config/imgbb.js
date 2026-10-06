const fs = require('fs');
const path = require('path');
const { uploadToCatbox } = require('./catbox');

/**
 * Upload image to ImgBB (with Catbox fallback if key is missing or upload fails)
 * @param {string|object} file - File path or file object
 * @param {string} [originalName] - Original filename
 * @returns {Promise<string>} Direct image URL
 */
const uploadToImgbb = async (file, originalName = 'image.jpg') => {
  let filePath = '';
  let fileName = originalName;

  if (typeof file === 'string') {
    filePath = file;
    if (!originalName || originalName === 'image.jpg') {
      fileName = path.basename(filePath);
    }
  } else if (file && typeof file === 'object') {
    filePath = file.tempFilePath || file.path;
    fileName = file.name || originalName || 'image.jpg';
  }

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const apiKey = process.env.IMGBB_API_KEY;

  if (apiKey) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      const formData = new FormData();
      formData.append('image', base64Data);
      formData.append('name', path.parse(fileName).name);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const json = await response.json();
        if (json?.data?.url) {
          return json.data.url;
        }
      }
    } catch (_) {}
  }

  // Fallback to Catbox if ImgBB fails or key not set
  return await uploadToCatbox(filePath, fileName);
};

module.exports = { uploadToImgbb };
