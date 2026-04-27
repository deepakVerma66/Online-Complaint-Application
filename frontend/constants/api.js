import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '5000';

const trimTrailingSlash = (value) => value?.trim().replace(/\/+$/, '') || '';

const extractHostname = (value) => {
  if (!value) {
    return '';
  }

  const withoutProtocol = value.replace(/^[a-z]+:\/\//i, '');
  return withoutProtocol.split('/')[0].split(':')[0].trim();
};

const getConfiguredBaseUrl = () => {
  const envUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL);
  const configUrl = trimTrailingSlash(Constants.expoConfig?.extra?.apiBaseUrl);

  return envUrl || configUrl;
};

const getDetectedBaseUrl = () => {
  const expoHost =
    extractHostname(Constants.expoConfig?.hostUri) ||
    extractHostname(Constants.platform?.hostUri) ||
    extractHostname(Constants.linkingUri);

  if (expoHost) {
    return `http://${expoHost}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
};

const normalizePath = (path) => {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

export const API_BASE_URL = getConfiguredBaseUrl() || getDetectedBaseUrl();

export const buildApiUrl = (path) => `${API_BASE_URL}${normalizePath(path)}`;

export const buildUploadUrl = (filePath) => {
  if (!filePath) {
    return '';
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const normalizedPath = normalizePath(filePath);

  return `${API_BASE_URL}${normalizedPath}`;
};
