import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import { UNVERIFYING_SIGNERS, getSignerDescription, getSignerNameFromType } from 'src/hardware';
import SignerIcon from 'src/assets/images/signer_brown.svg';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { NetworkType, SignerType } from 'src/services/wallets/enums';
import config from 'src/utils/service-utilities/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import SignerCard from '../AddSigner/SignerCard';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import SettingIcon from 'src/assets/images/settings.svg';

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
      showToast(realySignersUpdateErrorMessage, null, IToastCategory.SIGNING_DEVICE);
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

  const navigateToSettings = () => {
    navigation.dispatch(CommonActions.navigate('SignerSettings'));
  };

  return (
    <Box
      backgroundColor={`${colorMode}.BrownNeedHelp`}
      style={[styles.wrapper, { paddingTop: top }]}
    >
      <Box style={styles.topSection}>
        <KeeperHeader
          title="Manage Keys"
          subtitle="View and change key details"
          mediumTitle
          titleColor={`${colorMode}.seashellWhite`}
          subTitleColor={`${colorMode}.seashellWhite`}
          rightComponent={
            <TouchableOpacity onPress={navigateToSettings}>
              <SettingIcon />
            </TouchableOpacity>
          }
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
  const list = vaultKeys.length ? vaultKeys : signers.filter((signer) => !signer.hidden);

  return (
    <SafeAreaView style={styles.topContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.scrollMargin}
      >
        <Box style={styles.addedSignersContainer}>
          {list.map((item) => {
            const signer: Signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
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
                onCardSelect={() => {
                  handleCardSelect(signer, item);
                }}
                name={getSignerNameFromType(signer.type, signer.isMock, isAMF)}
                description={getSignerDescription(
                  signer.type,
                  signer.extraData?.instanceNumber,
                  signer
                )}
                icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
                showSelection={false}
                showDot={showDot}
                isFullText
                colorVarient="green"
              />
            );
          })}
          {!vaultKeys.length ? (
            <AddCard name="Add Key" cardStyles={styles.addCard} callback={handleAddSigner} />
          ) : null}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginBottom: 20,
  },
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
    paddingBottom: 30,
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
  warningText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
});

export default Sentry.withErrorBoundary(ManageSigners, errorBourndaryOptions);
