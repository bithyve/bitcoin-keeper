import { Box, HStack, Text, VStack } from 'native-base';
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
import { WalletMap } from './WalletMap';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import { registerToColcard } from 'src/hardware/coldcard';

const gradientStyles = {
  linearGradient: {
    colors: ['#B17F44', '#6E4A35'],
    start: [0, 0],
    end: [1, 0],
  },
};
const SignerAdvanceSettings = ({ route }) => {
  const { signer }: { signer: VaultSigner } = route.params;
  const signerName = signer.type.charAt(0) + signer.type.slice(1).toLowerCase();
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

  return (
    <ScreenWrapper>
      <HeaderTitle title="Advanced Settings" headerTitleColor="#092C27" />
      <Box bg={gradientStyles} style={styles.card}>
        <HStack alignItems={'center'}>
          <Box style={styles.circle}>{WalletMap(signer.type, true).Icon}</Box>
          <VStack justifyContent={'center'} px={4}>
            <Text color={'white'} fontSize={14} fontFamily={'body'} fontWeight={'200'}>
              {signerName}
            </Text>
            <Text color={'white'} fontSize={10} fontFamily={'body'} fontWeight={'100'}>
              {moment(signer.addedOn).calendar().toLowerCase()}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <TouchableOpacity onPress={register}>
        <HStack alignItems={'center'}>
          <VStack px={4} width={'90%'}>
            <Text color={'light.lightBlack'} fontSize={14} fontFamily={'body'} fontWeight={'200'}>
              {'Manual Registration'}
            </Text>
            <Text color={'light.lightBlack'} fontSize={12} fontFamily={'body'} fontWeight={'100'}>
              {`Register your active vault with the ${signerName}.`}
            </Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </TouchableOpacity>
      <NfcPrompt visible={nfcModal} />
    </ScreenWrapper>
  );
};

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
