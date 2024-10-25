import { Box, Modal } from 'native-base';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';

import Close from 'src/assets/images/modal_close.svg';
import CloseGreen from 'src/assets/images/modal_close_green.svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveValue } from 'native-base/lib/typescript/components/types';
import Text from 'src/components/KeeperText';
import { useKeyboard } from 'src/hooks/useKeyboard';
import CurrencyTypeSwitch from './Switch/CurrencyTypeSwitch';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Buttons from './Buttons';

type ModalProps = {
  visible: boolean;
  close: any;
  title?: string;
  subTitle?: string;
  subTitleWidth?: number;
  modalBackground?: string;
  buttonBackground?: string;
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
  learnMoreButton?: boolean;
  learnMoreButtonPressed?: () => void;
  learnButtonBackgroundColor?: string;
  learnButtonTextColor?: string;
  closeOnOverlayClick?: boolean;
  showCloseIcon?: boolean;
  showCurrencyTypeSwitch?: boolean;
  justifyContent?: ResponsiveValue<string | number>;
  loading?: boolean;
};

KeeperModal.defaultProps = {
  title: '',
  subTitle: null,
  subTitleWidth: windowWidth * 0.7,
  modalBackground: 'light.primaryBackground',
  buttonBackground: 'light.greenButtonBackground',
  buttonText: null,
  buttonTextColor: 'white',
  secButtonTextColor: 'light.headerText',
  buttonCallback: () => {},
  secondaryButtonText: null,
  secondaryCallback: () => {},
  textColor: '#000',
  subTitleColor: null,
  DarkCloseIcon: false,
  Content: () => null,
  dismissible: true,
  learnMoreButton: false,
  learnMoreButtonPressed: () => {},
  learnButtonBackgroundColor: 'light.BrownNeedHelp',
  learnButtonTextColor: 'light.learnMoreBorder',
  closeOnOverlayClick: true,
  showCloseIcon: true,
  showCurrencyTypeSwitch: false,
  justifyContent: 'flex-end',
  loading: false,
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
    learnMoreButton,
    learnMoreButtonPressed,
    learnButtonTextColor,
    learnButtonBackgroundColor,
    secButtonTextColor,
    closeOnOverlayClick,
    showCloseIcon,
    showCurrencyTypeSwitch,
    justifyContent,
    loading,
  } = props;
  const subTitleColor = ignored || textColor;
  const { bottom } = useSafeAreaInsets();
  const bottomMargin = Platform.select<number>({ ios: bottom, android: 10 });
  const isKeyboardOpen = useKeyboard();
  const { height: screenHeight } = useWindowDimensions();
  const availableHeight = screenHeight - bottom - (isKeyboardOpen ? hp(200) : hp(100));
  const maxModalHeight = Math.min(availableHeight, screenHeight * 0.85);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  if (!visible) {
    return null;
  }
  const getCloseIcon = () => (DarkCloseIcon ? <CloseGreen /> : <Close />);
  const styles = getStyles(subTitleWidth);
  return (
    <Modal
      closeOnOverlayClick={closeOnOverlayClick}
      isOpen={visible}
      onClose={dismissible ? close : null}
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      justifyContent={justifyContent}
      pb={isKeyboardOpen ? '60%' : '0'}
    >
      <Modal.Content
        borderRadius={10}
        marginBottom={Math.max(5, bottomMargin)}
        maxHeight={windowHeight < 680 ? '94%' : '90%'}
        width="95%"
      >
        <GestureHandlerRootView>
          <Box backgroundColor={modalBackground} style={styles.container}>
            {showCloseIcon ? (
              <TouchableOpacity testID="btn_close_modal" style={styles.close} onPress={close}>
                {getCloseIcon()}
              </TouchableOpacity>
            ) : null}
            {showCurrencyTypeSwitch ? (
              <Box style={styles.currencySwitch}>
                <CurrencyTypeSwitch />
              </Box>
            ) : null}
            {learnMoreButton && (
              <TouchableOpacity
                style={styles.learnMoreButton}
                onPress={learnMoreButtonPressed}
                testID="btn_learnMore"
              >
                <Box
                  borderColor={
                    learnButtonTextColor === 'light.white' ? 'light.white' : 'light.learnMoreBorder'
                  }
                  backgroundColor={learnButtonBackgroundColor}
                  style={styles.learnMoreButtonContainer}
                >
                  <Text color={learnButtonTextColor} style={styles.learnMoreText}>
                    {common.learnMore}
                  </Text>
                </Box>
              </TouchableOpacity>
            )}
            {title || subTitle ? (
              <Modal.Header style={styles.headerContainer}>
                <Text testID="text_modal_title" style={styles.title} color={textColor}>
                  {title}
                </Text>
                {subTitle ? (
                  <Text testID="text_modal_subtitle" style={styles.subTitle} color={subTitleColor}>
                    {`${subTitle}`}
                  </Text>
                ) : null}
              </Modal.Header>
            ) : null}
            <ScrollView
              style={{ maxHeight: maxModalHeight * 0.85 }}
              showsVerticalScrollIndicator={false}
            >
              <Modal.Body>
                <Content />
              </Modal.Body>
              {buttonText && (
                <Box
                  style={[
                    styles.footerContainer,
                    secondaryButtonText
                      ? { marginRight: 10, alignSelf: 'flex-end', paddingHorizontal: 0 }
                      : { alignSelf: 'center', paddingHorizontal: '3%' },
                  ]}
                >
                  {buttonText && (
                    <Buttons
                      primaryLoading={loading}
                      primaryText={buttonText}
                      primaryCallback={buttonCallback}
                      primaryBackgroundColor={buttonBackground}
                      primaryTextColor={buttonTextColor}
                      secondaryCallback={secondaryCallback}
                      secondaryText={secondaryButtonText}
                      secondaryTextColor={secButtonTextColor}
                      fullWidth={!secondaryButtonText}
                    />
                  )}
                </Box>
              )}
            </ScrollView>
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
      padding: '3%',
    },
    title: {
      fontSize: 19,
      letterSpacing: 0.19,
      marginBottom: hp(5),
    },
    subTitle: {
      fontSize: 13,
      letterSpacing: 0.13,
      width: subTitleWidth,
    },
    secCta: {
      color: '#073E39',
      borderRadius: 10,
      width: wp(110),
      height: hp(45),
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    close: {
      position: 'absolute',
      right: 20,
      top: 16,
    },
    currencySwitch: {
      position: 'absolute',
      right: 20,
      top: 33,
      zIndex: 999,
    },
    seeFAQs: {
      fontSize: 13,
    },
    learnMoreContainer: {
      borderRadius: hp(40),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(34),
      width: wp(110),
      marginLeft: wp(10),
    },
    learnMoreButton: {
      zIndex: 10,
    },
    learnMoreButtonContainer: {
      position: 'absolute',
      top: hp(22),
      left: wp(240),
      borderWidth: 0.5,
      borderRadius: 5,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(80),
    },
    learnMoreText: {
      fontSize: 12,
      letterSpacing: 0.24,
      alignSelf: 'center',
    },
    headerContainer: {
      alignSelf: 'flex-start',
      borderBottomWidth: 0,
      backgroundColor: 'transparent',
      width: '90%',
      marginTop: wp(5),
    },
    bodyContainer: {
      width: '80%',
    },
    footerContainer: {
      paddingTop: '3%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 30,
      alignItems: 'center',
      marginBottom: 20,
    },
  });
