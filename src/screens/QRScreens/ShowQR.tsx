import { useRoute } from '@react-navigation/native';
import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { wp } from 'src/constants/responsive';
import { SignerType } from 'src/core/wallets/enums';
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
  return (
    <ScreenWrapper>
      <HeaderTitle title={title} subtitle={subTitle} paddingLeft={wp(20)} />
      <Box style={styles.center}>
        <DisplayQR qrContents={data} toBytes={encodeToBytes} type="base64" />
      </Box>
      {type === SignerType.KEEPER ? (
        <Box style={styles.bottom}>
          <Box style={{ paddingBottom: '10%' }}>
            <ShareWithNfc data={data} />
          </Box>
        </Box>
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
  bottom: {
    padding: '3%',
  },
  bottomWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: 10,
  },
});
