import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import { UNVERIFYING_SIGNERS } from 'src/hardware';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'ManageSigners'>;
const ManageSigners = ({ route }: ScreenProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId = '' } = route.params || {};
  const { activeVault } = useVault({ vaultId });
  const { signers: vaultKeys } = activeVault ? activeVault : { signers: [] };
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();

  const handleCardSelect = (signer, item) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signer,
        vaultId,
        vaultKey: vaultKeys.length ? item : undefined,
        vaultSigners: vaultKeys,
      })
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SigningDeviceList', { addSignerFlow: true }));
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={'Manage Signers'}
        subtitle={'Add, remove, change or check on signers'}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={<VaultIcon />}
          />
        }
      />
      <SignersList
        colorMode={colorMode}
        vaultKeys={vaultKeys}
        signers={signers}
        signerMap={signerMap}
        handleCardSelect={handleCardSelect}
        handleAddSigner={handleAddSigner}
        vault={activeVault}
      />
    </ScreenWrapper>
  );
};

const SignersList = ({
  colorMode,
  vaultKeys,
  signers,
  signerMap,
  handleCardSelect,
  handleAddSigner,
  vault,
}: {
  colorMode: string;
  vaultKeys: VaultSigner[];
  signers: Signer[];
  signerMap: any;
  handleCardSelect: any;
  handleAddSigner: any;
  vault: Vault;
}) => (
  <VStack style={styles.signerContainer}>
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Box style={styles.addedSignersContainer}>
        {(vaultKeys.length ? vaultKeys : signers).map((item, i) => {
          const signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
          const isRegistered = vaultKeys.length
            ? item.registeredVaults.find((info) => info.vaultId === vault.id)
            : false;

          const showDot =
            vaultKeys.length &&
            !UNVERIFYING_SIGNERS.includes(signer.type) &&
            !isRegistered &&
            !signer.isMock &&
            vault.isMultiSig;

          return (
            <SignerCard
              key={signer.masterFingerprint}
              onCardSelect={() => handleCardSelect(signer, item)}
              name={signer.signerName}
              description={signer.signerDescription || signer.type}
              icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
              isSelected={false}
              showSelection={false}
              showDot={showDot}
            />
          );
        })}
      </Box>
      <AddCard name={'Add Signer'} cardStyles={styles.addCard} callback={handleAddSigner} />
    </ScrollView>
  </VStack>
);

const styles = StyleSheet.create({
  signerContainer: {
    marginTop: 30,
  },
  scrollContainer: {
    gap: 40,
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
});

export default ManageSigners;
