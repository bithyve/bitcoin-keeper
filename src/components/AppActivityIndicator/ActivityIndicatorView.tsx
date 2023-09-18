import { Modal } from 'native-base';
import React from 'react';
import { ActivityIndicator } from 'react-native';

function ActivityIndicatorView({
  visible,
  showLoader = true,
}: {
  visible: boolean;
  showLoader?: boolean;
}) {
  if (visible) {
    return (
      <Modal closeOnOverlayClick={false} isOpen={visible} _backdrop={{ bg: '#000', opacity: 0.7 }}>
        {showLoader ? <ActivityIndicator size="large" animating color="#00836A" /> : null}
      </Modal>
    );
  }
}

export default ActivityIndicatorView;
