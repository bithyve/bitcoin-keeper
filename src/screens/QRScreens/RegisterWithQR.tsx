import React from 'react';
import { Box } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Dimensions, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getWalletConfig } from 'src/hardware';
import { useDispatch } from 'react-redux';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import Buttons from 'src/components/Buttons';
import useVault from 'src/hooks/useVault';
import DisplayQR from './DisplayQR';
import { SignerType } from 'src/core/wallets/enums';
import { genrateOutputDescriptors } from 'src/core/utils';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import QRCode from 'react-native-qrcode-svg';
const { width } = Dimensions.get('window');

const SPECTER_PREFIX = 'addwallet keeper vault&';

function RegisterWithQR({ route, navigation }: any) {
  const { vaultKey, vaultId = '' }: { vaultKey: VaultSigner; vaultId: string } = route.params;
  const dispatch = useDispatch();
  const { activeVault } = useVault({ vaultId });
  const { signer } = useSignerFromKey(vaultKey);
  const walletConfig =
    signer.type === SignerType.SPECTER
      ? SPECTER_PREFIX +
        `${genrateOutputDescriptors(activeVault, false).replaceAll('/**', '')}${
          activeVault.isMultiSig ? ' )' : ''
        }`
      : getWalletConfig({ vault: activeVault });
  const qrContents = Buffer.from(walletConfig, 'ascii').toString('hex');
  const markAsRegistered = () => {
    dispatch(
      updateKeyDetails(vaultKey, 'registered', {
        registered: true,
        vaultId: activeVault.id,
      })
    );
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Register Signing Device"
        subtitle="Register the vault with any of the QR based signing devices"
      />
      <Box style={styles.center}>
        {signer.type === SignerType.SPECTER ? (
          <QRCode value={walletConfig} size={width * 0.85} ecl="L" />
        ) : (
          <DisplayQR qrContents={qrContents} toBytes type="hex" />
        )}
      </Box>
      <Buttons primaryText="Done" primaryCallback={markAsRegistered} />
    </ScreenWrapper>
  );
}

export default RegisterWithQR;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
});
