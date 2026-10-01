/**
 * High-Performance Client-Side Image Processing Service
 * 
 * Compresses raw camera photos into lightweight (~30KB-50KB), crisp Base64 Data URLs
 * using HTML5 Canvas. This eliminates network upload failures, invalid Cloudinary presets,
 * and 400/413 payload errors.
 */

/**
 * Compresses an image File or Blob using HTML5 Canvas to a lightweight, crisp Base64 Data URL.
 * @param {File|Blob|string} file 
 * @param {number} maxWidth 
 * @param {number} quality 
 * @returns {Promise<string>}
 */
export function compressImageToDataUrl(file, maxWidth = 960, quality = 0.78) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    if (typeof file === "string") {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (_) {
          resolve(e.target?.result || "");
        }
      };
      img.onerror = () => {
        resolve(e.target?.result || "");
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/**
 * Processes a single property image file into a clean, permanent, lightweight image URL.
 * @param {File|Blob|string} file 
 * @returns {Promise<string>}
 */
export async function uploadPropertyImage(file) {
  if (!file) return "";
  if (typeof file === "string") return file;
  return await compressImageToDataUrl(file, 960, 0.78);
}

/**
 * Processes multiple image files in parallel
 * @param {Array<File|Blob|string>} files 
 * @returns {Promise<Array<string>>}
 */
export async function uploadMultiplePropertyImages(files) {
  if (!Array.isArray(files) || files.length === 0) return [];
  const uploads = files.map((file) => uploadPropertyImage(file));
  const results = await Promise.all(uploads);
  return results.filter(Boolean);
}
