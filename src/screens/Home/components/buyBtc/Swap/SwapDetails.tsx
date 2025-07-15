import { CommonActions } from '@react-navigation/native';
import { Box, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { BtcToSats } from 'src/constants/Bitcoin';
import useWallets from 'src/hooks/useWallets';
import ReceiveAddress from 'src/screens/Recieve/ReceiveAddress';
import ReceiveQR from 'src/screens/Recieve/ReceiveQR';
import { useAppSelector } from 'src/store/hooks';
import { CoinLogo } from './Swaps';

export const SwapDetails = ({ navigation, route }) => {
  const data = route.params;
  const { colorMode } = useColorMode();
  const { wallets } = useWallets({ getAll: true });
  const { satsEnabled } = useAppSelector((state) => state.settings);

  const correctSendUnit = (btc: number) => {
    if (satsEnabled) {
      return BtcToSats(btc);
    } else return btc;
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap Details'} />
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={styles.contentContainer}
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
      >
        <Box flex={1}>
          <Text>{`Created At : ${data.created_at}`}</Text>
          <Text>{`Expires At : ${new Date(data.expired_at)}`}</Text>
          <Text>{`Status : ${data.status}`}</Text>
          <Text>{`Transaction ID : ${data.transaction_id}`}</Text>
          <Text>{`Swap Rate : ${data.rate}`}</Text>

          <Box flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <CoinLogo code={data.coin_from} />
            <Text>{'=>'}</Text>
            <CoinLogo code={data.coin_to} />
          </Box>

          <Box m={1}>
            <Text>{`From ${data.coin_from_name} : ${data.coin_from}`}</Text>
            <Text>{`Refund Address: ${data.return}`}</Text>
            <Text>{`Deposit Amount: ${data.deposit_amount}`}</Text>
            <ReceiveQR qrValue={data.deposit} />
            <ReceiveAddress address={data.deposit} />
          </Box>
          <Box m={1}>
            <Text>{`To ${data.coin_to_name} : ${data.coin_to} : ${data.coin_to_network}`}</Text>
            <Text>{`Receive Address: ${data.withdrawal}`}</Text>
            <Text>{`Receive Amount: ${data.withdrawal_amount}`}</Text>
          </Box>

          <Box>
            <Buttons
              primaryCallback={() => {
                navigation.dispatch(
                  CommonActions.navigate('AddSendAmount', {
                    sender: wallets[0],
                    internalRecipients: [],
                    address: data.deposit,
                    amount: correctSendUnit(data.deposit_amount),
                    note: '',
                    selectedUTXOs: [],
                    totalUtxosAmount: 0,
                    parentScreen: undefined,
                    isSendMax: undefined,
                    recipients: [],
                    totalRecipients: 1,
                    currentRecipientIdx: 1,
                    miniscriptSelectedSatisfier: null,
                  })
                );
              }}
              primaryText="Pay with Wallet"
            />
          </Box>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
});
