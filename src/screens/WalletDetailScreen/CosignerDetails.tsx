import { Platform, StyleSheet, Vibration } from 'react-native';
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
import OptionCTA from 'src/components/OptionCTA';
import NFCIcon from 'src/assets/images/nfc.svg';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import NFC from 'src/core/services/nfc';
import { HCESessionContext, HCESession } from 'react-native-hce';

function CosignerDetails() {
  const { params } = useRoute();
  const { wallet } = params as { wallet: Wallet };
  const { showToast } = useToastMessage();
  const [details, setDetails] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const { session } = useContext(HCESessionContext);
  const navgation = useNavigation();

  const cleanUp = () => {
    setVisible(false);
    Vibration.cancel();
    NFC.stopTagSession(session);
  };

  useEffect(() => {
    const unsubConnect = session.on(HCESession.Events.HCE_STATE_ENABLED, () => {
      setVisible(true);
    });
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      cleanUp();
    });
    const unsubRead = session.on(HCESession.Events.HCE_STATE_READ, () => {
      showToast('Cosiigner details shared successfully', <TickIcon />);
    });
    return () => {
      cleanUp();
      unsubRead();
      unsubConnect();
      unsubDisconnect();
    };
  }, [session]);

  const shareWithNFC = async () => {
    try {
      await NFC.startTagSession({ session, content: details });
      Vibration.vibrate([700, 50, 100, 50], true);
    } catch (err) {
      console.log(err);
    }
  };

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
        {Platform.OS === 'android' && details ? (
          <Box style={{ paddingBottom: '10%' }}>
            <OptionCTA
              icon={<NFCIcon />}
              title="or Share on Tap"
              subtitle="Bring device close to use NFC"
              callback={shareWithNFC}
            />
          </Box>
        ) : null}
        <Note title="Note" subtitle="The cosigner details are for the selected wallet only" />
        <Buttons primaryText="Done" primaryCallback={navgation.goBack} />
      </Box>
      <NfcPrompt visible={visible} close={cleanUp} />
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
