import HexaToastMessages from 'src/components/ToastMessages';
import React from 'react';
import { useToast } from 'native-base';

const useToastMessage = () => {
  const Toast = useToast();

  function showToast(title, image?, duration = 3000) {
    Toast.show({
      render: () => <HexaToastMessages title={title} Image={image} />,
      duration,
    });
  }

  return { showToast };
};

export default useToastMessage;
