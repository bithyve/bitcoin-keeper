import HexaToastMessages from 'src/components/ToastMessages';
import React from 'react';
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

  function showToast(
    title,
    image?,
    category = IToastCategory.DEFAULT,
    duration = 3000,
    error = false
  ) {
    Toast.show({
      render: () => <HexaToastMessages Image={image} error={error} ToastBody={title} />,
      duration,
    });
  }

  return { showToast };
};

export default useToastMessage;
