const fs = require('fs');
const path = require('path');

/**
 * Upload file to Catbox with Litterbox fallback
 * @param {string|object} file - File path or file object
 * @param {string} [originalName] - Original filename
 * @returns {Promise<string>} Direct file URL
 */
const uploadToCatbox = async (file, originalName = 'file') => {
  let filePath = '';
  let fileName = originalName;

  if (typeof file === 'string') {
    filePath = file;
    if (!originalName || originalName === 'file') {
      fileName = path.basename(filePath);
    }
  } else if (file && typeof file === 'object') {
    filePath = file.tempFilePath || file.path;
    fileName = file.name || originalName || 'file';
  }

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`File path not found on disk: ${filePath}`);
  }

  const userhash = process.env.CATBOX_USERHASH || '';

  // 1. Attempt Catbox (Permanent storage)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const blob = await fs.openAsBlob(filePath);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    if (userhash) {
      formData.append('userhash', userhash);
    }
    formData.append('fileToUpload', blob, fileName);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
    }
  } catch (_) {}

  // 2. Fallback to Litterbox (Catbox fast mirror)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const blob = await fs.openAsBlob(filePath);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('time', '72h');
    formData.append('fileToUpload', blob, fileName);

    const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      throw new Error(`Litterbox invalid response: ${trimmed}`);
    } else {
      throw new Error(`Litterbox status: ${response.status}`);
    }
  } catch (litterErr) {
    throw litterErr;
  }
};

module.exports = { uploadToCatbox };
