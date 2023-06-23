import { Box, Modal, Pressable } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import Close from 'src/assets/images/modal_close.svg';
import CloseGreen from 'src/assets/images/modal_close_green.svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveValue } from 'native-base/lib/typescript/components/types';
import Text from 'src/components/KeeperText';

type ModalProps = {
  visible: boolean;
  close: any;
  title?: string;
  subTitle?: string;
  subTitleWidth?: number;
  modalBackground?: string[];
  buttonBackground?: string[];
  buttonText?: string;
  buttonTextColor?: string;
  secButtonTextColor?: string;
  secondaryButtonText?: string;
  secondaryCallback?: any;
  buttonCallback?: any;
  textColor?: string;
  subTitleColor?: string;
  DarkCloseIcon?: any;
  Content?: any;
  dismissible?: boolean;
  showButtons?: boolean;
  learnMore?: boolean;
  learnMoreCallback?: any;
  closeOnOverlayClick?: boolean;
  showCloseIcon?: boolean;
  justifyContent?: ResponsiveValue<string | number>;
};

KeeperModal.defaultProps = {
  title: '',
  subTitle: null,
  subTitleWidth: windowWidth * 0.7,
  modalBackground: ['light.mainBackground', 'light.mainBackground'],
  buttonBackground: ['light.gradientStart', 'light.gradientEnd'],
  buttonText: null,
  buttonTextColor: 'white',
  secButtonTextColor: '#073E39',
  buttonCallback: () => {},
  secondaryButtonText: null,
  secondaryCallback: () => {},
  textColor: '#000',
  subTitleColor: null,
  DarkCloseIcon: false,
  Content: () => null,
  dismissible: true,
  showButtons: true,
  learnMore: false,
  learnMoreCallback: () => {},
  closeOnOverlayClick: true,
  showCloseIcon: true,
  justifyContent: 'flex-end',
};

function KeeperModal(props: ModalProps) {
  const {
    visible,
    close,
    title,
    subTitle,
    subTitleWidth,
    modalBackground,
    buttonBackground,
    buttonText,
    buttonTextColor,
    buttonCallback,
    textColor,
    subTitleColor: ignored,
    secondaryButtonText,
    secondaryCallback,
    DarkCloseIcon,
    Content,
    dismissible,
    showButtons,
    learnMore,
    learnMoreCallback,
    secButtonTextColor,
    closeOnOverlayClick,
    showCloseIcon,
    justifyContent,
  } = props;
  const subTitleColor = ignored || textColor;
  const { bottom } = useSafeAreaInsets();

  const bottomMargin = Platform.select<number>({ ios: bottom, android: 10 });
  if (!visible) {
    return null;
  }

  const getCloseIcon = () => (DarkCloseIcon ? <CloseGreen /> : <Close />);
  const styles = getStyles(subTitleWidth);
  const linearGradient = {
    colors: modalBackground,
    start: [0, 0],
    end: [1, 1],
  };
  const linearGradientBtn = {
    colors: buttonBackground,
    start: [0, 0],
    end: [1, 1],
  };
  return (
    <Modal
      closeOnOverlayClick={closeOnOverlayClick}
      isOpen={visible}
      onClose={dismissible ? close : null}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      justifyContent={justifyContent}
    >
      <Modal.Content borderRadius={10} marginBottom={Math.max(5, bottomMargin)} maxHeight="full">
        <GestureHandlerRootView>
          <Box backgroundColor={{ linearGradient }} style={styles.container}>
            {showCloseIcon ? (
              <TouchableOpacity style={styles.close} onPress={close}>
                {getCloseIcon()}
              </TouchableOpacity>
            ) : null}
            {title || subTitle ? (
              <Modal.Header style={styles.headerContainer}>
                <Text style={styles.title} color={textColor}>
                  {title}
                </Text>
                {subTitle ? (
                  <Text style={styles.subTitle} color={subTitleColor}>
                    {`${subTitle}`}
                  </Text>
                ) : null}
              </Modal.Header>
            ) : null}
            <Modal.Body>
              <Content />
            </Modal.Body>
            {((showButtons && learnMore) || !!buttonText) && (
              <Box style={styles.footerContainer}>
                {learnMore ? (
                  <Box borderColor="light.lightAccent" style={styles.learnMoreContainer}>
                    <Pressable onPress={learnMoreCallback}>
                      <Text color="light.lightAccent" style={styles.seeFAQs} bold>
                        See FAQs
                      </Text>
                    </Pressable>
                  </Box>
                ) : (
                  <Box />
                )}
                {!!secondaryButtonText && (
                  <TouchableOpacity onPress={secondaryCallback}>
                    <Box style={styles.secCta}>
                      <Text style={styles.ctaText} color={secButtonTextColor} bold>
                        {showButtons ? secondaryButtonText : null}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )}
                {!!buttonText && (
                  <TouchableOpacity onPress={buttonCallback}>
                    <Box backgroundColor={{ linearGradient: linearGradientBtn }} style={styles.cta}>
                      <Text style={styles.ctaText} color={buttonTextColor} bold>
                        {showButtons ? buttonText : null}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )}
              </Box>
            )}
          </Box>
        </GestureHandlerRootView>
      </Modal.Content>
    </Modal>
  );
}

export default KeeperModal;

const getStyles = (subTitleWidth) =>
  StyleSheet.create({
    container: {
      borderRadius: 10,
      alignItems: 'center',
      padding: '4%',
    },
    title: {
      fontSize: 19,
      letterSpacing: 1,
    },
    subTitle: {
      fontSize: 12,
      letterSpacing: 1,
      width: subTitleWidth,
    },
    secCta: {
      color: '#073E39',
      borderRadius: 10,
      width: wp(110),
      height: hp(45),
      justifyContent: 'center',
      alignItems: 'center',
    },
    cta: {
      borderRadius: 10,
      width: wp(110),
      height: hp(45),
      justifyContent: 'center',
      alignItems: 'center',
    },
    ctaText: {
      fontSize: 13,
      letterSpacing: 1,
    },
    close: {
      position: 'absolute',
      right: 20,
      top: 20,
    },
    seeFAQs: {
      fontSize: 13,
    },
    learnMoreContainer: {
      borderRadius: hp(40),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#00433A',
      height: hp(34),
      width: wp(110),
      marginLeft: wp(10),
    },
    headerContainer: {
      alignSelf: 'flex-start',
      borderBottomWidth: 0,
      backgroundColor: 'transparent',
      width: '90%',
    },
    bodyContainer: {
      width: '80%',
    },
    footerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
  });
