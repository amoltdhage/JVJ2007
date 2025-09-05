// services/toastService.js
import Toast from 'react-native-toast-message';

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning' // You might need to create a custom type for warning
};

export const showToast = (message, type = ToastType.INFO, duration = 3000) => {
  Toast.show({
    type: type,
    text1: message,
    visibilityTime: duration,
    autoHide: true,
  });
};

// Convenience methods
export const toast = {
  show: (message, duration) => showToast(message, ToastType.INFO, duration),
  success: (message, duration) => showToast(message, ToastType.SUCCESS, duration),
  error: (message, duration) => showToast(message, ToastType.ERROR, duration),
  info: (message, duration) => showToast(message, ToastType.INFO, duration),
};

export default toast;