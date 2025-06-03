import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
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
import { UR, UREncoder } from '@ngraveio/bc-ur';
import { getFragmentedData } from 'src/services/qr';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const { width } = Dimensions.get('window');

function RegisterWithQR({ route, navigation }: any) {
  const { colorMode } = useColorMode();
  const { vaultKey, vaultId = '' }: { vaultKey: VaultSigner; vaultId: string } = route.params;
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerText, common } = translations;
  const { activeVault } = useVault({ vaultId });
  const { signer } = useSignerFromKey(vaultKey);
  const walletConfig =
    signer.type === SignerType.SPECTER
      ? `addwallet ${activeVault.presentationData.name}&${generateOutputDescriptors(
          activeVault,
          false,
          false
        )
          .replace('/**', '/{0,1}/*')
          .replace(/<(\d+);(\d+)>/g, '{$1,$2}')}`
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
      <WalletHeader title={signerText.registerSigner} subTitle={signerText.registerSignerDesc} />
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
          <Box style={styles.centerBottom}></Box>
        </ScrollView>
        <Buttons
          primaryText={common.confirmRegistration}
          primaryCallback={markAsRegistered}
          secondaryText={common.Finishlater}
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
