import { Box, ScrollView, useColorMode, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { useAppSelector } from 'src/store/hooks';
import Colors from 'src/theme/Colors';
import BuyBtcModalContent from './BuyBtcModalContent';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { manipulateBitcoinPrices } from 'src/utils/utilities';
import BtcGraph from './BtcGraph';
import Relay from 'src/services/backend/Relay';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

const BuyBtc = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const exchangeRates = useExchangeRates();
  const { currencyCode } = useAppSelector((state) => state.settings);
  const BtcPrice = exchangeRates?.[currencyCode];
  const { translations } = useContext(LocalizationContext);
  const { buyBTC: buyBTCText, common } = translations;
  const [visibleBuyBtc, setVisibleBuyBtc] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const navigation = useNavigation();
  const [graphData, setGraphData] = useState([]);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState(null);

  const { wallets } = useWallets();
  const { allVaults } = useVault({ getHiddenWallets: false });
  const { showToast } = useToastMessage();
  const allWallets = [...wallets, ...allVaults];

  useEffect(() => {
    loadBtcPrice();
  }, []);

  const loadBtcPrice = async () => {
    try {
      const data = await Relay.getBtcPrice(currencyCode);
      const { dailyPrice, high24h, latestPrice, low24h, percentChange, valueChange } =
        manipulateBitcoinPrices(data?.prices);
      setGraphData(dailyPrice);
      setStats({ high24h, low24h, latestPrice, percentChange, valueChange });
    } catch (error) {
      console.log('🚀 ~ loadBtcPrice ~ error:', error);
      setError(true);
    }
  };

  if (error) {
    return (
      <View flex={1} backgroundColor={`${colorMode}.primaryBackground`}>
        <Text>{common.somethingWrong}</Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={`${colorMode}.primaryBackground`}>
      {graphData.length > 0 ? (
        <>
          <ScrollView style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
            <Box style={styles.header}>
              <Box style={styles.btc_container}>
                <Box
                  style={styles.logo_container}
                  backgroundColor={`${colorMode}.btcLogoBackground`}
                >
                  <ThemedSvg name={'bitcoin_logo'} width={wp(24)} height={wp(24)} />
                </Box>
                <Box>
                  <Text fontSize={17} fontWeight="bold" color={`${colorMode}.primaryText`}>
                    BTC
                  </Text>
                  <Text
                    fontSize={15}
                    color={
                      isDarkMode ? `${colorMode}.buttonText` : `${colorMode}.secondaryLightGrey`
                    }
                  >
                    {buyBTCText.bitCoin}
                  </Text>
                </Box>
              </Box>
              <Box alignItems={'flex-end'}>
                <Text fontSize={16} fontWeight="bold" color={`${colorMode}.primaryText`}>
                  {`${BtcPrice?.symbol} ${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(stats?.latestPrice)}`}
                </Text>
                <Text
                  fontSize={14}
                  color={stats?.valueChange < 0 ? Colors.CrimsonRed : Colors.PersianGreen}
                >
                  {`${BtcPrice?.symbol}${stats?.valueChange} (${stats?.percentChange}%) 24 hours`}
                </Text>
              </Box>
            </Box>
            <Box style={styles.graph_container}>
              <BtcGraph dataSet={graphData} spacing={67} />
            </Box>
            <Box style={styles.info_container}>
              <Text fontSize={16} semiBold>
                {buyBTCText.marketInfo}
              </Text>
              <Box style={styles.cards_container}>
                <Box style={styles.card} borderColor={`${colorMode}.separator`}>
                  <Text>{`24h ${buyBTCText.high}`}</Text>
                  <Text fontSize={16} fontWeight="bold" color={Colors.PersianGreen}>
                    {`${BtcPrice?.symbol} ${new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats?.high24h)}`}
                  </Text>
                </Box>
                <Box style={styles.card} borderColor={`${colorMode}.separator`}>
                  <Text>{`24h ${buyBTCText.low}`}</Text>
                  <Text fontSize={16} fontWeight="bold" color={Colors.CrimsonRed}>
                    {`${BtcPrice?.symbol} ${new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats?.low24h)}`}
                  </Text>
                </Box>
              </Box>
            </Box>
          </ScrollView>
          <Box style={styles.button_container}>
            <Buttons
              primaryText={buyBTCText.buyBtc}
              fullWidth
              primaryCallback={() => {
                if (allWallets.length) setVisibleBuyBtc(true);
                else showToast('Please create a wallet to proceed.', <ToastErrorIcon />);
              }}
            />
          </Box>
        </>
      ) : (
        <Box alignItems={'center'} justifyContent={'center'}>
          <ActivityIndicator />
        </Box>
      )}
      <KeeperModal
        visible={visibleBuyBtc}
        close={() => setVisibleBuyBtc(false)}
        title={buyBTCText.selectWallet}
        subTitle={buyBTCText.selectWalletDesc}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <BuyBtcModalContent
            allWallets={allWallets}
            setSelectedWallet={setSelectedWallet}
            selectedWallet={selectedWallet}
          />
        )}
        buttonText={selectedWallet ? common.proceed : null}
        buttonCallback={() => {
          if (!selectedWallet) return;
          setVisibleBuyBtc(false);
          navigation.dispatch(
            CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet: selectedWallet } })
          );
        }}
      />
    </View>
  );
};

export default BuyBtc;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: windowWidth,
    paddingHorizontal: wp(12),
  },
  btc_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo_container: {
    width: wp(56),
    height: hp(56),
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graph_container: {
    width: windowWidth,
    marginVertical: hp(16),
  },
  cards_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: hp(16),
  },
  card: {
    paddingVertical: hp(16),
    paddingHorizontal: wp(16),
    borderWidth: 1,
    width: wp(160),
    borderRadius: 8,
  },
  button_container: {
    width: windowWidth,
    marginVertical: hp(10),
    paddingHorizontal: wp(12),
  },
  info_container: {
    maxWidth: windowWidth,
    paddingHorizontal: wp(12),
  },
});