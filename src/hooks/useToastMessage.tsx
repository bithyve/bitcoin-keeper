import HexaToastMessages from 'src/components/ToastMessages';
import React from 'react';
import { useToast } from 'native-base';
import Text from 'src/components/KeeperText';

const useToastMessage = () => {
  const Toast = useToast();
  const id = 'keeper-toast';

  function showToast(
    title,
    image?,
    duration = 3000,
    error = false,
    width = '100%',
    ToastBody = (
      <Text
        color={error ? 'error.200' : null}
        style={{ marginLeft: image ? 5 : 0, width, paddingRight: 25 }}
        numberOfLines={2}
      >
        {title}
      </Text>
    )
  ) {
    if (!Toast.isActive(id)) {
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
