import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { generateSignerFromMetaData, getSignerNameFromType } from 'src/hardware';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { pickDocument } from 'src/services/documents';
import { extractColdCardExport, getColdcardDetails } from 'src/hardware/coldcard';
import { getPassportDetails } from 'src/hardware/passport';
import { HWErrorType } from 'src/models/enums/Hardware';
import OptionCard from 'src/components/OptionCard';
import { getKeystoneDetails, getKeystoneDetailsFromFile } from 'src/hardware/keystone';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { getJadeDetails } from 'src/hardware/jade';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import WalletHeader from 'src/components/WalletHeader';
import KeeperModal from 'src/components/KeeperModal';
import Instruction from 'src/components/Instruction';
import { TouchableOpacity } from 'react-native-gesture-handler';
import InfoIconDark from 'src/assets/images/info-Dark-icon.svg';
import InfoIcon from 'src/assets/images/info_icon.svg';
import OtherSignerOptionModal from './components/OtherSignerOptionModal';

function SetupOtherSDScreen({ route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [xpub, setXpub] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [masterFingerprint, setMasterFingerprint] = useState('');
  const [optionModal, setOptionModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const {
    mode,
    signer: hcSigner,
    isMultisig,
    addSignerFlow = false,
    Illustration,
    Instructions,
  } = route.params;

  const validateAndAddSigner = async () => {
    try {
      if (!xpub.match(/^([xyYzZtuUvV]pub[1-9A-HJ-NP-Za-km-z]{79,108})$/)) {
        throw new Error('Please check the xPub format');
      }
      const { signer, key } = generateSignerFromMetaData({
        xpub,
        derivationPath: derivationPath.replaceAll('h', "'"),
        masterFingerprint,
        isMultisig,
        signerType: SignerType.OTHER_SD,
        storageType: SignerStorage.COLD,
      });
      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(signer));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else if (mode === InteracationMode.VAULT_ADDITION) {
        dispatch(addSigningDevice([signer]));
        const navigationState = addSignerFlow
          ? { name: 'Home' }
          : { name: 'AddSigningDevice', merge: true, params: {} };
        navigation.dispatch(CommonActions.navigate(navigationState));
        showToast(
          `${signer.signerName} added successfully`,
          <TickIcon />,
          IToastCategory.SIGNING_DEVICE
        );
      } else if (mode === InteracationMode.HEALTH_CHECK) {
        if (key.xpub === hcSigner.xpub) {
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
              },
            ])
          );
          navigation.dispatch(CommonActions.goBack());
          showToast('Other SD verified successfully', <TickIcon />);
        } else {
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_FAILED,
              },
            ])
          );
          showToast('Something went wrong!', <ToastErrorIcon />);
        }
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
      } else {
        showToast(error.message, <ToastErrorIcon />);
      }
    }
  };

  const onQrScan = async (qrData) => {
    try {
      let hw: any;
      try {
        hw = getPassportDetails(qrData);
      } catch (e) {
        // ignore and try other type
      }
      try {
        hw = getSeedSignerDetails(qrData);
      } catch (error) {
        // ignore and try other type
      }
      try {
        hw = getKeystoneDetails(qrData);
      } catch (error) {
        // ignore and try other type
      }
      try {
        hw = getJadeDetails(qrData);
      } catch (error) {
        // ignore
      }
      try {
        hw = extractColdCardExport(JSON.parse(qrData), isMultisig);
      } catch (error) {
        // ignore
      }

      if (hw) {
        const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } = hw;
        if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
          const { signer } = generateSignerFromMetaData({
            xpub,
            derivationPath,
            masterFingerprint,
            isMultisig,
            signerType: SignerType.OTHER_SD,
            storageType: SignerStorage.COLD,
          });
          if (signer) {
            dispatch(addSigningDevice([signer]));
            const navigationState = addSignerFlow
              ? { name: 'Home' }
              : { name: 'AddSigningDevice', merge: true, params: {} };
            navigation.dispatch(CommonActions.navigate(navigationState));
            showToast('signer added successfully', <TickIcon />, IToastCategory.SIGNING_DEVICE);
          }
        } else {
          throw new HWError(HWErrorType.INVALID_SIG);
        }
      } else {
        showToast('Please scan a valid QR', <ToastErrorIcon />);
      }
    } catch (e) {
      if (e instanceof HWError) {
        showToast(e.message, <ToastErrorIcon />);
        return;
      }
      showToast('Please scan a valid QR', <ToastErrorIcon />);
    }
  };

  const navigatetoQR = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `Setting up ${getSignerNameFromType(SignerType.OTHER_SD)}`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan,
          setup: true,
          type: SignerType.OTHER_SD,
          isSingning: true,
          importOptions: false,
        },
      })
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={`${mode === InteracationMode.HEALTH_CHECK ? 'Verify' : 'Setup'} other signer`}
        subTitle="Manually provide the signer details"
        rightComponent={
          InteracationMode.VAULT_ADDITION ? (
            <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
              {isDarkMode ? <InfoIconDark /> : <InfoIcon />}
            </TouchableOpacity>
          ) : null
        }
      />
      <Box style={styles.flex}>
        <KeeperTextInput
          placeholder="xPub"
          value={xpub}
          onChangeText={setXpub}
          testID="xPub"
          placeholderTextColor={`${colorMode}.SlateGreen`}
        />
        <KeeperTextInput
          placeholder="Derivation path (m/84h/0h/0h)"
          value={derivationPath}
          onChangeText={setDerivationPath}
          testID="derivationPath"
          placeholderTextColor={`${colorMode}.SlateGreen`}
        />
        <KeeperTextInput
          placeholder="Master fingerprint"
          value={masterFingerprint}
          onChangeText={setMasterFingerprint}
          testID="masterFingerprint"
          placeholderTextColor={`${colorMode}.SlateGreen`}
        />
        <OptionCard
          title="Show import options"
          description="Add an air-gapped device using a QR, NFC, or file"
          callback={() => {
            setOptionModal(true);
          }}
        />
      </Box>
      <Buttons
        primaryText="Proceed"
        primaryCallback={validateAndAddSigner}
        primaryDisable={!xpub.length || !derivationPath.length || masterFingerprint.length !== 8}
      />
      <KeeperModal
        visible={infoModal}
        close={() => {
          setInfoModal(false);
        }}
        title={'Add Signer'}
        subTitle={`Get your Signer ready before proceeding.`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box style={styles.illustrations}>{Illustration}</Box>

            {Instructions?.map((instruction) => (
              <Instruction text={instruction} key={instruction} />
            ))}
          </Box>
        )}
      />
      <KeeperModal
        visible={optionModal}
        close={() => {
          setOptionModal(false);
        }}
        title={'Add signer'}
        subTitle={`Choose how you would like to add your signer`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <OtherSignerOptionModal
              signer={SignerType.OTHER_SD}
              setOptionModal={setOptionModal}
              navigatetoQR={navigatetoQR}
              setData={onQrScan}
            />
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

export default SetupOtherSDScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    marginHorizontal: '2.5%',
    marginTop: '5%',
  },
  input: {
    margin: '5%',
    paddingHorizontal: 15,
    width: wp(305),
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 1,
  },
  infoIcon: {
    marginRight: wp(10),
  },
  illustrations: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
});
