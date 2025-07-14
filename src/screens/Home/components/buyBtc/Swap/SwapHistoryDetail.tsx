import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import { getTnxDetails } from 'src/store/sagaActions/swap';

export const SwapHistoryDetail = ({ navigation, route }) => {
  const { tnxId } = route.params;
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
      <WalletHeader title={'Swap Transaction Details'} />

      {details && (
        <Box p={5}>
          <Text>{JSON.stringify(details)}</Text>
        </Box>
      )}

      <ActivityIndicatorView visible={loading} showLoader />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
