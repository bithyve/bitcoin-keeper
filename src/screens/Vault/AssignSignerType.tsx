import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/services/wallets/enums';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { getDeviceStatus, getSDMessage } from 'src/hardware';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import usePlan from 'src/hooks/usePlan';
import NFC from 'src/services/nfc';
import useSigners from 'src/hooks/useSigners';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import UnknownSignerInfo from './components/UnknownSignerInfo';
import Note from 'src/components/Note/Note';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import AssignSignerTypeCard from './components/AssignSignerTypeCard';

type IProps = {
  navigation: any;
  route: {
    params: {
      vault: Vault;
      signer: Signer;
    };
  };
};
function AssignSignerType({ route }: IProps) {
  const { colorMode } = useColorMode();
  const { vault, signer } = route.params;
  const { signers: appSigners } = useSigners();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerText } = translations;
  const { isOnL1, isOnL2 } = usePlan();

  const availableSigners = [
    SignerType.BITBOX02,
    SignerType.COLDCARD,
    SignerType.JADE,
    SignerType.KEYSTONE,
    SignerType.LEDGER,
    SignerType.PASSPORT,
    SignerType.SEEDSIGNER,
    SignerType.SPECTER,
    SignerType.TAPSIGNER,
    SignerType.TREZOR,
    SignerType.KEEPER,
    SignerType.SEED_WORDS,
    SignerType.POLICY_SERVER,
  ];

  const [isNfcSupported, setNfcSupport] = useState(true);
  const [signersLoaded, setSignersLoaded] = useState(false);

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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={signerText.changeSignerTitle}
        subtitle={signerText.changeSignerSubtitle}
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {signer.type === SignerType.UNKOWN_SIGNER && <UnknownSignerInfo signer={signer} />}
        {!signersLoaded ? (
          <ActivityIndicator />
        ) : (
          <Box>
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

                return (
                  <AssignSignerTypeCard
                    key={type}
                    type={type}
                    disabled={disabled}
                    first={index === 0}
                    last={index === availableSigners.length - 1}
                    vault={vault}
                    primaryMnemonic={primaryMnemonic}
                  />
                );
              })}
            </Box>
            <Box style={styles.noteContainer}>
              <Note subtitle={signerText.changeSignerNote} />
            </Box>
          </Box>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    gap: 20,
  },
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
    opacity: 0.6,
    width: windowWidth * 0.8,
    alignSelf: 'center',
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
  noteContainer: {
    marginVertical: 40,
  },
});

export default AssignSignerType;
