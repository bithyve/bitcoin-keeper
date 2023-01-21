import { Alert, SafeAreaView } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useState } from 'react';
import { getLedgerDetails } from 'src/hardware/ledger';

import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import usePlan from 'src/hooks/usePlan';
import { checkSigningDevice } from 'src/screens/Vault/AddSigningDevice';
import LedgerScanningModal from 'src/screens/Vault/components/LedgerScanningModal';
import HWError from 'src/hardware/HWErrorState';

function AddLedger() {
  const [visible, setVisible] = useState(true);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const addLedger = async (transport) => {
    try {
      const { xpub, xfp, derivationPath } = await getLedgerDetails(transport, isMultisig);
      const ledger: VaultSigner = generateSignerFromMetaData({
        xpub,
        xfp,
        derivationPath,
        storageType: SignerStorage.COLD,
        signerType: SignerType.LEDGER,
      });
      dispatch(addSigningDevice(ledger));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${ledger.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(ledger.signerId);
      if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, null, 3000, true);
      } else {
        captureError(error);
        showToast('Something went wrong, please try again!', null, 3000, true);
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

export default AddLedger;
