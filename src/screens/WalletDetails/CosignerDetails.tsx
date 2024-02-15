import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, ScrollView, useColorMode } from 'native-base';
import ShowXPub from 'src/components/XPub/ShowXPub';
import useToastMessage from 'src/hooks/useToastMessage';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import { getKeyExpression } from 'src/core/utils';
import { SignerType, XpubTypes } from 'src/core/wallets/enums';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import useSigners from 'src/hooks/useSigners';

function CosignerDetails() {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const [details, setDetails] = React.useState('');
  const navgation = useNavigation();
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const { signers } = useSigners();
  const myAppKeyCount = signers.filter((signer) => signer.type === SignerType.MY_KEEPER).length;

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        getCosignerDetails(primaryMnemonic, myAppKeyCount).then((details) => {
          const keyDescriptor = getKeyExpression(
            details.mfp,
            details.xpubDetails[XpubTypes.P2WSH].derivationPath,
            details.xpubDetails[XpubTypes.P2WSH].xpub,
            false
          );
          setDetails(keyDescriptor);
        });
      }, 200);
    }
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Co-signer Details"
        subtitle="Scan the co-signer details from another app in order to add this as a signer"
      />
      <Box style={styles.center}>
        <ShowXPub
          data={details}
          copy={() => showToast('Co-signer Details Copied Successfully', <TickIcon />)}
          subText="Co-signer Details"
          copyable={false}
        />
      </Box>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        {details ? <ShareWithNfc data={details} /> : null}
      </ScrollView>
      <Box style={styles.bottom}>
        <Buttons primaryText="Done" primaryCallback={navgation.goBack} />
      </Box>
    </ScreenWrapper>
  );
}

export default CosignerDetails;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: '10%',
  },
  bottom: {
    marginHorizontal: '5%',
    marginBottom: 25,
  },
});
