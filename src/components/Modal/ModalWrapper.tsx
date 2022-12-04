import React from 'react';
import Modal from 'react-native-modal';

export interface Props {
  visible: boolean;
  onSwipeComplete: Function;
  position?: string;
  children?: any;
}
function ModalWrapper(props: Props) {
  return (
    <Modal
      isVisible={props.visible}
      onSwipeComplete={() => props.onSwipeComplete}
      onDismiss={() => props.onSwipeComplete}
      onBackButtonPress={() => props.onSwipeComplete}
      onBackdropPress={() => props.onSwipeComplete}
      style={{
        justifyContent: props.position == 'center' ? 'center' : 'flex-end',
        marginHorizontal: 15,
        marginBottom: 25,
      }}
    >
      {props.children}
    </Modal>
  );
}
export default ModalWrapper;
