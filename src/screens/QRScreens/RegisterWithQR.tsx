import React from 'react';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import { getWalletConfig } from 'src/hardware';
import { useDispatch } from 'react-redux';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import Buttons from 'src/components/Buttons';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/services/wallets/enums';
import { generateOutputDescriptors } from 'src/utils/service-utilities/utils';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import DisplayQR from './DisplayQR';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import KeeperQRCode from 'src/components/KeeperQRCode';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import { UR, UREncoder } from '@ngraveio/bc-ur';
import { getFragmentedData } from 'src/services/qr';

const { width } = Dimensions.get('window');

const SPECTER_PREFIX = 'addwallet keeper vault&';

function RegisterWithQR({ route, navigation }: any) {
  const { colorMode } = useColorMode();
  const { vaultKey, vaultId = '' }: { vaultKey: VaultSigner; vaultId: string } = route.params;
  const dispatch = useDispatch();
  const { activeVault } = useVault({ vaultId });
  const { signer } = useSignerFromKey(vaultKey);
  const walletConfig =
    signer.type === SignerType.SPECTER
      ? activeVault.scheme.miniscriptScheme
        ? `addwallet ${activeVault.presentationData.name}&${generateOutputDescriptors(
            activeVault,
            false,
            false
          )
            .replace('/**', '/{0,1}/*')
            .replace(/<(\d+);(\d+)>/g, '{$1,$2}')}`
        : `${SPECTER_PREFIX}${generateOutputDescriptors(activeVault, false, false).replaceAll(
            '/<0;1>/*',
            ''
          )}`
      : activeVault.scheme.miniscriptScheme
      ? generateOutputDescriptors(activeVault)
      : getWalletConfig({ vault: activeVault, signerType: signer.type });
  let qrContents: any = Buffer.from(walletConfig, 'ascii').toString('hex');
  const { showToast } = useToastMessage();

  try {
    if (signer.type === SignerType.KEYSTONE) {
      const messageBuffer = Buffer.from(walletConfig);
      const ur = UR.fromBuffer(messageBuffer);
      const maxFragmentLength = 1000;
      const encoder = new UREncoder(ur, maxFragmentLength);
      qrContents = getFragmentedData(encoder).toString().toUpperCase();
    }
  } catch (error) {
    console.log('🚀 ~ RegisterWithQR ~ error:', error);
  }

  const markAsRegistered = () => {
    dispatch(
      updateKeyDetails(vaultKey, 'registered', {
        registered: true,
        vaultId: activeVault.id,
      })
    );
    dispatch(
      healthCheckStatusUpdate([
        {
          signerId: signer.masterFingerprint,
          status: hcStatusType.HEALTH_CHECK_REGISTRATION,
        },
      ])
    );
    showToast('Vault registration confirmed', <TickIcon />);
    navigation.goBack();
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Register signer"
        subtitle="Register the vault with any of the QR based signers"
      />
      <Box style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Box style={styles.center}>
            {[SignerType.SPECTER, SignerType.KEYSTONE].includes(signer.type) ? (
              <KeeperQRCode
                qrData={signer.type == SignerType.KEYSTONE ? qrContents : walletConfig}
                size={width * 0.85}
                ecl="L"
              />
            ) : (
              <DisplayQR
                qrContents={signer.type == SignerType.COLDCARD ? walletConfig : qrContents}
                toBytes
                type="hex"
                signerType={signer.type}
              />
            )}
          </Box>
          <Box style={styles.centerBottom}>
            <ShareWithNfc
              data={walletConfig}
              signer={signer}
              vaultKey={vaultKey}
              vaultId={vaultId}
              fileName={`${
                activeVault.presentationData.name.replace(/[^a-zA-Z0-9]/g, '') || 'untitled'
              }.txt`}
              useNdef
              isUSBAvailable={signer.type == SignerType.COLDCARD || signer.type == SignerType.JADE}
            />
          </Box>
        </ScrollView>
        <Buttons
          primaryText="Confirm Registration"
          primaryCallback={markAsRegistered}
          secondaryText="Finish later"
          secondaryCallback={() => navigation.goBack()}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default RegisterWithQR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: '5%',
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    marginTop: '5%',
  },
  centerBottom: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
