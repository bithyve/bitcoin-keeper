import { Box, HStack, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import { getTnxDetails } from 'src/store/sagaActions/swap';
import { CoinLogo } from './Swaps';

export const SwapHistoryDetail = ({ navigation, route }) => {
  const { tnxId, createdAt } = route.params;
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!tnxId) {
      showToast('Transaction id is missing', <ToastErrorIcon />);
      navigation.goBack();
      return;
    }

    setLoading(true);
    dispatch(
      getTnxDetails({
        tnxId,
        callback: ({ status, tnx, error }) => {
          setLoading(false);
          if (!status) {
            navigation.goBack();
            showToast(error, <ToastErrorIcon />);
          } else {
            setDetails(tnx);
          }
        },
      })
    );
  }, []);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Transaction Details'} />

      {details && (
        <Box>
          <HStack my={5} justifyContent={'space-between'}>
            <Box>
              <Text>{details.transaction_id}</Text>
              <Text>{createdAt}</Text>
            </Box>
            <Box>
              <Text>{details.is_float ? 'Floating' : 'Fixed'}</Text>
            </Box>
          </HStack>

          <HStack justifyContent={'space-between'} my={5}>
            <HStack mr={2}>
              <CoinLogo code={details.coin_from} />
              <Box ml={4}>
                <Text>{`${details.coin_from_name} Sent`}</Text>
                <Text>{details.deposit_amount}</Text>
              </Box>
            </HStack>
            <HStack mr={2}>
              <CoinLogo code={details.coin_to} />
              <Box ml={4}>
                <Text>{`${details.coin_to_name} Received`}</Text>
                <Text>{details.withdrawal_amount}</Text>
              </Box>
            </HStack>
          </HStack>

          <Box my={5} gap={1}>
            <Text>Status</Text>
            <Text>{details.status}</Text>
          </Box>
          <Box my={5} gap={1}>
            <Text>Real Deposit Amount</Text>
            <Text>{details.real_deposit_amount}</Text>
          </Box>
          <Box my={5} gap={1}>
            <Text>Real withdrawal Amount</Text>
            <Text>{details.real_withdrawal_amount}</Text>
          </Box>
          <Box my={5} gap={1}>
            <Text>Deposit Address</Text>
            <Text>{details.deposit}</Text>
          </Box>
          <Box my={5} gap={1}>
            <Text>Receipt Address</Text>
            <Text>{details.withdrawal}</Text>
          </Box>
        </Box>
      )}

      <ActivityIndicatorView visible={loading} showLoader />
    </ScreenWrapper>
  );
};
