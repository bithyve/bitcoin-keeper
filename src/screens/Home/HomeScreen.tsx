import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useContext, useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import InititalAppController from './InititalAppController';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { SentryErrorBoundary } from 'src/services/sentry';
import HomeScreenHeader from 'src/components/HomeScreenHeader';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { wp } from 'src/constants/responsive';
import WalletIcon from 'src/assets/images/WalletIcon.svg';
import MenuFooter from 'src/components/MenuFooter';
import Text from 'src/components/KeeperText';
import HomeWallet from './components/Wallet/HomeWallet';
import Colors from 'src/theme/Colors';

function NewHomeScreen({ navigation }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { wallets } = useWallets({ getAll: true });
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const { showToast } = useToastMessage();
  const { top } = useSafeAreaInsets();
  const { translations } = useContext(LocalizationContext);
  const { home: homeTranslation, wallet } = translations;
  const [selectedOption, setSelectedOption] = useState(wallet.homeWallets);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };
  const getContent = () => {
    switch (selectedOption) {
      case wallet.homeWallets:
        return (
          <Box>
            <HomeWallet />
          </Box>
        );
      case wallet.keys:
        return (
          <Box>
            <Text>keys </Text>
          </Box>
        );
      case wallet.concierge:
        return (
          <Box>
            <Text>Concierge Content</Text>
          </Box>
        );
      case wallet.more:
        return (
          <Box>
            <Text>More/Settings Content</Text>
          </Box>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || homeTranslation.RelayWalletErrorMessage,
        <ToastErrorIcon />
      );
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} style={styles.container}>
      <InititalAppController
        navigation={navigation}
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />
      <HomeScreenHeader
        colorMode={colorMode}
        title={selectedOption}
        circleIconWrapper={
          <CircleIconWrapper width={wp(39)} icon={<WalletIcon />} backgroundColor={Colors.White} />
        }
      />

      <Box style={styles.content}>{getContent()}</Box>
      <MenuFooter selectedOption={selectedOption} onOptionChange={handleOptionChange} />
    </Box>
  );
}

export default SentryErrorBoundary(NewHomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: wp(22),
  },
});
