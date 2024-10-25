import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
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
import { extractColdCardExport } from 'src/hardware/coldcard';
import { getPassportDetails } from 'src/hardware/passport';
import { HWErrorType } from 'src/models/enums/Hardware';
import OptionCard from 'src/components/OptionCard';
import { getKeystoneDetails, getKeystoneDetailsFromFile } from 'src/hardware/keystone';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { getJadeDetails } from 'src/hardware/jade';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';

function SetupOtherSDScreen({ route }) {
  const { colorMode } = useColorMode();
  const [xpub, setXpub] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [masterFingerprint, setMasterFingerprint] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { mode, signer: hcSigner, isMultisig, addSignerFlow = false } = route.params;

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
          ? { name: 'ManageSigners' }
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

  const onQrScan = async (qrData, resetQR) => {
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
              ? { name: 'ManageSigners' }
              : { name: 'AddSigningDevice', merge: true, params: {} };
            navigation.dispatch(CommonActions.navigate(navigationState));
            showToast('signer added successfully', <TickIcon />, IToastCategory.SIGNING_DEVICE);
            resetQR();
          }
        } else {
          throw new HWError(HWErrorType.INVALID_SIG);
        }
      } else {
        resetQR();
        showToast('Please scan a valid QR', <ToastErrorIcon />);
      }
    } catch (e) {
      resetQR();
      if (e instanceof HWError) {
        showToast(e.message, <ToastErrorIcon />);
        return;
      }
      showToast('Please scan a valid QR', <ToastErrorIcon />);
    }
  };

  const handleError = (e) => {
    if (e instanceof HWError) {
      showToast(e.message, <ToastErrorIcon />);
    }
  };

  const handleFile = (file) => {
    try {
      let error;
      const data = JSON.parse(file);
      // file export from coldcard or passport(single sig)
      try {
        const ccDetails = extractColdCardExport(data, isMultisig);
        const { xpub, derivationPath, masterFingerprint, xpubDetails } = ccDetails;
        const { signer: coldcard } = generateSignerFromMetaData({
          xpub,
          derivationPath,
          masterFingerprint,
          isMultisig,
          signerType: SignerType.OTHER_SD,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });
        dispatch(addSigningDevice([coldcard]));
        const navigationState = addSignerFlow
          ? { name: 'ManageSigners' }
          : { name: 'AddSigningDevice', merge: true, params: {} };
        navigation.dispatch(CommonActions.navigate(navigationState));
        return;
      } catch (e) {
        error = e;
      }
      if (!(error instanceof HWError) || error.type === HWErrorType.INCORRECT_HW) {
        // file export from passport(multisig)
        try {
          const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
            getPassportDetails(data);
          if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
            const { signer: passport } = generateSignerFromMetaData({
              xpub,
              derivationPath,
              masterFingerprint,
              signerType: SignerType.OTHER_SD,
              storageType: SignerStorage.COLD,
              isMultisig,
            });
            dispatch(addSigningDevice([passport]));
            const navigationState = addSignerFlow
              ? { name: 'ManageSigners' }
              : { name: 'AddSigningDevice', merge: true, params: {} };
            navigation.dispatch(CommonActions.navigate(navigationState));
            return;
          }
        } catch (e) {
          error = e;
        }
        if (!(error instanceof HWError) || error.type === HWErrorType.INCORRECT_HW) {
          // file export from keystone
          try {
            const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
              getKeystoneDetailsFromFile(data);
            if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
              const { signer: keystone } = generateSignerFromMetaData({
                xpub,
                derivationPath,
                masterFingerprint,
                signerType: SignerType.OTHER_SD,
                storageType: SignerStorage.COLD,
                isMultisig,
              });
              dispatch(addSigningDevice([keystone]));
              const navigationState = addSignerFlow
                ? { name: 'ManageSigners' }
                : { name: 'AddSigningDevice', merge: true, params: {} };
              navigation.dispatch(CommonActions.navigate(navigationState));
              return;
            }
          } catch (e) {
            error = e;
          }
        }
      }
      if (error) {
        throw error;
      }
    } catch (e) {
      handleError(e);
      showToast('Please pick a valid file', <ToastErrorIcon />);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`${mode === InteracationMode.HEALTH_CHECK ? 'Verify' : 'Setup'} other signer`}
        subtitle="Manually provide the signer details"
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
          title="Pick a file"
          description="Add an air-gapped device using a file"
          callback={() => {
            pickDocument().then(handleFile);
          }}
        />
        <OptionCard
          title="Scan a QR code"
          description="Add an air-gapped device using a QR code"
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'ScanQR',
                params: {
                  title: `Setting up ${getSignerNameFromType(SignerType.OTHER_SD)}`,
                  subtitle: 'Please scan until all the QR data has been retrieved',
                  onQrScan,
                  setup: true,
                  type: SignerType.OTHER_SD,
                },
              })
            );
          }}
        />
      </Box>
      <Buttons
        primaryText="Proceed"
        primaryCallback={validateAndAddSigner}
        primaryDisable={!xpub.length || !derivationPath.length || masterFingerprint.length !== 8}
      />
    </ScreenWrapper>
  );
}

export default SetupOtherSDScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    marginHorizontal: '2.5%',
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
});
