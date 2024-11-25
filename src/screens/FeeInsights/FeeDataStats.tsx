import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Relay from 'src/services/backend/Relay';
import Text from 'src/components/KeeperText';
import { useColorMode } from 'native-base';
import { useAppSelector } from 'src/store/hooks';
import FeeInsightCard from './FeeInsightCard';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { SATOSHIS_IN_BTC } from 'src/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import Fonts from 'src/constants/Fonts';

interface DataItem {
  btc_data: {
    btc_price_change_percent: number;
    btc_price_usd: number;
    last_updated: number;
  };
  suggested_fee: number;
}

const FeeDataStats = () => {
  const [feeInsight, setFeeInsight] = useState<DataItem>({
    btc_data: {
      btc_price_change_percent: 0,
      btc_price_usd: 0,
      last_updated: 0,
    },
    suggested_fee: 0,
  });
  const { colorMode } = useColorMode();
  const exchangeRates = useExchangeRates();
  const { currencyKind } = useAppSelector((state) => state.settings);
  const currencyCode = useCurrencyCode();
  useEffect(() => {
    const fetchInsightData = async () => {
      const result = await Relay.fetchFeeInsightData();
      if (result && result.btc_data) {
        setFeeInsight(result);
      }
    };

    fetchInsightData();
  }, []);

  function convertSatsToFiat(fiatAmount: number) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (fiatAmount / SATOSHIS_IN_BTC) * exchangeRates[currencyCode].last
      : 0;
  }

  function addCommas(value: string) {
    var lastThree = value.substring(value.length - 3);
    var otherNumbers = value.substring(0, value.length - 3);
    if (otherNumbers != '') lastThree = ',' + lastThree;
    value = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return value;
  }

  if (feeInsight && Object.keys(feeInsight).length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleLabel} color={`${colorMode}.modalGreenTitle`}>
        24 Hours Statistics
      </Text>
      <View style={styles.cardWrapper}>
        <FeeInsightCard
          line1={'BTC'}
          line2={'Market Price'}
          suffix={''}
          stats={`$ ${addCommas(String(feeInsight.btc_data.btc_price_usd))}`}
        />
        <FeeInsightCard
          line1={'Market price'}
          line2={'change USD'}
          suffix={''}
          stats={feeInsight.btc_data.btc_price_change_percent.toFixed(2) + '%'}
        />
        {currencyKind === 'BITCOIN' && (
          <FeeInsightCard
            line1={'Suggested'}
            line2={'txn fee (fast)'}
            suffix={' sats/vByte'}
            stats={feeInsight.suggested_fee}
          />
        )}
        {currencyKind === 'FIAT' && (
          <FeeInsightCard
            line1={'Suggested'}
            line2={'txn fee (fast)'}
            suffix={''}
            stats={`$ ${convertSatsToFiat(feeInsight.suggested_fee).toFixed(5)}`}
          />
        )}
      </View>
    </View>
  );
};

export default React.memo(FeeDataStats);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boxWrapper: {
    flex: 1,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataLabel: {
    fontSize: 12,
    letterSpacing: 1,
  },
  dataStats: {
    fontSize: 12,
    letterSpacing: 1,
  },
  titleLabel: {
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: Fonts.InterRegular,
  },
  cardWrapper: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 7,
  },
});
