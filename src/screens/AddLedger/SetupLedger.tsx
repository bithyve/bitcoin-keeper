import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useState } from 'react';
import { getLedgerDetails } from 'src/hardware/ledger';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

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
import ScreenWrapper from 'src/components/ScreenWrapper';

function AddLedger() {
  const [visible, setVisible] = useState(true);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

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
      dispatch(addSigningDevice(ledger));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${ledger.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(ledger.signerId);
      if (exsists)
        showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />, 3000);
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
    <ScreenWrapper>
      <LedgerScanningModal
        visible={visible}
        setVisible={setVisible}
        callback={addLedger}
        interactionText="Connecting..."
        infoText="Select to add this device"
        goBackOnDismiss
      />
    </ScreenWrapper>
  );
}

export default AddLedger;
