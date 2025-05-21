import { Box, Modal, useColorMode } from 'native-base';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import CloseGreen from 'src/assets/images/dark-close-icon.svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveValue } from 'native-base/lib/typescript/components/types';
import Text from 'src/components/KeeperText';
import { useKeyboard } from 'src/hooks/useKeyboard';
import CurrencyTypeSwitch from './Switch/CurrencyTypeSwitch';
import Buttons from './Buttons';
import Fonts from 'src/constants/Fonts';
import InfoIcon from 'src/assets/images/info_icon.svg';
import InfoIconDark from 'src/assets/images/info-Dark-icon.svg';
import ThemedSvg from './ThemedSvg.tsx/ThemedSvg';

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
  learnMoreButtonText?: string;
  learnButtonBackgroundColor?: string;
  learnButtonTextColor?: string;
  closeOnOverlayClick?: boolean;
  showCloseIcon?: boolean;
  showCurrencyTypeSwitch?: boolean;
  justifyContent?: ResponsiveValue<string | number>;
  loading?: boolean;
  secondaryIcon?: any;
};

function KeeperModal(props: ModalProps) {
  const {
    visible,
    close,
    title = '',
    subTitle = null,
    subTitleWidth = windowWidth * 0.7,
    modalBackground = 'primaryBackground',
    buttonBackground = 'greenButtonBackground',
    buttonText = null,
    buttonTextColor = 'buttonText',
    buttonCallback = () => {},
    textColor = 'black',
    subTitleColor: ignored = null,
    secondaryButtonText = null,
    secondaryCallback = () => {},
    DarkCloseIcon = false,
    Content = () => null,
    dismissible = true,
    learnMoreButton = false,
    learnMoreButtonPressed = () => {},
    learnMoreButtonText = null,
    learnButtonTextColor = 'light.white',
    learnButtonBackgroundColor = 'BrownNeedHelp',
    secButtonTextColor = 'headerText',
    closeOnOverlayClick = true,
    showCloseIcon = true,
    showCurrencyTypeSwitch = false,
    justifyContent = 'flex-end',
    loading = false,
    secondaryIcon = null,
  } = props;
  const subTitleColor = ignored || textColor;
  const { bottom } = useSafeAreaInsets();
  const bottomMargin = Platform.select<number>({ ios: bottom, android: 10 });
  const isKeyboardOpen = useKeyboard();
  const { height: screenHeight } = useWindowDimensions();
  const availableHeight = screenHeight - bottom - (isKeyboardOpen ? hp(200) : hp(100));
  const maxModalHeight = Math.min(availableHeight, screenHeight * 0.85);
  const { colorMode } = useColorMode();
  const isDarKMode = colorMode === 'dark';

  if (!visible) {
    return null;
  }
  const getCloseIcon = () => (DarkCloseIcon ? <CloseGreen /> : <ThemedSvg name={'close_icon'} />);

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
          <Box
            backgroundColor={
              modalBackground === 'primaryBackground'
                ? `${colorMode}.modalWhiteBackground`
                : modalBackground
            }
            style={styles.container}
          >
            <Box>
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
                  <Box style={styles.learnMoreButtonContainer}>
                    {isDarKMode ? <InfoIconDark /> : <InfoIcon />}
                  </Box>
                </TouchableOpacity>
              )}
              {title || subTitle ? (
                <Modal.Header style={styles.headerContainer}>
                  <Text
                    testID="text_modal_title"
                    style={styles.title}
                    semiBold
                    color={textColor === 'black' ? `${colorMode}.black` : textColor}
                  >
                    {title}
                  </Text>
                  {subTitle ? (
                    <Text
                      testID="text_modal_subtitle"
                      style={styles.subTitle}
                      color={subTitleColor === 'black' ? `${colorMode}.black` : subTitleColor}
                    >
                      {`${subTitle}`}
                    </Text>
                  ) : null}
                </Modal.Header>
              ) : null}
            </Box>
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
                      primaryBackgroundColor={
                        buttonBackground == 'greenButtonBackground'
                          ? `${colorMode}.pantoneGreen`
                          : buttonBackground
                      }
                      primaryTextColor={
                        buttonTextColor == 'buttonText'
                          ? `${colorMode}.buttonText`
                          : buttonTextColor
                      }
                      secondaryCallback={secondaryCallback}
                      secondaryText={secondaryButtonText}
                      SecondaryIcon={secondaryIcon}
                      secondaryTextColor={
                        secButtonTextColor == 'headerText'
                          ? `${colorMode}.textGreen`
                          : secButtonTextColor
                      }
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
      fontSize: 18,
      lineHeight: 27.2,
      marginBottom: hp(3),
      fontFamily: Fonts.LoraSemiBold,
    },

    subTitle: {
      fontSize: 14,
      lineHeight: 20,
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
      top: 24,
      zIndex: 999,
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
      right: wp(-10),
      borderRadius: 5,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(80),
    },
    learnMoreText: {
      fontSize: 12,
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
