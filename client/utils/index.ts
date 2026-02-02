



import { Dispatch, SetStateAction } from 'react';
import api from '../lib/axios';

// Define a minimal shape for Axios-like errors
interface AppError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Type guard to check if error is AppError
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object'
  );
}

export const handleError = (
  error: unknown,
  setError: Dispatch<SetStateAction<string>>
) => {
  console.error('Failed to perform requested operation', error);

  if (isAppError(error) && error.response?.data?.message) {
    setError(error.response.data.message);
  } else {
    setError('An error occurred while creating the resource.');
  }
};


export const uploadFile = async (
  file: File,
  type: 'thumbnail' | 'video' | 'image'
) => {
  const { cloudName } = (await api.get('/videos/upload/signature')).data;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'amafor');
  formData.append('folder', 'amafor');

  const resourceType = type === 'video' ? 'video' : 'image';
  const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const uploadRes = await fetch(cloudUrl, { method: 'POST', body: formData });

  const data = await uploadRes.json();
  return data.url;
};

 export const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
