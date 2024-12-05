import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { SignerType } from 'src/services/wallets/enums';
import DisplayQR from './DisplayQR';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import WalletCopiableData from 'src/components/WalletCopiableData';
import Buttons from 'src/components/Buttons';

function ShowPSBT() {
  const route = useRoute();
  const {
    data,
    encodeToBytes,
    title,
    subTitle,
    type,
  }: { data: any; encodeToBytes: boolean; title: string; subTitle: string; type: SignerType } =
    route.params as any;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={title} subtitle={subTitle} />
      <Box style={styles.center}>
        <DisplayQR qrContents={data} toBytes={encodeToBytes} type="base64" />
      </Box>
      <Box style={styles.fingerprint}>
        {<WalletCopiableData title="Transaction (PSBT):" data={data} dataType="psbt" />}
      </Box>
      {[SignerType.KEEPER, SignerType.MY_KEEPER].includes(type) ? (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <ShareWithNfc data={data} isPSBTSharing remoteShare isSignedPSBT />
        </ScrollView>
      ) : null}
      <Box style={styles.ctaContainer}>
        <Buttons
          primaryText="Done"
          fullWidth={true}
          primaryCallback={() => {
            navigation.dispatch((state) => {
              const index = state.routes.findIndex(
                (route) => route.name === 'SignerAdvanceSettings' || route.name === 'Home'
              );
              if (index === -1) {
                return StackActions.pop(1);
              }
              return StackActions.pop(state.index - index);
            });
          }}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default ShowPSBT;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: '5%',
  },
  fingerprint: {
    alignItems: 'center',
    marginHorizontal: '7%',
  },
  ctaContainer: {
    marginTop: '5%',
    alignSelf: 'flex-end',
    paddingHorizontal: '7%',
  },
});
