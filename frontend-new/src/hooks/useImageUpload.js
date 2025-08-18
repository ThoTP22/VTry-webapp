import { useState, useEffect } from 'react';
import { ImagesAPI } from '../api';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImage = async (file, onProgress) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file
      const validation = ImagesAPI.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await ImagesAPI.uploadImage(file);
      setUploadProgress(100);
      
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleImages = async (files, onProgress) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate all files
      for (const file of files) {
        const validation = ImagesAPI.validateImageFile(file);
        if (!validation.isValid) {
          throw new Error(`${file.name}: ${validation.errors.join(', ')}`);
        }
      }

      const response = await ImagesAPI.uploadMultipleImages(files);
      setUploadProgress(100);
      
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (key) => {
    try {
      const response = await ImagesAPI.deleteImage(key);
      return { success: true, data: response };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const clearError = () => setError(null);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    clearError,
  };
};
