// services/toastService.js
import Toast from 'react-native-toast-message';

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

export const showToast = (message, type = ToastType.INFO, duration = 3000) => {
  return Toast.show({
    type: type,
    text1: message,
    visibilityTime: duration,
    autoHide: true,
  });
};

// Convenience methods
export const toast = {
  show: (message, duration) => showToast(message, ToastType.INFO, duration || 3000),
  success: (message, duration) => showToast(message, ToastType.SUCCESS, duration || 3000),
  error: (message, duration) => showToast(message, ToastType.ERROR, duration || 3000),
  info: (message, duration) => showToast(message, ToastType.INFO, duration || 3000),
};

export default toast;