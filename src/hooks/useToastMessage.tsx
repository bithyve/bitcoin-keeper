import HexaToastMessages from 'src/components/ToastMessages';
import React from 'react';
import { Box, useToast } from 'native-base';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { Pressable, TouchableOpacity } from 'react-native';

// use this enum to categorize and replace toasts that are in the same category
export enum IToastCategory {
  DEFAULT = 'DEFAULT',
  SIGNING_DEVICE = 'SIGNING_DEVICE',
}
const useToastMessage = () => {
  const Toast = useToast();

  function showToast(
    title,
    image?,
    category = IToastCategory.DEFAULT,
    duration = 3000,
    error = false
  ) {
    // Clean up any existing toasts first
    const toastId = Toast.show({
      render: () => (
        <Pressable onPress={() => Toast.close(toastId)}>
          <HexaToastMessages Image={image} error={error} ToastBody={title} />
        </Pressable>
      ),
      duration,
    });
  }

  return { showToast };
};

export default useToastMessage;
