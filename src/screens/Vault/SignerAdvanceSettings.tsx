import Text from 'src/components/KeeperText';
import { Box, HStack, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getSignerNameFromType } from 'src/hardware';
import moment from 'moment';
import { registerToColcard } from 'src/hardware/coldcard';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import { globalStyles } from 'src/common/globalStyles';
import { regsiterWithLedger } from 'src/hardware/ledger';
import useVault from 'src/hooks/useVault';
import { WalletMap } from './WalletMap';
import DescriptionModal from './components/EditDescriptionModal';

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
  const signerName = getSignerNameFromType(
    signer.type,
    signer.isMock,
    signer.amfData && signer.amfData.xpub
  );
  const [nfcModal, setNfcModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const openNfc = () => setNfcModal(true);
  const closeNfc = () => setNfcModal(false);
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  const { activeVault } = useVault();

  const register = async () => {
    if (signer.type === SignerType.COLDCARD) {
      openNfc();
      await registerToColcard({ vault: activeVault });
      closeNfc();
    }
  };
  const transport = null;

  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const registerSigner = () => {
    switch (signer.type) {
      case SignerType.COLDCARD:
        register();
        return;
      case SignerType.LEDGER:
        regsiterWithLedger(activeVault, transport);
        return;
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR'));
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

  const changePolicy = () => {
    if (isPolicyServer) navigateToPolicyChange(signer);
  };

  const { font12, font10, font14 } = globalStyles;
  return (
    <ScreenWrapper>
      <HeaderTitle title="Advanced Settings" headerTitleColor="light.textBlack" />
      <Box backgroundColor={gradientStyles} style={styles.card}>
        <HStack alignItems="center">
          <Box style={styles.circle}>{WalletMap(signer.type, true).Icon}</Box>
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
      <NfcPrompt visible={nfcModal} />
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
