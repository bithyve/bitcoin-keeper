import React, { useContext, useEffect } from 'react';
import { AppContext } from 'src/context/AppContext';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { setTestCoinsFailed, setTestCoinsReceived } from 'src/store/reducers/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType } from 'src/services/wallets/enums';
import { testSatsRecieve } from 'src/store/sagaActions/wallets';
import SettingCard from 'src/screens/Home/components/Settings/Component/SettingCard';
import { useColorMode } from 'native-base';

const useTestSats = ({ wallet }) => {
  const { setAppLoading, setLoadingContent } = useContext(AppContext);
  const { testCoinsReceived, testCoinsFailed } = useAppSelector((state) => state.wallet);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();

  useEffect(() => {
    setAppLoading(false);
    if (testCoinsReceived) {
      showToast('Testnet Sats Received', <TickIcon />);
      setTimeout(() => {
        dispatch(setTestCoinsReceived(false));
        navigation.goBack();
      }, 3000);
    } else if (testCoinsFailed) {
      showToast('Process Failed');
      dispatch(setTestCoinsFailed(false));
    }
  }, [testCoinsReceived, testCoinsFailed]);

  useEffect(() => {
    setLoadingContent({
      title: common.pleaseWait,
      subtitle: common.receiveTestSats,
      message: '',
    });

    return () => {
      setLoadingContent({
        title: '',
        subTitle: '',
        message: '',
      });
      setAppLoading(false);
    };
  }, []);

  return bitcoinNetworkType === NetworkType.TESTNET ? (
    <SettingCard
      subtitleColor={`${colorMode}.balanceText`}
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.separator`}
      items={[
        {
          title: 'Receive Test Sats',
          description: `Receive test sats in your ${
            wallet.entityKind === EntityKind.VAULT ? 'vault' : 'wallet'
          }`,
          icon: null,
          isDiamond: false,
          onPress: () => {
            setAppLoading(true);
            dispatch(testSatsRecieve(wallet));
          },
        },
      ]}
    />
  ) : null;
};

export default useTestSats;
