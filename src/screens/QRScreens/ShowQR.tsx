import { useRoute } from '@react-navigation/native';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { SignerType } from 'src/services/wallets/enums';
import DisplayQR from '../QRScreens/DisplayQR';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';

function ShowQR() {
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
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={title} subtitle={subTitle} />
      <Box style={styles.center}>
        <DisplayQR qrContents={data} toBytes={encodeToBytes} type="base64" />
      </Box>
      {[SignerType.KEEPER, SignerType.MY_KEEPER].includes(type) ? (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <ShareWithNfc data={data} isPSBTSharing />
        </ScrollView>
      ) : null}
    </ScreenWrapper>
  );
}

export default ShowQR;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: '10%',
  },
});
