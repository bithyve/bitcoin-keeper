import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { SignerType } from 'src/services/wallets/enums';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import KeeperModal from 'src/components/KeeperModal';
import { getSignerNameFromType } from 'src/hardware';
import ChangeSignerIllustration from 'src/assets/images/changeSignerIllustration.svg';
import Clipboard from '@react-native-community/clipboard';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Buttons from 'src/components/Buttons';
import useToastMessage from 'src/hooks/useToastMessage';
import { translations } from 'src/context/Localization/LocContext';
import SigningServer from 'src/services/backend/SigningServer';
import { SDIcons } from '../SigningDeviceIcons';

type AssignSignerTypeCardProps = {
  type: SignerType;
  disabled: boolean;
  first?: boolean;
  last?: boolean;
  vault: Vault;
  primaryMnemonic: string;
  signer?: Signer;
};

function AssignSignerTypeCard({
  type,
  disabled,
  first = false,
  last = false,
  signer,
  vault,
}: AssignSignerTypeCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationModal, showValidationModal] = useState(false);
  const [otp, setOtp] = useState('');
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { common } = translations;

  const updateSignerType = () => {
    dispatch(updateSignerDetails(signer, 'type', type));
    dispatch(updateSignerDetails(signer, 'signerName', getSignerNameFromType(type, signer.isMock)));
  };

  const changeSignerType = () => {
    setShowConfirm(false);
    if (type === SignerType.POLICY_SERVER) {
      showValidationModal(true);
    } else {
      updateSignerType();
    }
  };

  const validateServerKey = async () => {
    const verificationToken = Number(otp);
    let signerId;
    for (const { masterFingerprint, xfp } of vault.signers) {
      if (masterFingerprint === signer.masterFingerprint) {
        signerId = xfp;
        break;
      }
    }

    if (!signerId) {
      showToast('Unable to find server key instance id');
      return;
    }

    try {
      const { valid, id, masterFingerprint, policy } = await SigningServer.fetchSignerSetup(
        signerId,
        verificationToken
      );
      if (valid) {
        if (id === signerId && masterFingerprint === signer.masterFingerprint) {
          dispatch(updateSignerDetails(signer, 'signerPolicy', policy));
          dispatch(updateSignerDetails(signer, 'isExternal', true));
          updateSignerType();
        } else throw new Error('Server Key mismatch');
      } else throw new Error('Server Key validation failed');
    } catch (err) {
      showToast(err?.message || 'Server Key validation failed');
    }

    setOtp('');
    showValidationModal(false);
  };

  const otpContent = useCallback(() => {
    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text !== 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text === 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box style={styles.otpContainer}>
        <Box>
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
                setOtp('');
              }
            }}
            testID="otpClipboardButton"
          >
            <CVVInputsView
              passCode={otp}
              passcodeFlag={false}
              backgroundColor
              textColor
              height={hp(46)}
              width={hp(46)}
              marginTop={hp(0)}
              marginBottom={hp(40)}
              inputGap={2}
              customStyle={styles.CVVInputsView}
            />
          </TouchableOpacity>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={`${colorMode}.primaryText`}
        />
        <Box mt={10} alignSelf="flex-end">
          <Box>
            <Buttons primaryCallback={validateServerKey} fullWidth primaryText="Confirm" />
          </Box>
        </Box>
      </Box>
    );
  }, [otp]);

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        onPress={() => setShowConfirm(true)}
        testID={`btn_identify_${type}`}
      >
        <Box
          backgroundColor={`${colorMode}.textInputBackground`}
          borderTopRadius={first ? 10 : 0}
          borderBottomRadius={last ? 10 : 0}
          borderWidth={isDarkMode ? 1 : 0}
          borderTopWidth={first && isDarkMode ? 1 : 0}
          borderBottomWidth={isDarkMode || !last ? 1 : 0}
          borderColor={`${colorMode}.dullGreyBorder`}
          style={[styles.container]}
        >
          <Box
            style={[
              styles.walletMapContainer,
              {
                opacity: disabled ? 0.4 : 1,
              },
            ]}
          >
            <Box style={styles.walletMapWrapper}>{SDIcons(type, colorMode === 'dark').Icon}</Box>
            <Box backgroundColor={`${colorMode}.dullGreyBorder`} style={styles.divider} />
            <Box style={styles.walletMapLogoWrapper}>{SDIcons(type).Logo}</Box>
            <Box style={styles.arrowIconWrapper}>
              {isDarkMode ? <RightArrowWhite /> : <RightArrow />}
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>

      <KeeperModal
        visible={showConfirm}
        close={() => setShowConfirm(false)}
        title="Changing Device Type"
        subTitle={`Are you sure you want to change the device type to ${getSignerNameFromType(
          type
        )}?`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText="Continue"
        secondaryButtonText="Cancel"
        secondaryCallback={() => setShowConfirm(false)}
        buttonCallback={changeSignerType}
        Content={() => (
          <Box style={styles.illustrationContainer}>
            <ChangeSignerIllustration />
          </Box>
        )}
      />

      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
          setOtp('');
        }}
        title={common.confirm2FACodeTitle}
        subTitle={common.confirm2FACodeSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={otpContent}
      />
    </>
  );
}

const styles = StyleSheet.create({
  walletMapContainer: {
    alignItems: 'center',
    minHeight: windowHeight * 0.075,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletMapWrapper: {
    marginRight: wp(13.2),
    alignItems: 'center',
  },
  walletMapLogoWrapper: {
    marginLeft: wp(20),
    justifyContent: 'flex-end',
    marginVertical: hp(20),
    width: windowWidth * 0.53,
  },
  divider: {
    height: hp(25),
    width: 1,
  },
  container: {
    alignItems: 'center',
  },
  arrowIconWrapper: {
    marginLeft: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIllustration: {
    alignSelf: 'center',
    marginBottom: hp(20),
    marginRight: wp(40),
  },
  warningText: {
    fontSize: 14,
    padding: 1,
    letterSpacing: 0.65,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpContainer: {
    width: '100%',
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AssignSignerTypeCard;
