import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

import KeysIcon from 'src/assets/images/homeGreenKeyIcon.svg';
import ConciergeIcon from 'src/assets/images/faq-green.svg';
import SettingIcon from 'src/assets/images/settingsGreenIcon.svg';
import { resetRealyWalletState, setHomeToastMessage } from 'src/store/reducers/bhr';
import InititalAppController from './InititalAppController';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { SentryErrorBoundary } from 'src/services/sentry';
import HomeScreenHeader from 'src/components/HomeScreenHeader';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { hp, wp } from 'src/constants/responsive';
import WalletIcon from 'src/assets/images/WalletIcon.svg';
import MenuFooter from 'src/components/MenuFooter';
import HomeWallet from './components/Wallet/HomeWallet';
import ManageKeys from './components/Keys/ManageKeys';
import KeeperSettings from './components/Settings/keeperSettings';
import { useNavigation } from '@react-navigation/native';
import TechnicalSupport from '../KeeperConcierge/TechnicalSupport';
import TickIcon from 'src/assets/images/icon_tick.svg';

function NewHomeScreen({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { addedSigner, selectedOption: selectedOptionFromRoute } = route.params || {};
  const { wallets } = useWallets({ getAll: true });
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage, homeToastMessage } =
    useAppSelector((state) => state.bhr);
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { home: homeTranslation, wallet } = translations;
  const [selectedOption, setSelectedOption] = useState(
    selectedOptionFromRoute || wallet.homeWallets
  );

  useEffect(() => {
    if (selectedOptionFromRoute && selectedOptionFromRoute !== selectedOption) {
      setSelectedOption(selectedOptionFromRoute);
    }
  }, [selectedOptionFromRoute]);

  const getContent = () => {
    switch (selectedOption) {
      case wallet.homeWallets:
        return {
          content: (
            <Box>
              <HomeWallet />
            </Box>
          ),

          icon: (
            <CircleIconWrapper
              width={wp(39)}
              icon={<WalletIcon />}
              backgroundColor={`${colorMode}.headerWhite`}
            />
          ),
        };
      case wallet.keys:
        return {
          content: (
            <Box>
              <ManageKeys addedSigner={addedSigner} />
            </Box>
          ),
          icon: (
            <CircleIconWrapper
              width={wp(39)}
              icon={<KeysIcon />}
              backgroundColor={`${colorMode}.headerWhite`}
            />
          ),
        };
      case wallet.concierge:
        return {
          content: (
            <Box>
              <TechnicalSupport route={route} />
            </Box>
          ),
          icon: (
            <CircleIconWrapper
              width={wp(39)}
              icon={
                <ConciergeIcon
                  width={wp(20)}
                  height={hp(20)}
                  style={{ marginRight: wp(1), marginBottom: hp(1) }}
                />
              }
              backgroundColor={`${colorMode}.headerWhite`}
            />
          ),
        };
      case wallet.more:
        return {
          content: (
            <Box>
              <KeeperSettings route={route} />
            </Box>
          ),
          icon: (
            <CircleIconWrapper
              width={wp(39)}
              icon={<SettingIcon />}
              backgroundColor={`${colorMode}.headerWhite`}
            />
          ),
        };
      default:
        return { content: null, icon: null };
    }
  };

  const { content, icon } = getContent();

  useEffect(() => {
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || homeTranslation.RelayWalletErrorMessage,
        <ToastErrorIcon />
      );
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  useEffect(() => {
    if (homeToastMessage?.message) {
      showToast(
        homeToastMessage.message,
        homeToastMessage?.isError ? <ToastErrorIcon /> : <TickIcon />
      );
      dispatch(setHomeToastMessage({ message: null, isError: false }));
    }
  }, [homeToastMessage]);

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} style={styles.container}>
      <InititalAppController
        navigation={navigation}
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />

      <HomeScreenHeader colorMode={colorMode} title={selectedOption} circleIconWrapper={icon} />
      <Box style={styles.content}>{content}</Box>
      <MenuFooter
        selectedOption={selectedOption}
        onOptionChange={(option) => {
          navigation.navigate('Home', { selectedOption: option });
        }}
      />
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
    paddingTop: hp(22),
  },
});
