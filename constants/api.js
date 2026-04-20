export const API_BASE_URL = 'http://192.168.1.8:5000';

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const buildUploadUrl = (filePath) => {
  if (!filePath) {
    return '';
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

  return `${API_BASE_URL}${normalizedPath}`;
};
