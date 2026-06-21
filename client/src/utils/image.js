export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Validate an image file and resolve it to a base64 data URL, or reject with a
// user-facing message. Single source of truth for every image picker.
export const readImageFile = (file) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        reject(new Error('Please choose an image file'));
        return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error('Image must be smaller than 5MB'));
        return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read this image'));
    reader.readAsDataURL(file);
});
