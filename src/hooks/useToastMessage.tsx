import HexaToastMessages from 'src/components/ToastMessages';
import React, { useRef, useEffect } from 'react';
import { Box, useToast } from 'native-base';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';

// use this enum to categorize and replace toasts that are in the same category
export enum IToastCategory {
  DEFAULT = 'DEFAULT',
  SIGNING_DEVICE = 'SIGNING_DEVICE',
}
const useToastMessage = () => {
  const Toast = useToast();
  const activeToastsRef = useRef<{ [message: string]: any }>({});

  // Add cleanup function
  const cleanupToasts = () => {
    Object.keys(activeToastsRef.current).forEach((key) => {
      Toast.close(activeToastsRef.current[key]);
      delete activeToastsRef.current[key];
    });
  };

  function showToast(
    title,
    image?,
    category = IToastCategory.DEFAULT,
    duration = 3000,
    error = false
  ) {
    // Clean up any existing toasts first
    cleanupToasts();

    const toastId = Toast.show({
      render: () => <HexaToastMessages Image={image} error={error} ToastBody={title} />,
      duration,
      onCloseComplete: () => {
        delete activeToastsRef.current[title];
      },
    });

    activeToastsRef.current[title] = toastId;

    // Force cleanup after duration
    setTimeout(() => {
      if (activeToastsRef.current[title] === toastId) {
        Toast.close(toastId);
        delete activeToastsRef.current[title];
      }
    }, duration + 100); // Add small buffer to duration
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupToasts();
    };
  }, []);

  return { showToast };
};

export default useToastMessage;
