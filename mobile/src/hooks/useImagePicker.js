import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Wraps expo-image-picker and hands back the chosen photo as a base64 data URL,
// which is exactly what the server stores (same as the web client). Single
// source of truth for the register and account screens.
export const useImagePicker = (initialValue = null) => {
  const [imageData, setImageData] = useState(initialValue);
  const [error, setError] = useState('');

  const pick = async () => {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo permission is required to choose an image');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.6,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.base64) {
      setError('Could not read this image');
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const mime = asset.mimeType || 'image/jpeg';
    setImageData(`data:${mime};base64,${asset.base64}`);
  };

  const remove = () => {
    setImageData(null);
    setError('');
  };

  return { imageData, setImageData, error, pick, remove };
};
