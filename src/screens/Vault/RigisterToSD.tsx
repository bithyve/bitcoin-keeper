import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import AppClient, { WalletPolicy } from 'src/hardware/ledger';
import { Box, Text } from 'native-base';
import React, { useCallback, useContext, useRef, useState } from 'react';

import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { captureError } from 'src/core/services/sentry';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { registerToColcard } from 'src/hardware/coldcard';
import useScanLedger from '../AddLedger/useScanLedger';

const SDInstructionMap = {
  COLDCARD:
    'Go to settings -> Multisig Wallets -> Import Multisig Wallet -> choose NFC as a medium',
  LEDGER: 'Login and stay on the BTC app to register the wallet policy',
};
export const RigisterToSD = ({ route }) => {
  const { type }: { type: SignerType } = route.params;

  const [nfcVisible, setNfcVisible] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);

  const { useQuery } = useContext(RealmWrapperContext);

  const Vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const openNfc = () => {
    setNfcVisible(true);
  };
  const closeNfc = () => {
    setNfcVisible(false);
  };
  const LedgerCom = useRef();
  const onSelectDevice = useCallback(async (device) => {
    try {
      const transport = await TransportBLE.open(device);
      transport.on('disconnect', () => {
        LedgerCom.current = null;
      });
      LedgerCom.current = transport;
      register();
    } catch (e) {
      console.log(e);
    }
  }, []);
  const register = async () => {
    switch (type) {
      case SignerType.COLDCARD:
        openNfc();
        registerToColcard({ vault: Vault });
        closeNfc();
        break;
      case SignerType.LEDGER:
        async () => {
          try {
            const app = new AppClient(LedgerCom.current);
            const multisigWalletPolicy = new WalletPolicy(
              'ColdStorage',
              `sh(wsh(sortedmulti(${Vault.signers.length},@0,@1,@2)))`,
              Vault.signers.map((signer) => {
                const path = `${signer.xpubInfo.xfp}${signer.xpubInfo.derivationPath.slice(
                  signer.xpubInfo.derivationPath.indexOf('/')
                )}`;
                return `[${path}]${signer.xpub}/**`;
              })
            );
            const [policyId, policyHmac] = await app.registerWallet(multisigWalletPolicy);
            console.log(policyId, policyHmac);
          } catch (err) {
            captureError(err);
          }
        };
        break;
      default:
        break;
    }
  };

  const DeviceItem = ({ device, onSelectDevice }) => {
    const [pending, setPending] = useState(false);
    const onPress = async () => {
      setPending(true);
      try {
        await onSelectDevice(device);
      } catch (error) {
        console.log(error);
      } finally {
        setPending(false);
      }
    };
    return (
      <TouchableOpacity onPress={() => onPress()} style={{ flexDirection: 'row' }}>
        <Text
          color={'light.textLight'}
          fontSize={14}
          fontWeight={200}
          fontFamily={'heading'}
          letterSpacing={1.12}
        >
          {device.name}
        </Text>
        {pending ? <ActivityIndicator /> : null}
      </TouchableOpacity>
    );
  };

  const LedgerContent = ({ onSelectDevice }) => {
    const { error, devices, scanning } = useScanLedger();

    if (error) {
      <Text style={styles.errorTitle}>{String(error.message)}</Text>;
    }
    return (
      <>
        {scanning ? <ActivityIndicator /> : null}
        {devices.map((device) => (
          <DeviceItem device={device} onSelectDevice={onSelectDevice} key={device.id} />
        ))}
      </>
    );
  };
  return (
    <ScreenWrapper>
      <Box flex={1} justifyContent={'space-between'}>
        <HeaderTitle
          title={`Rigister the Vault for ${type}`}
          subtitle={SDInstructionMap[type] || 'Lorem ipsum dolor sit amet, consectetur '}
          enableBack={true}
        />
        <Box padding={'10'}>
          <Buttons primaryText={'Register'} primaryCallback={register} />
        </Box>
      </Box>
      <NfcPrompt visible={nfcVisible} />
      <KeeperModal
        visible={ledgerModal}
        close={() => setLedgerModal(false)}
        title={'Looking for Nano X'}
        subTitle={'Power up your Ledger Nano X and open the BTC app...'}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={LedgerCom.current ? 'SIGN' : false}
        buttonTextColor={'#073E39'}
        buttonCallback={register}
        textColor={'#FFF'}
        DarkCloseIcon={true}
        Content={() => <LedgerContent onSelectDevice={onSelectDevice} />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  errorTitle: {
    color: '#c00',
    fontSize: 16,
  },
});
