import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Relay from 'src/services/operations/Relay';
import Text from 'src/components/KeeperText';
import { useColorMode } from 'native-base';
import { useAppSelector } from 'src/store/hooks';

interface DataItem {
  label: string;
  suffix: string;
  prefix: string;
  format: boolean;
}

const DataPoints = {
  blocks_24h: {
    label: 'Blocks',
    suffix: '',
    prefix: '',
    format: false,
  },
  suggested_transaction_fee_per_byte_sat: {
    label: 'Suggested txn fee',
    suffix: ' sat(s)/vB',
    prefix: '',
    format: false,
  },
  average_transaction_fee_usd_24h: {
    label: 'Average txn fee',
    suffix: '',
    prefix: '$',
    format: false,
  },
  transactions_24h: {
    label: 'Transaction in 24h',
    suffix: '',
    prefix: '',
    format: true,
  },
  market_price_usd: {
    label: 'BTC Market Price',
    suffix: '',
    prefix: '$',
    format: true,
  },
  market_price_usd_change_24h_percentage: {
    label: 'Market Price change USD',
    suffix: '%',
    prefix: '',
    format: false,
  },
  average_transaction_fee_24h: {
    label: 'Average txn fee',
    suffix: ' sats/vB',
    prefix: '',
    format: false,
  },
};

const FeeDataStats = () => {
  const [feeInsight, setFeeInsight] = useState({});
  const { colorMode } = useColorMode();
  const { currencyKind } = useAppSelector((state) => state.settings);
  useEffect(() => {
    const fetchInsightData = async () => {
        const result = await Relay.feeOneDayInsights();
        if (result && result.data) {
          setFeeInsight(result.data);
        }
    };

    fetchInsightData();
  }, []);

  function formatData(data: DataItem, value: number) {
    let finalStr = `${data.prefix}${Math.round(value * 100) / 100}${data.suffix}`;
    if (!data.format) {
      return finalStr;
    }
    var result = finalStr;
    var lastThree = result.substring(result.length - 3);
    var otherNumbers = result.substring(0, result.length - 3);
    if (otherNumbers != '') lastThree = ',' + lastThree;
    result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return result;
  }

  const renderStatsUI = () => {
    return Object.entries(feeInsight || {}).map(([key, value]: [string, number]) => {
      if (DataPoints[key]) {
        if (currencyKind !== 'BITCOIN' && key === 'average_transaction_fee_24h') {
          return null;
        }
        if (currencyKind !== 'FIAT' && key === 'average_transaction_fee_usd_24h') {
          return null;
        }
        return (
          <View style={styles.boxWrapper} key={key}>
            <Text style={styles.dataLabel}>{DataPoints[key].label}</Text>
            <Text style={styles.dataLabel}>{formatData(DataPoints[key], value)}</Text>
          </View>
        );
      }
      return null;
    });
  };

  if(feeInsight && Object.keys(feeInsight).length === 0){
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleLabel} color={`${colorMode}.modalGreenTitle`}>
        24 hours statistics
      </Text>
      {feeInsight ? renderStatsUI() : <Text color={`${colorMode}.SlateGrey`} style={styles.dataStats}>No data available.</Text>}
    </View>
  );
};

export default FeeDataStats;

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
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 5,
  },
});
