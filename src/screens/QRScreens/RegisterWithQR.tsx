import React from 'react';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Dimensions, StyleSheet } from 'react-native';
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
      ? `${SPECTER_PREFIX}${generateOutputDescriptors(activeVault, false).replaceAll(
          '/<0;1>/*',
          ''
        )}${activeVault.isMultiSig ? ' )' : ''}`
      : getWalletConfig({ vault: activeVault });
  const qrContents = Buffer.from(walletConfig, 'ascii').toString('hex');
  const { showToast } = useToastMessage();

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
      <Box flex={1}>
        <Box style={styles.center}>
          {signer.type === SignerType.SPECTER ? (
            <KeeperQRCode qrData={walletConfig} size={width * 0.85} ecl="L" />
          ) : (
            <DisplayQR qrContents={qrContents} toBytes type="hex" />
          )}
        </Box>
        <Box style={styles.centerBottom}>
          <ShareWithNfc data={walletConfig} signer={signer} useNdef />
        </Box>
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
