const cloudinary = require('../config/cloudinary');

/**
 * Uploads an image to Cloudinary and returns the URL.
 * @param {string} filePath - Local path to the image file.
 * @param {string} folder - Cloudinary folder name (optional).
 * @returns {Promise<{ url: string, publicId: string }>} - The URL and public_id of the uploaded image.
 */
async function uploadToCloudinary(filePath, folder = 'profile_pictures') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}

/**
 * Deletes an image from Cloudinary by public_id.
 * @param {string} publicId
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log and continue; not fatal for user flow
    console.error('Cloudinary delete failed:', error.message);
  }
}

module.exports = { uploadToCloudinary, deleteFromCloudinary };
