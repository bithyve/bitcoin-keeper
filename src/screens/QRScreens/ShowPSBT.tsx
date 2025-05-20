import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Box, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { SignerType } from 'src/services/wallets/enums';
import DisplayQR from './DisplayQR';
import WalletCopiableData from 'src/components/WalletCopiableData';
import Buttons from 'src/components/Buttons';
import WalletHeader from 'src/components/WalletHeader';

function ShowPSBT() {
  const route = useRoute();
  const {
    data,
    encodeToBytes,
    title,
    subTitle,
  }: {
    data: any;
    encodeToBytes: boolean;
    title: string;
    subTitle: string;
    type: SignerType;
    isSignedPSBT: boolean;
  } = route.params as any;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={title} subTitle={subTitle} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Box style={styles.center}>
          <DisplayQR qrContents={data} toBytes={encodeToBytes} type="base64" />
        </Box>
        <Box style={styles.fingerprint}>
          <WalletCopiableData title="Transaction (PSBT):" data={data} dataType="psbt" />
        </Box>
      </ScrollView>
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
  scrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 20,
  },
  center: {
    alignItems: 'center',
    marginTop: '5%',
  },
  fingerprint: {
    alignItems: 'center',
    marginHorizontal: '7%',
  },
  ctaContainer: {
    paddingHorizontal: '7%',
    paddingBottom: 20,
  },
});
