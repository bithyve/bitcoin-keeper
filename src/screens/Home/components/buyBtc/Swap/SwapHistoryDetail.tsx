import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Swap from 'src/services/backend/Swap';

export const SwapHistoryDetail = ({ navigation, route }) => {
  const { tnxId } = route.params;
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (tnxId) {
      console.log('Tnx Id , call api ');
      getTnxDetails();
    } else {
      console.log('Tnx Id not found ');
      navigation.goBack();
    }
  }, []);

  const getTnxDetails = async () => {
    try {
      setLoading(true);
      const details = await Swap.getTnxDetails(tnxId);
      setDetails(details);
      console.log('🚀 ~ getTnxDetails ~ details:', details);
    } catch (error) {
      console.log('🚀 ~ getTnxDetails ~ error:', error);
      showToast(error.message, <ToastErrorIcon />);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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
