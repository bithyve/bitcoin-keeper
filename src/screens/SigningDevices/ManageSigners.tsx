import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, StatusBar, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import { UNVERIFYING_SIGNERS, getSignerNameFromType } from 'src/hardware';
import SignerIcon from 'src/assets/images/signer_brown.svg';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import config from 'src/core/config';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        signerId: signer.masterFingerprint,
        vaultId,
        vaultKey: vaultKeys.length ? item : undefined,
        vaultSigners: vaultKeys,
      })
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SigningDeviceList', { addSignerFlow: true }));
  };

  const { top } = useSafeAreaInsets();

  return (
    <Box backgroundColor={`${colorMode}.RussetBrown`} style={[styles.wrapper, { paddingTop: top }]}>
      <Box style={styles.topSection}>
        <KeeperHeader
          title="Manage Keys"
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
      <Box style={styles.signersContainer} backgroundColor={`${colorMode}.primaryBackground`}>
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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      style={styles.scrollMargin}
    >
      <Box style={styles.addedSignersContainer}>
        {(vaultKeys.length ? vaultKeys : signers).map((item) => {
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

          const isAMF =
            signer.type === SignerType.TAPSIGNER &&
            config.NETWORK_TYPE === NetworkType.TESTNET &&
            !signer.isMock;

          return (
            <SignerCard
              key={signer.masterFingerprint}
              onCardSelect={() => handleCardSelect(signer, item)}
              name={getSignerNameFromType(signer.type, signer.isMock, isAMF)}
              description={`Added ${moment(signer.addedOn).calendar()}`}
              icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
              isSelected={false}
              showSelection={false}
              showDot={showDot}
              isFullText
              colorVarient="green"
            />
          );
        })}
        <AddCard name="Add Key" cardStyles={styles.addCard} callback={handleAddSigner} />
      </Box>
    </ScrollView>
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
    paddingHorizontal: '5%',
    flex: 1,
  },
  scrollContainer: {
    zIndex: 2,
    gap: 40,
    marginVertical: 30,
  },
  scrollMargin: {
    marginTop: '-30%',
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
