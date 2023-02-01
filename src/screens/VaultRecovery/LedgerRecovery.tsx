import { SafeAreaView } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useState } from 'react';
import { getLedgerDetails } from 'src/hardware/ledger';

import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { captureError } from 'src/core/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import LedgerScanningModal from 'src/screens/Vault/components/LedgerScanningModal';
import HWError from 'src/hardware/HWErrorState';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';

function LedgerRecovery() {
  const [visible, setVisible] = useState(true);
  const { signingDevices } = useAppSelector((state) => state.bhr);
  const isMultisig = signingDevices.length >= 1;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const addLedger = async (transport) => {
    try {
      const { xpub, xfp, derivationPath, xpubDetails } = await getLedgerDetails(
        transport,
        isMultisig
      );
      const ledger: VaultSigner = generateSignerFromMetaData({
        xpub,
        xfp,
        derivationPath,
        storageType: SignerStorage.COLD,
        signerType: SignerType.LEDGER,
        isMultisig,
        xpubDetails,
      });
      dispatch(setSigningDevices(ledger));
      navigation.dispatch(
        CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
      );
      showToast(`${ledger.signerName} added successfully`, <TickIcon />);
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
      } else {
        captureError(error);
        showToast('Something went wrong, please try again!', <ToastErrorIcon />);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LedgerScanningModal
        visible={visible}
        setVisible={setVisible}
        callback={addLedger}
        interactionText="Connecting..."
        infoText="Select to add this device"
        goBackOnDismiss
      />
    </SafeAreaView>
  );
}

export default LedgerRecovery;
