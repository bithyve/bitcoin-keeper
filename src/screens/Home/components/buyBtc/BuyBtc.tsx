import { Box, ScrollView, useColorMode, View } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useExchangeRates from 'src/hooks/useExchangeRates';
import FeeGraph from 'src/screens/FeeInsights/FeeGraph';
import { useAppSelector } from 'src/store/hooks';
import Colors from 'src/theme/Colors';

const BuyBtc = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const exchangeRates = useExchangeRates();
  const { currencyCode } = useAppSelector((state) => state.settings);
  const BtcPrice = exchangeRates?.[currencyCode];
  const { translations } = useContext(LocalizationContext);
  const { buyBTC: buyBTCText } = translations;

  //   dummy data for graph
  const oneWeekFeeRate = [
    { timestamp: 1718140800, avgFee_75: 15 },
    { timestamp: 1718227200, avgFee_75: 20 },
    { timestamp: 1718313600, avgFee_75: 25 },
    { timestamp: 1718400000, avgFee_75: 18 },
    { timestamp: 1718486400, avgFee_75: 22 },
    { timestamp: 1718572800, avgFee_75: 30 },
    { timestamp: 1718659200, avgFee_75: 28 },
  ];

  const oneDayFeeRate = [{ timestamp: 1718659200, avgFee_75: 28 }];

  return (
    <View flex={1} backgroundColor={`${colorMode}.primaryBackground`}>
      <ScrollView style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.header}>
          <Box style={styles.btc_container}>
            <Box style={styles.logo_container} backgroundColor={`${colorMode}.btcLogoBackground`}>
              <ThemedSvg name={'bitcoin_logo'} width={wp(24)} height={wp(24)} />
            </Box>
            <Box>
              <Text fontSize={17} fontWeight="bold" color={`${colorMode}.primaryText`}>
                BTC
              </Text>
              <Text
                fontSize={15}
                color={isDarkMode ? `${colorMode}.buttonText` : `${colorMode}.secondaryLightGrey`}
              >
                {buyBTCText.bitCoin}
              </Text>
            </Box>
          </Box>
          <Box>
            <Text fontSize={16} fontWeight="bold" color={`${colorMode}.primaryText`}>
              {`${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(BtcPrice?.last)} ${BtcPrice?.symbol}`}
            </Text>
          </Box>
        </Box>
        <Box style={styles.graph_container}>
          <FeeGraph
            dataSet={oneWeekFeeRate}
            recentData={oneDayFeeRate}
            spacing={52}
            yAxisLabelWidth={20}
          />
        </Box>
        <Box>
          <Text fontSize={16} semiBold>
            {buyBTCText.marketInfo}
          </Text>
          <Box style={styles.cards_container}>
            <Box style={styles.card} borderColor={`${colorMode}.separator`}>
              <Text>{`24h ${buyBTCText.high}`}</Text>
              <Text fontSize={16} fontWeight="bold" color={Colors.PersianGreen}>
                $106,807
              </Text>
            </Box>
            <Box style={styles.card} borderColor={`${colorMode}.separator`}>
              <Text>{`24h ${buyBTCText.low}`}</Text>
              <Text fontSize={16} fontWeight="bold" color={Colors.CrimsonRed}>
                $105,807
              </Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>
      <Box style={styles.button_container}>
        <Buttons primaryText={buyBTCText.buyBtc} fullWidth />
      </Box>
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
    width: windowWidth * 0.88,
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
    width: windowWidth * 0.88,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(16),
  },
  cards_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: windowWidth * 0.88,
    marginVertical: hp(16),
    gap: wp(10),
  },
  card: {
    paddingVertical: hp(16),
    paddingHorizontal: wp(16),
    borderWidth: 1,
    width: windowWidth * 0.43,
    borderRadius: 8,
  },
  button_container: {
    width: windowWidth * 0.88,
    marginVertical: hp(10),
  },
});
