import { compressImageToDataUrl } from "./imageUploadService";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single image File or Blob to Cloudinary.
 * If Cloudinary fails (e.g. preset not configured as Unsigned yet),
 * it gracefully falls back to a high-quality compressed image so images
 * are never lost and always display in the app.
 * 
 * @param {File|Blob|string} file - The image file, blob, or data URL
 * @param {string} [folder="mobin/properties"] - Cloudinary destination folder
 * @returns {Promise<string>} The permanent secure URL or compressed image data URL
 */
export async function uploadImageToCloudinary(file, folder = "mobin/properties") {
  if (!file) return "";

  // If already an online URL (e.g. existing Cloudinary or HTTPS image) or local asset, keep it
  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("/")) {
      return file;
    }
  }

  // Attempt Cloudinary upload if config is provided
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      if (folder) {
        formData.append("folder", folder);
      }

      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          console.info("[Cloudinary] Successfully uploaded image:", data.secure_url);
          return data.secure_url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `Status ${response.status}`;
        console.warn("[Cloudinary Upload Notice]:", errMsg);

        if (errMsg.toLowerCase().includes("unsigned")) {
          console.warn(
            `[Cloudinary Configuration]: Preset "${CLOUDINARY_UPLOAD_PRESET}" must be set to "Unsigned" in Cloudinary Dashboard -> Settings -> Upload -> Upload presets -> Signing Mode: Unsigned.`
          );
        }
      }
    } catch (err) {
      console.warn("[Cloudinary Network Notice]:", err.message);
    }
  } else {
    console.warn(
      "[Cloudinary] VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET missing in .env."
    );
  }

  // Graceful fallback: compress to lightweight, crisp image so the app always displays the photo
  return await compressImageToDataUrl(file, 960, 0.78);
}

/**
 * Upload multiple image files to Cloudinary in parallel
 * @param {Array<File|Blob|string>} files - Array of image files or data URLs
 * @param {string} [folder="mobin/properties"] - Cloudinary destination folder
 * @returns {Promise<Array<string>>} Array of secure URLs
 */
export async function uploadMultipleImagesToCloudinary(files, folder = "mobin/properties") {
  if (!Array.isArray(files) || files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean);
}

