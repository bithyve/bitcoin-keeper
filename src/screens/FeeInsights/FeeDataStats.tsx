import {StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Relay from 'src/services/operations/Relay';
import Text from 'src/components/KeeperText';
import Fonts from 'src/constants/Fonts';

const DataPoints = {
  blocks_24h: {
    label: 'Blocks',
    suffix: '',
  },
  suggested_transaction_fee_per_byte_sat: {
    label: 'Suggested transaction fee',
    suffix: 'sat/vB',
  },
  average_transaction_fee_usd_24h: {
    label: 'Average txn fee in USD',
    suffix: 'usd',
  },
  transactions_24h: {
    label: 'Transaction in 24h',
    suffix: '',
  },
  market_price_usd: {
    label: 'BTC Market Price',
    suffix: 'usd'
  },
  market_price_usd_change_24h_percentage:{
    label: 'Market Price change usd',
    suffix: '%',
  }
};

const FeeDataStats = () => {
  const [feeInsight, setFeeInsight] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsightData = async () => {
      try {
        const result = await Relay.feeOneDayInsights();
        if (result && result.data) {
          setFeeInsight(result.data);
        }
      } catch (err) {
        setError(err);
      }
    };

    fetchInsightData();
  }, []);

  const renderStatsUI = () => {
    return Object.entries(feeInsight || {}).map(([key, value]: [string, number]) => {
      if (DataPoints[key]) {
        return (
          <View style={styles.boxWrapper} key={key}>
            <Text style={styles.dataLabel}>{DataPoints[key].label}</Text>
            <Text style={styles.dataStats}>{Math.round(value*100)/100} {DataPoints[key].suffix}</Text>
          </View>
        );
      }
      return null;
    });
  };


  if (error) {
    return <Text>Failed to load data: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleLabel}>24 hours statistics</Text>
      {feeInsight ? renderStatsUI() : <Text>No data available.</Text>}
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
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  dataStats: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  titleLabel: {
    fontSize: 16,
    paddingBottom: 10,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
});
