import React, { useContext } from 'react';

import QRCode from 'react-native-qrcode-svg';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getWalletConfig } from 'src/hardware';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';

const DisplayQR = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const walletConfig = getWalletConfig({ vault });
  const qrContents = Buffer.from(walletConfig, 'ascii').toString('hex');
  const { qrData } = useDynamicQrContent({ data: qrContents });

  return <QRCode value={qrData} size={300} />;
};

export default DisplayQR;
