import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'src/context/AppContext';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import TickIcon from 'src/assets/images/icon_tick.svg';
import {
  setTestCoinsFailed,
  setTestCoinsReceived,
  setTestCoinsQuotaReached,
} from 'src/store/reducers/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType } from 'src/services/wallets/enums';
import { testSatsRecieve } from 'src/store/sagaActions/wallets';
import SettingCard from 'src/screens/Home/components/Settings/Component/SettingCard';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import KeeperModal from 'src/components/KeeperModal';

const useTestSats = ({ wallet }) => {
  const { setAppLoading, setLoadingContent } = useContext(AppContext);
  const { testCoinsReceived, testCoinsFailed, testCoinsQuotaReached } = useAppSelector(
    (state) => state.wallet
  );
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletText, error: errorText } = translations;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const [quotaModalVisible, setQuotaModalVisible] = useState(false);

  useEffect(() => {
    setAppLoading(false);
    if (testCoinsReceived) {
      showToast(walletText.recievedSats, <TickIcon />);
      setTimeout(() => {
        dispatch(setTestCoinsReceived(false));
        navigation.goBack();
      }, 3000);
    } else if (testCoinsFailed) {
      showToast(errorText.processFailed);
      dispatch(setTestCoinsFailed(false));
    }
  }, [testCoinsReceived, testCoinsFailed]);

  useEffect(() => {
    if (testCoinsQuotaReached) {
      setAppLoading(false);
      setQuotaModalVisible(true);
      dispatch(setTestCoinsQuotaReached(false));
    }
  }, [testCoinsQuotaReached]);

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

  if (bitcoinNetworkType !== NetworkType.TESTNET) return null;

  const entityLabel = wallet.entityKind === EntityKind.VAULT ? 'vault' : 'wallet';

  return (
    <>
      <SettingCard
        subtitleColor={`${colorMode}.balanceText`}
        backgroundColor={`${colorMode}.textInputBackground`}
        borderColor={`${colorMode}.separator`}
        items={[
          {
            title: walletText.recievedSatsTitle,
            description: `${walletText.faucetDailyLimitHint} ${walletText.recieveSatsDesc} ${entityLabel}`,
            icon: null,
            isDiamond: false,
            onPress: () => {
              setAppLoading(true);
              dispatch(testSatsRecieve(wallet));
            },
          },
        ]}
      />
      <KeeperModal
        visible={quotaModalVisible}
        close={() => setQuotaModalVisible(false)}
        title={walletText.faucetDailyLimitTitle}
        subTitle={walletText.faucetDailyLimitBody}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        showCloseIcon={false}
        buttonText={common.ok}
        buttonCallback={() => setQuotaModalVisible(false)}
      />
    </>
  );
};

export default useTestSats;
