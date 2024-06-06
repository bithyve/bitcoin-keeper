import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { SignerType } from 'src/services/wallets/enums';
import { getMockSigner } from 'src/hardware';
import useToastMessage from 'src/hooks/useToastMessage';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { captureError } from 'src/services/sentry';
import { Box, Text, View, useColorMode } from 'native-base';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import { InteracationMode } from './HardwareModalMap';
import useCanaryWalletSetup from 'src/hooks/UseCanaryWalletSetup';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import { SDIcons } from './SigningDeviceIcons';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import moment from 'moment';
import { LocalizationContext } from 'src/context/Localization/LocContext';

MockWrapper.defaultProps = {
  enable: true,
  isRecovery: false,
  navigation: null,
  mode: InteracationMode.VAULT_ADDITION,
};

function MockWrapper({
  children,
  signerType,
  enable,
  navigation,
  addSignerFlow = false,
  mode,
  signerXfp,
}: {
  children: any;
  signerType: SignerType;
  enable?: boolean;
  navigation?: NavigationProp<any>;
  addSignerFlow?: boolean;
  mode: InteracationMode;
  signerXfp?: string; // needed in Identification and HC flow
}) {
  const dispatch = useDispatch();
  const nav = navigation ?? useNavigation();
  const { showToast } = useToastMessage();
  const [keyAddedModal, setKeyAddedModal] = useState(false);
  const { colorMode } = useColorMode();
  const [signer, setSigner] = useState(null);
  const { translations } = useContext(LocalizationContext);
  const { common, vault, signer: signerTranslations } = translations;

  const addMockSigner = () => {
    try {
      const data = getMockSigner(signerType);
      if (data?.signer && data?.key) {
        setSigner(data.signer);
        dispatch(addSigningDevice([signer]));
        setKeyAddedModal(true);
      }
    } catch (error) {
      if (error.toString().includes("We don't support")) {
        showToast(error.toString());
        return;
      }
      captureError(error);
    }
  };
  const { mapUnknownSigner } = useUnkownSigners();
  const verifyMockSigner = () => {
    try {
      const data = getMockSigner(signerType);
      const handleSuccess = () => {
        dispatch(healthCheckSigner([data.signer]));
        nav.dispatch(CommonActions.goBack());
        showToast(`${data.signer.type} ${signerTranslations.verifiedSuccessMessage}`, <TickIcon />);
      };

      const handleFailure = () => {
        showToast(signerTranslations.wentWrongErrorMessage);
      };

      if (mode === InteracationMode.IDENTIFICATION) {
        const mapped = mapUnknownSigner({
          masterFingerprint: data.signer.masterFingerprint,
          type: data.signer.type,
        });
        if (mapped) {
          handleSuccess();
        } else {
          handleFailure();
        }
      } else {
        if (signerXfp === data.signer.masterFingerprint) {
          console.log('here');
          handleSuccess();
        } else {
          handleFailure();
        }
      }
    } catch (error) {
      captureError(error);
      console.error('Vrification Failed', error);
    }
  };

  const { createCreateCanaryWallet } = useCanaryWalletSetup({});

  const addCanarySingleSig = () => {
    try {
      const data = getMockSigner(signerType);
      if (data?.signer && data?.key) {
        const { signer } = data;
        dispatch(addSigningDevice([signer]));
        createCreateCanaryWallet(signer);
      }
    } catch (error) {
      console.log('Something Went Wrong');
      captureError(error);
    }
  };

  function ModalCard({ title, subTitle, icon = null }) {
    const { colorMode } = useColorMode();
    return (
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.cardContainer}>
        <Box style={styles.iconContainer}>
          <HexagonIcon
            width={wp(42.5)}
            height={hp(38)}
            icon={icon}
            backgroundColor={colorMode == 'dark' ? Colors.ForestGreenDark : Colors.pantoneGreen}
          />
        </Box>
        <Box style={styles.textContainer}>
          <Text style={styles.titleText} color={`${colorMode}.headerText`}>
            {title}
          </Text>
          <Text style={styles.subTitleText} color={`${colorMode}.GreyText`}>
            {subTitle}
          </Text>
        </Box>
      </Box>
    );
  }
  const handleMockTap = () => {
    if (mode === InteracationMode.VAULT_ADDITION || mode === InteracationMode.APP_ADDITION) {
      addMockSigner();
    } else if (mode === InteracationMode.HEALTH_CHECK) {
      verifyMockSigner();
    } else if (mode === InteracationMode.IDENTIFICATION) {
      verifyMockSigner();
    } else if (mode === InteracationMode.CANARY_ADDITION) {
      addCanarySingleSig();
    } else {
      console.log('unhandled case');
    }
  };
  if (!enable) {
    return children;
  }
  return (
    <TapGestureHandler numberOfTaps={3} onActivated={handleMockTap}>
      <View flex={1}>
        {children}
        <KeeperModal
          visible={keyAddedModal}
          close={() => setKeyAddedModal(false)}
          title={signerTranslations.signerAddedSuccessMessage}
          subTitle={signerTranslations.signerAvailableMessage}
          showCloseIcon={false}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalWhiteContent`}
          Content={() => (
            <Box style={{ gap: 20 }}>
              <ModalCard
                title={signer.type}
                icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
                subTitle={`Added ${moment(signer.addedOn).calendar()}`}
              />
              <Text style={styles.descText}>Perform regular health checks on your signer key</Text>
            </Box>
          )}
          buttonText={signerTranslations.signerDeatils}
          buttonTextColor={`${colorMode}.buttonText`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          buttonCallback={() => {
            setKeyAddedModal(false);
            const navigationState = addSignerFlow
              ? { name: 'ManageSigners' }
              : { name: 'AddSigningDevice', merge: true, params: {} };
            nav.dispatch(CommonActions.navigate(navigationState));
          }}
        />
      </View>
    </TapGestureHandler>
  );
}
const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: hp(70),
    marginBottom: hp(35),
    marginTop: hp(20),
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
    fontWeight: '400',
  },
  iconContainer: {
    marginHorizontal: 10,
  },
  textContainer: {},
  descText: {
    fontSize: 13,
    letterSpacing: 0.13,
    fontWeight: '400',
    marginBottom: hp(20),
  },
});

export default MockWrapper;
