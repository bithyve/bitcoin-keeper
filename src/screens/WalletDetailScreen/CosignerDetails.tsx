import { StyleSheet } from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import { Box } from 'native-base';
import ShowXPub from 'src/components/XPub/ShowXPub';
import useToastMessage from 'src/hooks/useToastMessage';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import Buttons from 'src/components/Buttons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Note from 'src/components/Note/Note';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';

function CosignerDetails() {
  const { params } = useRoute();
  const { wallet } = params as { wallet: Wallet };
  const { showToast } = useToastMessage();
  const [details, setDetails] = React.useState('');
  const navgation = useNavigation();

  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  useEffect(() => {
    setTimeout(() => {
      const details = getCosignerDetails(wallet, keeper.id);
      setDetails(JSON.stringify(details));
    }, 200);
  }, []);

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Cosigner Details"
        subtitle="Scan the cosigner details from another app in order to add this as a signer"
      />
      <Box style={styles.center}>
        <ShowXPub
          data={details}
          copy={() => showToast('Cosigner Details Copied Successfully', <TickIcon />)}
          subText="Cosigner Details"
          copyable={false}
          keeper={keeper}
        />
      </Box>
      <Box style={styles.bottom}>
        {details ? (
          <Box style={{ paddingBottom: '10%' }}>
            <ShareWithNfc data={details} />
          </Box>
        ) : null}
        <Note title="Note" subtitle="The cosigner details are for the selected wallet only" />
        <Buttons primaryText="Done" primaryCallback={navgation.goBack} />
      </Box>
    </ScreenWrapper>
  );
}

export default CosignerDetails;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    marginTop: '15%',
  },
  bottom: {
    padding: '3%',
  },
});
