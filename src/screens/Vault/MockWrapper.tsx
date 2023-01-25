import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { ReactElement } from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { SignerType } from 'src/core/wallets/enums';
import { getMockSigner } from 'src/hardware';
import useToastMessage from 'src/hooks/useToastMessage';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { captureError } from 'src/core/services/sentry';
import { setSigningDevices } from 'src/store/reducers/bhr';

MockWrapper.defaultProps = {
  enable: true,
};

function MockWrapper({
  children,
  signerType,
  enable,
  isRecovery = false,
}: {
  children: ReactElement;
  signerType: SignerType;
  enable?: boolean;
  isRecovery?: boolean;
}) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const addMockSigner = () => {
    try {
      const signer = getMockSigner(signerType);
      if (signer) {
        if (!isRecovery) {
          dispatch(addSigningDevice(signer));
          navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        }
        if (isRecovery) {
          dispatch(setSigningDevices(signer));
          navigation.dispatch(
            CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
          );
        }

        showToast(`${signer.signerName} added successfully`, <TickIcon />);
      }
    } catch (error) {
      captureError(error);
    }
  };
  if (!enable) {
    return children;
  }
  return (
    <TapGestureHandler numberOfTaps={3} onActivated={addMockSigner}>
      {children}
    </TapGestureHandler>
  );
}

export default MockWrapper;
