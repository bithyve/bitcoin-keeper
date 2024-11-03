import HexaToastMessages from 'src/components/ToastMessages';
import React from 'react';
import { useToast } from 'native-base';
import Text from 'src/components/KeeperText';

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
    error = false,
    width = '100%',
    ToastBody = (
      <Text
        testID="text_toast"
        style={{ marginLeft: image ? 5 : 0, width, paddingRight: 25 }}
        numberOfLines={3}
        bold
      >
        {title}
      </Text>
    )
  ) {
    Toast.show({
      render: () => <HexaToastMessages Image={image} error={error} ToastBody={ToastBody} />,
      duration,
    });
  }

  return { showToast };
};

export default useToastMessage;
