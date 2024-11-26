/* eslint-disable react/no-unstable-nested-components */
import { Box, StatusBar, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Text from 'src/components/KeeperText';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import Passwordlock from 'src/assets/images/passwordlock.svg';
import AnalyticsIllustration from 'src/assets/images/analytics-illustration.svg';

import { storeCreds, switchCredsChanged } from 'src/store/sagaActions/login';
import KeeperModal from 'src/components/KeeperModal';
import { setEnableAnalyticsLogin } from 'src/store/reducers/settings';
import { setIsInitialLogin } from 'src/store/reducers/login';
import { throttle } from 'src/utils/utilities';
import Buttons from 'src/components/Buttons';
import PinDotView from 'src/components/AppPinInput/PinDotView';

export default function CreatePin(props) {
  const { colorMode } = useColorMode();
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [createPassword, setCreatePassword] = useState(false);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);
  const [shareAnalyticsModal, setShareAnalyticsModal] = useState(false);
  const { oldPasscode } = props.route.params || {};
  const dispatch = useAppDispatch();
  const { credsChanged, hasCreds } = useAppSelector((state) => state.login);
  const [isDisabled, setIsDisabled] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;
  const analyticsEnabled = useAppSelector((state) => state.settings.enableAnalytics);

  useEffect(() => {
    if (hasCreds) {
      props.navigation.navigate('OnBoardingSlides');
    }
  }, [hasCreds]);

  const onPressNumber = throttle((text) => {
    let tmpPasscode = passcode;
    let tmpConfirmPasscode = confirmPasscode;

    if (passcodeFlag) {
      if (passcode.length < 4 && text !== 'x') {
        tmpPasscode += text;
        setPasscode(tmpPasscode);
      } else if (text === 'x') {
        setPasscode(passcode.slice(0, -1));
      }
    } else if (confirmPasscodeFlag) {
      if (confirmPasscode.length < 4 && text !== 'x') {
        tmpConfirmPasscode += text;
        setConfirmPasscode(tmpConfirmPasscode);
      } else if (text === 'x') {
        setConfirmPasscode(confirmPasscode.slice(0, -1));
      }
    }
  }, 300);

  const onDeletePressed = (text) => {
    if (passcodeFlag) {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, confirmPasscode.length - 1));
    }
  };

  useEffect(() => {
    if (confirmPasscode.length <= 4 && confirmPasscode.length > 0 && passcode.length === 4) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(2);
    } else if (passcode.length === 4 && confirmPasscodeFlag !== 2) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(1);
    } else if (
      !confirmPasscode &&
      passcode.length > 0 &&
      passcode.length <= 4 &&
      confirmPasscodeFlag === 2
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    } else if (!confirmPasscode && passcode.length > 0 && passcode.length <= 4) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    }
  }, [passcode, confirmPasscode]);

  useEffect(() => {
    if (credsChanged === 'changed') {
      setIsDisabled(false);
      if (oldPasscode === '') {
        dispatch(switchCredsChanged());
        props.navigation.goBack();
        if (props.navigation.state.params.onPasscodeReset) {
          props.navigation.state.params.onPasscodeReset();
        }
      } else {
        props.navigation.navigate('PasscodeChangeSuccessPage');
      }
    }
  }, [credsChanged]);

  useEffect(() => {
    if (passcode === confirmPasscode && passcode.length === 4) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [passcode, confirmPasscode]);

  function ElectrumErrorContent() {
    const { colorMode } = useColorMode();
    return (
      <Box width={wp(320)}>
        <Box margin={hp(5)}>
          <DowngradeToPleb />
        </Box>
        <Box>
          <Text color={`${colorMode}.greenText`} fontSize={13} padding={1} letterSpacing={0.65}>
            Please try again later
          </Text>
        </Box>
      </Box>
    );
  }
  function CreatePassModalContent() {
    return (
      <Box>
        <Box style={styles.passImg}>
          <Passwordlock />
        </Box>
        <Text color={`${colorMode}.secondaryText`} style={styles.modalMessageText}>
          You would be locked out of the app if you forget your passcode and will have to recover it
        </Text>
      </Box>
    );
  }

  function ShareAnalyticsModalContent() {
    return (
      <Box>
        <Box style={styles.passImg}>
          <AnalyticsIllustration />
        </Box>
        <Text color={`${colorMode}.secondaryText`} style={styles.modalMessageText}>
          {login.shareAnalyticsDesc}
        </Text>
      </Box>
    );
  }

  const handleShareAnalytics = (enable) => {
    dispatch(setIsInitialLogin(true));
    dispatch(setEnableAnalyticsLogin(enable));
    dispatch(storeCreds(passcode));
    setShareAnalyticsModal(false);
  };

  return (
    <Box
      safeAreaTop
      testID="main"
      style={styles.container}
      backgroundColor={`${colorMode}.pantoneGreen`}
    >
      <Box style={styles.wrapper}>
        <StatusBar barStyle="light-content" />
        <Box style={styles.wrapper}>
          <Box style={styles.titleWrapper}>
            <Box>
              <Text style={styles.welcomeText} medium color={`${colorMode}.choosePlanHome`}>
                {login.welcome}
              </Text>
            </Box>
            <Box style={styles.passCodeWrapper}>
              <Box style={styles.createPasscodeWrapper}>
                <Text color={`${colorMode}.choosePlanHome`} style={styles.labelText}>
                  {login.Createpasscode}
                </Text>
                <PinDotView passCode={passcode} />
              </Box>
              {passcode.length === 4 ? (
                <Box style={styles.confirmPasscodeWrapper}>
                  <Text color={`${colorMode}.choosePlanHome`} style={styles.labelText}>
                    {login.Confirmyourpasscode}
                  </Text>
                  <Box>
                    <PinDotView passCode={confirmPasscode} />
                    {passcode !== confirmPasscode && confirmPasscode.length === 4 && (
                      <Text color={`${colorMode}.error`} italic style={styles.errorText}>
                        {login.MismatchPasscode}
                      </Text>
                    )}
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>
          <KeyPadView
            onDeletePressed={onDeletePressed}
            onPressNumber={onPressNumber}
            ClearIcon={<DeleteIcon />}
            bubbleEffect
          />
          <Box style={styles.btnWrapper}>
            <Buttons
              primaryCallback={() => {
                setCreatePassword(true);
              }}
              primaryText={common.create}
              primaryDisable={isDisabled}
              primaryBackgroundColor={`${colorMode}.buttonText`}
              primaryTextColor={`${colorMode}.pantoneGreen`}
              fullWidth
            />
          </Box>
        </Box>
      </Box>
      <KeeperModal
        visible={createPassword}
        close={() => {}}
        title="Remember your passcode"
        subTitle="Please remember your passcode and backup your app by writing down the 12-word Recovery
        Key"
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText="Continue"
        secondaryButtonText="Back"
        buttonCallback={() => {
          setCreatePassword(false);
          setShareAnalyticsModal(true);
        }}
        secondaryCallback={() => {
          setCreatePassword(false);
        }}
        Content={CreatePassModalContent}
        subTitleWidth={wp(80)}
      />
      <KeeperModal
        visible={shareAnalyticsModal}
        close={() => {}}
        title={login.shareAnalyticsTitle}
        subTitle={login.shareAnalyticsSubTitle}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText={common.share}
        secondaryButtonText={common.dontShare}
        buttonCallback={() => {
          handleShareAnalytics(true);
        }}
        secondaryCallback={() => {
          handleShareAnalytics(false);
        }}
        Content={ShareAnalyticsModalContent}
        subTitleWidth={wp(80)}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  wrapper: {
    flex: 1,
  },
  titleWrapper: {
    paddingTop: hp(6.7),
    alignItems: 'center',
    flex: 1,
    gap: hp(6),
  },
  welcomeText: {
    fontSize: 25,
    lineHeight: 27,
  },
  labelText: {
    fontSize: 14,
  },
  passCodeWrapper: {
    gap: hp(4.7),
  },
  createPasscodeWrapper: {
    gap: hp(1.8),
    alignItems: 'center',
  },
  confirmPasscodeWrapper: {
    alignItems: 'center',
    gap: hp(1.8),
  },
  errorText: {
    fontSize: 11,
    letterSpacing: 0.22,
    width: wp('68%'),
    textAlign: 'center',
    marginTop: 18,
  },
  bitcoinTestnetText: {
    fontWeight: '400',
    paddingHorizontal: 16,
    fontSize: 13,
    letterSpacing: 1,
  },
  modalMessageText: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  passImg: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  btnWrapper: {
    marginTop: 25,
    marginBottom: 30,
    alignSelf: 'center',
    width: '90%',
  },
});
