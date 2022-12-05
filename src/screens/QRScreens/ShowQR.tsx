import { useRoute } from '@react-navigation/native';
import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import DisplayQR from '../QRScreens/DisplayQR';

function ShowQR() {
  const route = useRoute();
  const {
    data,
    encodeToBytes,
    title,
    subTitle,
  }: { data: any; encodeToBytes: boolean; title: string; subTitle: string } = route.params as any;

  return (
    <ScreenWrapper>
      <HeaderTitle title={title} subtitle={subTitle} />
      <Box style={styles.center}>
        <DisplayQR qrContents={data} toBytes={encodeToBytes} type="base64" />
      </Box>
    </ScreenWrapper>
  );
}

export default ShowQR;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
  bottom: {
    padding: '3%',
  },
});
