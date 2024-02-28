import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { windowWidth } from 'src/constants/responsive';
import FeeGraph from './FeeGraph';
import Text from 'src/components/KeeperText';
import FeeDataStats from './FeeDataStats';
import Relay from 'src/services/operations/Relay';
import { useColorMode } from 'native-base';
import { calculateAverageBlockTime, generateFeeInsightStatement } from 'src/utils/feeInisghtUtil';
import Fonts from 'src/constants/Fonts';
import useOneDayInsight from 'src/hooks/useOneDayInsight';



const FeeInsightsContent = () => {
  const [oneWeekFeeRate, setOneWeekFreeRate] = useState([]);
  const oneDayFeeRate = useOneDayInsight();
  const [feeInsightStatement, setFeeInsightStatement] = useState({
    latestFee: '',
    dayComparisonText: '',
    oneDayAgoFee: '',
    weekComparisonText: '',
    oneWeekAgoFee: '',
  });
  const [blockTime, setBlockTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    fetchOneWeekData();
  }, []);

  useEffect(() => {
    if (oneWeekFeeRate.length > 0) {
      const resultFeeInsight = generateFeeInsightStatement(oneWeekFeeRate);
      const resultBlockTime = calculateAverageBlockTime(oneDayFeeRate);
      setFeeInsightStatement(resultFeeInsight);
      setBlockTime(resultBlockTime);
      setIsLoading(false);
    }
  }, [oneWeekFeeRate]);

  const fetchOneWeekData = async () => {
    setIsLoading(true);
    const result = await Relay.fetchOneWeekHistoricalFee();
    if (result && result.length > 0) {
      setOneWeekFreeRate(result);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: 400 }}>
        <View style={[styles.headerWrapper, { backgroundColor: `${colorMode}.seashellWhite` }]}>
          <Text style={styles.titleLabel} color={`${colorMode}.modalGreenTitle`}>
            Fee Insights
          </Text>
        </View>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <>
            <Text style={styles.statementWrapper}>
              Average txn fee is{' '}
              <Text style={styles.highlightFee}>{feeInsightStatement.latestFee}</Text>,{' '}
              {feeInsightStatement.dayComparisonText} from{' '}
              <Text style={styles.highlightFee}>{feeInsightStatement.oneDayAgoFee}</Text> yesterday
              and {feeInsightStatement.weekComparisonText}{' '}
              <Text style={styles.highlightFee}>{feeInsightStatement.oneWeekAgoFee}</Text> a
              week ago.
              {'\n'}
              {'\n'}
              Blocks are being mined at an average of{' '}
              <Text style={styles.highlightFee}>{blockTime}</Text> in the last 24 hours.
            </Text>
            <FeeGraph dataSet={oneWeekFeeRate} recentData={oneDayFeeRate} />
            <FeeDataStats />
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default FeeInsightsContent;

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
    width: windowWidth * 0.8,
  },
  headerWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLabel: {
    fontSize: 19,
    letterSpacing: 1,
  },
  statementWrapper: {
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 10,
  },
  loaderContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  highlightFee: {
    fontFamily: Fonts.FiraSansCondensedBold,
  },
});
