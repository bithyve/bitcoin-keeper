import React, { useContext } from 'react';

import { Box } from 'native-base';
import DisplayQR from './DisplayQR';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getWalletConfig } from 'src/hardware';

const RegisterWithQR = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const walletConfig = getWalletConfig({ vault });
  const qrContents = Buffer.from(walletConfig, 'ascii').toString('hex');
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Register Signing Device"
        subtitle="Register the vault with any of the QR based signing devices"
      />
      <Box style={styles.center}>
        <DisplayQR qrContents={qrContents} toBytes type="hex" />
      </Box>
    </ScreenWrapper>
  );
};

export default RegisterWithQR;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
});
