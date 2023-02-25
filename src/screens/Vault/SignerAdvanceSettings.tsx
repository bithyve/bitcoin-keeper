import Text from 'src/components/KeeperText';
import { Box, HStack, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import moment from 'moment';
import { registerToColcard } from 'src/hardware/coldcard';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import { globalStyles } from 'src/common/globalStyles';
import { regsiterWithLedger } from 'src/hardware/ledger';
import useVault from 'src/hooks/useVault';
import { captureError } from 'src/core/services/sentry';
import useNfcModal from 'src/hooks/useNfcModal';
import { SDIcons } from './SigningDeviceIcons';
import DescriptionModal from './components/EditDescriptionModal';
import LedgerScanningModal from './components/LedgerScanningModal';

const { width } = Dimensions.get('screen');

const gradientStyles = {
  linearGradient: {
    colors: ['#B17F44', '#6E4A35'],
    start: [0, 0],
    end: [1, 0],
  },
};

function SignerAdvanceSettings({ route }: any) {
  const { signer }: { signer: VaultSigner } = route.params;
  const { showToast } = useToastMessage();
  const signerName = getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer));

  const [visible, setVisible] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  const { activeVault } = useVault();

  const registerColdCard = async () => {
    await withNfcModal(() => registerToColcard({ vault: activeVault }));
  };

  const registerLedger = async (transport) => {
    try {
      const { policyId } = await regsiterWithLedger(activeVault, transport);
      setLedgerModal(false);
      if (policyId) {
        dispatch(updateSignerDetails(signer, 'registered', true));
      }
    } catch (err) {
      if (
        err.toString() ===
        'TransportStatusError: Ledger device: Condition of use not satisfied (denied by the user?) (0x6985)'
      ) {
        showToast('Registration was denied by the user', <ToastErrorIcon />);
        return;
      }
      setLedgerModal(false);
      captureError(err);
    }
  };

  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const registerSigner = async () => {
    switch (signer.type) {
      case SignerType.COLDCARD:
        await registerColdCard();
        dispatch(updateSignerDetails(signer, 'registered', true));
        return;
      case SignerType.LEDGER:
        setLedgerModal(true);
        return;
      case SignerType.BITBOX02:
        navigation.dispatch(CommonActions.navigate('RegisterWithChannel', { signer }));
        break;
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR', { signer }));
        break;
      default:
        showToast('Comming soon', null, 1000);
        break;
    }
  };

  const navigateToPolicyChange = (signer: VaultSigner) => {
    const restrictions = idx(signer, (_) => _.signerPolicy.restrictions);
    const exceptions = idx(signer, (_) => _.signerPolicy.exceptions);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: {
          restrictions,
          exceptions,
          update: true,
          signer,
        },
      })
    );
  };

  const isPolicyServer = signer.type === SignerType.POLICY_SERVER;
  const isLedger = signer.type === SignerType.LEDGER;

  const changePolicy = () => {
    if (isPolicyServer) navigateToPolicyChange(signer);
  };

  const { font12, font10, font14 } = globalStyles;
  return (
    <ScreenWrapper>
      <HeaderTitle title="Advanced Settings" headerTitleColor="light.textBlack" />
      <Box backgroundColor={gradientStyles} style={styles.card}>
        <HStack alignItems="center">
          <Box style={styles.circle}>{SDIcons(signer.type, true).Icon}</Box>
          <VStack justifyContent="center" px={4}>
            <Text color="white" style={[font14]}>
              {signerName}
            </Text>
            <Text color="white" style={[font10]} light>
              {moment(signer.addedOn).calendar().toLowerCase()}
            </Text>
            {signer.signerDescription ? (
              <Text color="white" style={[font12]} light>
                {signer.signerDescription}
              </Text>
            ) : null}
          </VStack>
        </HStack>
      </Box>
      <TouchableOpacity onPress={openDescriptionModal}>
        <HStack style={styles.item}>
          <VStack px={4} width="90%">
            <Text color="light.primaryText" style={[font14]}>
              Edit Description
            </Text>
            <Text color="light.primaryText" style={[font12]} light>
              Short description to help you remember
            </Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </TouchableOpacity>
      <TouchableOpacity onPress={registerSigner}>
        <HStack style={styles.item}>
          <VStack px={4} width="90%">
            <Text color="light.primaryText" style={[font14]}>
              Manual Registration
            </Text>
            <Text color="light.primaryText" style={[font12]} light>
              {`Register your active vault with the ${signerName}.`}
            </Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </TouchableOpacity>
      {isPolicyServer && (
        <TouchableOpacity onPress={changePolicy}>
          <HStack style={styles.item}>
            <VStack px={4} width="90%">
              <Text color="light.primaryText" style={[font14]}>
                Change Verification & Policy
              </Text>
              <Text color="light.primaryText" style={[font12]} light>
                Restriction and threshold
              </Text>
            </VStack>
            <RightArrowIcon />
          </HStack>
        </TouchableOpacity>
      )}
      {ledgerModal && isLedger && (
        <LedgerScanningModal
          visible={ledgerModal}
          setVisible={setLedgerModal}
          callback={registerLedger}
          infoText="Select to register the vault with this device"
          interactionText="Registering..."
        />
      )}
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
      <DescriptionModal
        visible={visible}
        close={closeDescriptionModal}
        signer={signer}
        callback={(value: any) => {
          navigation.setParams({ signer: { ...signer, signerDescription: value } });
          dispatch(updateSignerDetails(signer, 'signerDescription', value));
        }}
      />
    </ScreenWrapper>
  );
}

export default SignerAdvanceSettings;

const styles = StyleSheet.create({
  card: {
    height: 80,
    width: '100%',
    borderRadius: 10,
    marginVertical: '10%',
    paddingHorizontal: '6%',
    justifyContent: 'center',
  },
  circle: {
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#694B2E',
  },
  item: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  descriptionBox: {
    height: 24,
    backgroundColor: '#FDF7F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  descriptionEdit: {
    height: 50,
    backgroundColor: '#FDF7F0',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  descriptionContainer: {
    width: width * 0.8,
  },
});
