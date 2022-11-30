import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  View,
  Keyboard,
  Platform,
  AppState,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ModalContainer = ({
  visible,
  closeBottomSheet,
  background = 'rgba(0,0,0,0.5)',
  children,
  onBackground,
}: {
  visible?: boolean;
  closeBottomSheet?: any;
  background?: string;
  children?: any;
  onBackground?: any;
}) => {
  const [height, setHeight] = useState(6);
  const onAppStateChange = (state) => {
    // if ( state === 'background' || state === 'inactive' ){
    onBackground ? onBackground() : closeBottomSheet();
    // }
  };

  useEffect(() => {
    AppState.addEventListener('change', onAppStateChange);
    return () => AppState.removeEventListener('change', onAppStateChange);
  }, []);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setHeight(0);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setHeight(6);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <Modal
      visible={visible}
      onRequestClose={() => {
        closeBottomSheet ? closeBottomSheet() : null;
      }}
      transparent={true}
      style={styles.wrapper}
    >
      {/* <KeyboardAwareScrollView
        scrollEnabled={false}
        contentContainerStyle={[
          styles.contentContainerStyle,
          {
            backgroundColor: background,
            paddingBottom: Platform.OS === 'ios' ? hp('6%') : 2,
          },
        ]}
        resetScrollToCoords={{
          x: 0,
          y: 0,
        }}
      > */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? null : 'height'}
        style={[
          styles.contentContainerStyle,
          { paddingBottom: Platform.OS === 'ios' ? hp('6%') : 0, backgroundColor: background },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => {
            closeBottomSheet();
          }}
          style={styles.touchableWrapperStyle}
        >
          <TouchableWithoutFeedback>
            <View style={styles.childViewWrapper}>{children}</View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      {/* </KeyboardAwareScrollView> */}
    </Modal>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainerStyle: {
    flex: 1,
    // flexDirection: 'column',
    // justifyContent: 'flex-end',
    paddingHorizontal: wp('2%'),
  },
  touchableWrapperStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  childViewWrapper: {
    width: '100%',
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
});

export default ModalContainer;
