import HexaToastMessages from 'src/components/ToastMessages';
import React, { useRef, useEffect } from 'react';
import { useToast } from '@gluestack-ui/themed-native-base';
import { Pressable } from 'react-native';

// use this enum to categorize and replace toasts that are in the same category
export enum IToastCategory {
  DEFAULT = 'DEFAULT',
  SIGNING_DEVICE = 'SIGNING_DEVICE',
}

const TOAST_CONTAINER_TEST_ID = 'toast_container';

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
    _category = IToastCategory.DEFAULT,
    duration = 3000,
    error = false
  ) {
    // Clean up any existing toasts first
    cleanupToasts();
    const toastId = Toast.show({
      placement: 'bottom',
      bg: 'transparent',
      _dark: {
        bg: 'transparent',
      },
      shadow: 'none',
      m: 0,
      p: 0,
      borderWidth: 0,
      borderColor: 'transparent',
      sx: {
        bg: 'transparent',
        _dark: { bg: 'transparent' },
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 0,
        p: 0,
        m: 0,
      },
      render: () => (
        <Pressable
          testID={TOAST_CONTAINER_TEST_ID}
          nativeID={TOAST_CONTAINER_TEST_ID}
          accessibilityLabel={TOAST_CONTAINER_TEST_ID}
          accessibilityRole="alert"
          collapsable={false}
          onPress={() => Toast.close(toastId)}
        >
          <HexaToastMessages Image={image} error={error} ToastBody={title} />
        </Pressable>
      ),
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
