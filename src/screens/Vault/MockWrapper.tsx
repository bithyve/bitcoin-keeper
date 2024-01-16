import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { SignerType } from 'src/core/wallets/enums';
import { getMockSigner } from 'src/hardware';
import useToastMessage from 'src/hooks/useToastMessage';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { captureError } from 'src/services/sentry';
import { View } from 'native-base';
import { InteracationMode } from './HardwareModalMap';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import useUnkownSigners from 'src/hooks/useUnkownSigners';

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
  signerXfp?: string; //needed in Identification and HC flow
}) {
  const dispatch = useDispatch();
  const nav = navigation ?? useNavigation();
  const { showToast } = useToastMessage();
  const addMockSigner = () => {
    try {
      const data = getMockSigner(signerType);
      if (data.signer && data.key) {
        const { signer } = data;
        dispatch(addSigningDevice([signer]));
        const navigationState = addSignerFlow
          ? { name: 'Home' }
          : { name: 'AddSigningDevice', merge: true, params: {} };
        nav.dispatch(CommonActions.navigate(navigationState));

        showToast(`${signer.signerName} added successfully`, <TickIcon />);
      }
    } catch (error) {
      captureError(error);
    }
  };
  const { mapUnknownSigner } = useUnkownSigners();
  const verifyMockSigner = () => {
    try {
      const data = getMockSigner(signerType);
      console.log(data.signer.masterFingerprint, mode);
      const handleSuccess = () => {
        dispatch(healthCheckSigner([data.signer]));
        nav.dispatch(CommonActions.goBack());
        showToast(`${data.signer.type} verified successfully`, <TickIcon />);
      };

      const handleFailure = () => {
        showToast('Something went wrong, please try again!', null, 2000, true);
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

  const handleMockTap = () => {
    if (mode === InteracationMode.VAULT_ADDITION || mode === InteracationMode.APP_ADDITION) {
      addMockSigner();
    } else if (mode === InteracationMode.HEALTH_CHECK) {
      verifyMockSigner();
    } else if (mode === InteracationMode.IDENTIFICATION) {
      verifyMockSigner();
    } else {
      console.log('unhandled case');
    }
  };
  if (!enable) {
    return children;
  }
  return (
    <TapGestureHandler numberOfTaps={3} onActivated={handleMockTap}>
      <View flex={1}>{children}</View>
    </TapGestureHandler>
  );
}

export default MockWrapper;
