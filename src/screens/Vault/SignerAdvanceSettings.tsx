import { Box, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import RightArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getSignerNameFromType } from 'src/hardware';
import moment from 'moment';
import { registerToColcard } from 'src/hardware/coldcard';
import { WalletMap } from './WalletMap';

const gradientStyles = {
  linearGradient: {
    colors: ['#B17F44', '#6E4A35'],
    start: [0, 0],
    end: [1, 0],
  },
};
function SignerAdvanceSettings({ route }) {
  const { signer }: { signer: VaultSigner } = route.params;
  const signerName = getSignerNameFromType(
    signer.type,
    signer.isMock,
    signer.amfData && signer.amfData.xpub
  );
  const [nfcModal, setNfcModal] = useState(false);
  const openNfc = () => setNfcModal(true);
  const closeNfc = () => setNfcModal(false);
  const { useQuery } = useContext(RealmWrapperContext);

  const Vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  const register = async () => {
    if (signer.type === SignerType.COLDCARD) {
      openNfc();
      await registerToColcard({ vault: Vault });
      closeNfc();
    }
  };

  const navigation = useNavigation();

  const registerSigner = () => {
    switch (signer.type) {
      case SignerType.COLDCARD:
        register();
        return;
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR'));
    }
  };

  return (
    <ScreenWrapper>
      <HeaderTitle title="Advanced Settings" headerTitleColor="#092C27" />
      <Box bg={gradientStyles} style={styles.card}>
        <HStack alignItems="center">
          <Box style={styles.circle}>{WalletMap(signer.type, true).Icon}</Box>
          <VStack justifyContent="center" px={4}>
            <Text color="white" fontSize={14} fontFamily="body" fontWeight="200">
              {signerName}
            </Text>
            <Text color="white" fontSize={10} fontFamily="body" fontWeight="100">
              {moment(signer.addedOn).calendar().toLowerCase()}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <TouchableOpacity onPress={registerSigner}>
        <HStack alignItems="center">
          <VStack px={4} width="90%">
            <Text color="light.lightBlack" fontSize={14} fontFamily="body" fontWeight="200">
              Manual Registration
            </Text>
            <Text color="light.lightBlack" fontSize={12} fontFamily="body" fontWeight="100">
              {`Register your active vault with the ${signerName}.`}
            </Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </TouchableOpacity>
      <NfcPrompt visible={nfcModal} />
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
});
