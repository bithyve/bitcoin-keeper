import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import usePlan from 'src/hooks/usePlan';
import NFC from 'src/services/nfc';
import SigningDeviceCard from './components/SigningDeviceCard';
import { VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useRoute } from '@react-navigation/native';
import { SignerCategory, SignerType } from 'src/services/wallets/enums';
import { getDeviceStatus, getSDMessage } from 'src/hardware';
import useSigners from 'src/hooks/useSigners';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const SigningDeviceList = () => {
  const route = useRoute();
  const {
    scheme,
    addSignerFlow = false,
    vaultId,
    vaultSigners,
    signerCategory,
    headerTitle,
    headerSubtitle,
  }: {
    scheme: VaultScheme;
    addSignerFlow: boolean;
    vaultId: string;
    vaultSigners?: VaultSigner[];
    signerCategory: string;
    headerTitle: string;
    headerSubtitle: string;
  } = route.params as any;
  const { colorMode } = useColorMode();
  const { isOnL1, isOnL2 } = usePlan();
  const { signers } = useSigners();
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [signersLoaded, setSignersLoaded] = useState(false);
  const isMultisig = addSignerFlow ? true : scheme.n !== 1;
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const sortedSigners = {
    [SignerCategory.HARDWARE]: [
      SignerType.COLDCARD,
      SignerType.TAPSIGNER,
      SignerType.JADE,
      SignerType.SEEDSIGNER,
      SignerType.PASSPORT,
      SignerType.SPECTER,
      SignerType.KEYSTONE,
      SignerType.LEDGER,
      SignerType.PORTAL,
      SignerType.TREZOR,
      SignerType.BITBOX02,
    ],
    [SignerCategory.SOFTWARE]: [
      SignerType.SEED_WORDS,
      SignerType.MY_KEEPER,
      SignerType.KEEPER,
      SignerType.OTHER_SD,
    ],
    [SignerCategory.ASSISTED]: [SignerType.POLICY_SERVER, SignerType.INHERITANCEKEY],
  };

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
    setSignersLoaded(true);
  };
  useEffect(() => {
    getNfcSupport();
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        learnMore
        learnBackgroundColor={`${colorMode}.brownBackground`}
        learnTextColor={`${colorMode}.buttonText`}
      />
      <Box style={styles.scrollViewWrapper}>
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.contentContainerStyle}
          showsVerticalScrollIndicator={false}
          testID={'Signer_Scroll'}
        >
          {!signersLoaded ? (
            <ActivityIndicator />
          ) : (
            <>
              <Box paddingY="4">
                {sortedSigners[signerCategory]?.map((type: SignerType, index: number) => {
                  const { disabled, message: connectivityStatus } = getDeviceStatus(
                    type,
                    isNfcSupported,
                    isOnL1,
                    isOnL2,
                    scheme,
                    signers,
                    addSignerFlow
                  );
                  let message = connectivityStatus;
                  if (!connectivityStatus) {
                    message = getSDMessage({ type });
                  }
                  return (
                    <SigningDeviceCard
                      key={type}
                      type={type}
                      first={index === 0}
                      last={index === sortedSigners[signerCategory].length - 1}
                      isOnL1={isOnL1}
                      isOnL2={isOnL2}
                      addSignerFlow={addSignerFlow}
                      vaultId={vaultId}
                      vaultSigners={vaultSigners}
                      isMultisig={isMultisig}
                      primaryMnemonic={primaryMnemonic}
                      disabled={disabled}
                      message={message}
                    />
                  );
                })}
              </Box>
            </>
          )}
        </ScrollView>
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  modalText: {
    letterSpacing: 0.65,
    fontSize: 13,
    marginTop: 5,
    padding: 1,
  },
  scrollViewWrapper: {
    flex: 1,
    paddingHorizontal: '2.5%',
    paddingTop: '5%',
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
});

export default SigningDeviceList;
