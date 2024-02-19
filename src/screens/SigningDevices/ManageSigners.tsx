import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, StatusBar, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import Colors from 'src/theme/Colors';
import SignerIcon from 'src/assets/images/signer_brown.svg';
import { UNVERIFYING_SIGNERS } from 'src/hardware';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import SignerCard from '../AddSigner/SignerCard';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'ManageSigners'>;

function ManageSigners({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId = '' } = route.params || {};
  const { activeVault } = useVault({ vaultId });
  const { signers: vaultKeys } = activeVault || { signers: [] };
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();
  const { realySignersUpdateErrorMessage } = useAppSelector((state) => state.bhr);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  useEffect(() => {
    if (realySignersUpdateErrorMessage) {
      showToast(realySignersUpdateErrorMessage);
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [realySignersUpdateErrorMessage]);

  const handleCardSelect = (signer, item) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signer,
        vaultId,
        vaultKey: vaultKeys.length ? item : undefined,
        vaultSigners: vaultKeys,
      }),
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SigningDeviceList', { addSignerFlow: true }));
  };

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} style={styles.wrapper}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={colorMode === 'light' ? 'dark-content' : 'light-content'}
          backgroundColor={Colors.RussetBrown}
        />
        <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.topSection}>
          <KeeperHeader
            title="Manage Signers"
            subtitle="View and change key details"
            titleColor={`${colorMode}.seashellWhite`}
            subTitleColor={`${colorMode}.PearlGrey`}
            icon={
              <CircleIconWrapper
                backgroundColor={`${colorMode}.seashellWhite`}
                icon={<SignerIcon />}
              />
            }
            contrastScreen
          />
        </Box>
        <Box style={styles.signersContainer}>
          <SignersList
            colorMode={colorMode}
            vaultKeys={vaultKeys}
            signers={signers}
            signerMap={signerMap}
            handleCardSelect={handleCardSelect}
            handleAddSigner={handleAddSigner}
            vault={activeVault}
          />
        </Box>
      </SafeAreaView>
    </Box>
  );
}

function SignersList({
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
}) {
  return (
    <VStack style={styles.signerContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
          <AddCard name="Add Signer" cardStyles={styles.addCard} callback={handleAddSigner} />
        </Box>
      </ScrollView>
    </VStack>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topSection: {
    height: '35%',
    paddingLeft: 10,
    paddingTop: 20,
  },
  signersContainer: {
    marginTop: '-25%',
    marginHorizontal: 10,
  },
  signerContainer: {
    marginVertical: 30,
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
