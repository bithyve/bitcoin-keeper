import HexaToastMessages from 'src/components/ToastMessages';
import React from 'react';
import { useToast } from 'native-base';
import Text from 'src/components/KeeperText';

// use this enum to categorize and replace toasts that are in the same category
export enum IToastCategory {
  DEFAULT,
  SIGNING_DEVICE,
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
      >
        {title}
      </Text>
    )
  ) {
    const id = category === IToastCategory.DEFAULT ? title : category;
    if (Toast.isActive(id)) {
      Toast.close(id);
      setTimeout(() => {
        Toast.show({
          render: () => <HexaToastMessages Image={image} error={error} ToastBody={ToastBody} />,
          duration,
          id: id + Math.random(),
        });
      }, 100);
    } else {
      Toast.show({
        render: () => <HexaToastMessages Image={image} error={error} ToastBody={ToastBody} />,
        duration,
        id,
      });
    }
  }

  return { showToast };
};

export default useToastMessage;
