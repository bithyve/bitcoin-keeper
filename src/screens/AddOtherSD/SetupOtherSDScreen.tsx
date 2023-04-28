import { StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import { Box } from 'native-base';
import { wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import usePlan from 'src/hooks/usePlan';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { checkSigningDevice } from '../Vault/AddSigningDevice';

function SetupOtherSDScreen() {
  const [xpub, setXpub] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [masterFingerprint, setMasterFingerprint] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

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
      dispatch(addSigningDevice(signer));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${signer.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(signer.signerId);
      if (exsists) showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else {
        showToast(error.message, <ToastErrorIcon />);
      }
    }
  };
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Setup other signing device"
        subtitle="Manually provide the signer details"
      />
      <Box style={styles.flex}>
        <TextInput
          style={styles.input}
          value={xpub}
          onChangeText={setXpub}
          placeholder="xPub"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={derivationPath}
          onChangeText={setDerivationPath}
          placeholder="Derivation path (m/84h/0h/0h)"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={masterFingerprint}
          onChangeText={setMasterFingerprint}
          placeholder="Master fingerprint"
          autoCapitalize="none"
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
