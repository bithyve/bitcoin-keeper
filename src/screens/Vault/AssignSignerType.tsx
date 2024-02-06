import { Box, ScrollView, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { getDeviceStatus, getSDMessage } from 'src/hardware';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import usePlan from 'src/hooks/usePlan';
import NFC from 'src/services/nfc';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import Text from 'src/components/KeeperText';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import useSigners from 'src/hooks/useSigners';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

type IProps = {
  navigation: any;
  route: {
    params: {
      vault: Vault;
    };
  };
};
function AssignSignerType({ route }: IProps) {
  const { vault } = route.params;
  const { signers: appSigners } = useSigners();
  const [visible, setVisible] = useState(false);
  const [signerType, setSignerType] = useState<SignerType>();
  const assignSignerType = (type: SignerType) => {
    setSignerType(type);
    setVisible(true);
  };
  const { plan } = usePlan();

  const availableSigners = [
    SignerType.TAPSIGNER,
    SignerType.COLDCARD,
    SignerType.SEEDSIGNER,
    SignerType.SPECTER,
    SignerType.PASSPORT,
    SignerType.JADE,
    SignerType.KEYSTONE,
    SignerType.LEDGER,
    SignerType.TREZOR,
    SignerType.BITBOX02,
    SignerType.KEEPER,
    SignerType.SEED_WORDS,
    // SignerType.MOBILE_KEY,
    SignerType.POLICY_SERVER,
  ];
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [signersLoaded, setSignersLoaded] = useState(false);

  const isOnL1 = plan === SubscriptionTier.L1.toUpperCase();
  const isOnL2 = plan === SubscriptionTier.L2.toUpperCase();
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
    setSignersLoaded(true);
  };

  useEffect(() => {
    getNfcSupport();
  }, []);

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Identify your signer"
        subtitle="for better communication and conectivity"
      />
      <ScrollView
        contentContainerStyle={{ paddingVertical: '10%' }}
        style={{ height: hp(520) }}
        showsVerticalScrollIndicator={false}
      >
        {!signersLoaded ? (
          <ActivityIndicator />
        ) : (
          <Box>
            {availableSigners.map((type: SignerType, index: number) => {
              const { disabled, message: connectivityStatus } = getDeviceStatus(
                type,
                isNfcSupported,
                isOnL1,
                isOnL2,
                { m: 2, n: 3 },
                appSigners
              );
              let message = connectivityStatus;
              if (!connectivityStatus) {
                message = getSDMessage({ type });
              }
              const first = index === 0;
              const last = index === availableSigners.length - 1;
              return (
                <TouchableOpacity
                  disabled={disabled}
                  activeOpacity={0.7}
                  onPress={() => {
                    assignSignerType(type);
                  }}
                  key={type}
                >
                  <Box
                    backgroundColor="light.primaryBackground"
                    borderTopRadius={first ? 15 : 0}
                    borderBottomRadius={last ? 15 : 0}
                    opacity={disabled ? 0.5 : 1}
                  >
                    <Box style={styles.walletMapContainer}>
                      <Box style={styles.walletMapWrapper}>{SDIcons(type).Icon}</Box>
                      <Box backgroundColor="light.divider" style={styles.divider} />
                      <VStack style={styles.content}>
                        <Box style={styles.walletMapLogoWrapper}>{SDIcons(type).Logo}</Box>
                        <Text color="light.inActiveMsg" style={styles.messageText}>
                          {message}
                        </Text>
                      </VStack>
                    </Box>
                    <Box backgroundColor="light.divider" style={styles.dividerStyle} />
                  </Box>
                </TouchableOpacity>
              );
            })}
          </Box>
        )}
        <HardwareModalMap
          type={signerType}
          visible={visible}
          close={() => setVisible(false)}
          vaultSigners={vault?.signers}
          skipHealthCheckCallBack={() => {
            setVisible(false);
          }}
          mode={InteracationMode.IDENTIFICATION}
          vaultShellId={vault?.shellId}
          isMultisig={vault?.isMultiSig}
          primaryMnemonic={primaryMnemonic}
          addSignerFlow={false}
          vaultId={vault?.id}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  walletMapContainer: {
    alignItems: 'center',
    height: windowHeight * 0.08,
    flexDirection: 'row',
    paddingLeft: wp(40),
  },
  walletMapWrapper: {
    marginRight: wp(20),
    width: wp(15),
  },
  walletMapLogoWrapper: {
    alignItems: 'center',
  },
  dividerStyle: {
    opacity: 0.1,
    width: windowWidth * 0.8,
    height: 0.5,
  },
  divider: {
    opacity: 0.5,
    height: hp(26),
    width: 1.5,
  },
  messageText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.3,
    marginTop: hp(5),
  },
  content: {
    alignItems: 'flex-start',
    paddingLeft: wp(30),
  },
});

export default AssignSignerType;
