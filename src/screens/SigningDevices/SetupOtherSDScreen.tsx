import { StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import Colors from 'src/theme/Colors';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import KeeperTextInput from 'src/components/KeeperTextInput';

function SetupOtherSDScreen({ route }) {
  const { colorMode } = useColorMode();
  const [xpub, setXpub] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [masterFingerprint, setMasterFingerprint] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { mode, isMultisig, signer: hcSigner } = route.params;

  const validateAndAddSigner = async () => {
    try {
      if (!xpub.match(/^([xyYzZtuUvV]pub[1-9A-HJ-NP-Za-km-z]{79,108})$/)) {
        throw new Error('Please check the xPub format');
      }
      const signer = generateSignerFromMetaData({
        xpub,
        derivationPath: derivationPath.replaceAll('h', "'"),
        xfp: masterFingerprint,
        isMultisig,
        signerType: SignerType.OTHER_SD,
        storageType: SignerStorage.COLD,
      });
      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(signer));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else if (mode === InteracationMode.SIGNING) {
        dispatch(addSigningDevice(signer));
        navigation.dispatch(
          CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
        );
        showToast(`${signer.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(signer.signerId);
        if (exsists)
          showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
      } else if (mode === InteracationMode.HEALTH_CHECK) {
        if (signer.xpub === hcSigner.xpub) {
          dispatch(healthCheckSigner([signer]));
          navigation.dispatch(CommonActions.goBack());
          showToast(`Other SD verified successfully`, <TickIcon />);
        } else {
          showToast('Something went wrong!', <ToastErrorIcon />, 3000);
        }
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else {
        showToast(error.message, <ToastErrorIcon />);
      }
    }
  };
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`${
          mode === InteracationMode.HEALTH_CHECK ? 'Verify' : 'Setup'
        } other signing device`}
        subtitle="Manually provide the signer details"
      />
      <Box style={styles.flex}>
        <KeeperTextInput placeholder="xPub" value={xpub} onChangeText={setXpub} testID={'xPub'} />
        <KeeperTextInput
          placeholder="Derivation path (m/84h/0h/0h)"
          value={derivationPath}
          onChangeText={setDerivationPath}
          testID={'derivationPath'}
        />
        <KeeperTextInput
          placeholder="Master fingerprint"
          value={masterFingerprint}
          onChangeText={setMasterFingerprint}
          testID={'masterFingerprint'}
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
    marginHorizontal: '5%',
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
