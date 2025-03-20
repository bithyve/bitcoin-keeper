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
      <Modal
        testID="modal_loading"
        closeOnOverlayClick={false}
        isOpen={visible}
        _backdrop={{ bg: '#000', opacity: 0.7 }}
      >
        {showLoader ? (
          <ActivityIndicator testID="activityIndicator" size="large" animating color="#00836A" />
        ) : null}
      </Modal>
    );
  }

  return null;
}

export default ActivityIndicatorView;
