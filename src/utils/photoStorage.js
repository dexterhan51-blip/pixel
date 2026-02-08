/**
 * Upload a base64 photo to Supabase Storage.
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} logId - Log ID
 * @param {string} base64DataUrl - base64 data URL (data:image/jpeg;base64,...)
 * @returns {Promise<string|null>} Storage path or null on error
 */
export async function uploadPhoto(supabase, userId, logId, base64DataUrl) {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) return null;

  try {
    // Convert base64 to Blob
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();

    const path = `${userId}/${logId}.jpg`;

    const { error } = await supabase.storage
      .from('training-photos')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Photo upload error:', error);
      return null;
    }

    return path;
  } catch (err) {
    console.error('Photo upload exception:', err);
    return null;
  }
}

/**
 * Get a signed URL for a photo in Supabase Storage.
 * @param {object} supabase - Supabase client
 * @param {string} path - Storage path (e.g., "userId/logId.jpg")
 * @param {number} expiresIn - URL expiry in seconds (default 3600)
 * @returns {Promise<string|null>} Signed URL or null
 */
export async function getPhotoUrl(supabase, path, expiresIn = 3600) {
  if (!path) return null;

  try {
    const { data, error } = await supabase.storage
      .from('training-photos')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Photo URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Photo URL exception:', err);
    return null;
  }
}
