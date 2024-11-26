import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { windowWidth } from 'src/constants/responsive';
import FeeGraph from './FeeGraph';
import Text from 'src/components/KeeperText';
import FeeDataStats from './FeeDataStats';
import Relay from 'src/services/backend/Relay';
import { useColorMode } from 'native-base';
import { calculateAverageBlockTime, generateFeeInsightStatement } from 'src/utils/feeInisghtUtil';
import Fonts from 'src/constants/Fonts';
import useOneDayInsight from 'src/hooks/useOneDayInsight';
import FeeInsightCard from './FeeInsightCard';
import FeeDataSource from './FeeDataSource';

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
            BTC Transaction Fee Insights
          </Text>
        </View>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <>
            <View style={styles.cardWrapper}>
              <FeeInsightCard
                line1={'Current'}
                line2={'average'}
                suffix={' sats/vByte'}
                stats={feeInsightStatement.latestFee}
              />
              <FeeInsightCard
                line1={'From'}
                line2={'yesterday'}
                suffix={' sats/vByte'}
                stats={feeInsightStatement.oneDayAgoFee}
                showArrow={true}
                pointer={feeInsightStatement.dayComparisonText}
              />
              <FeeInsightCard
                line1={`This week's`}
                line2={'average'}
                suffix={' sats/vByte'}
                stats={feeInsightStatement.oneWeekAgoFee}
              />
            </View>
            <FeeGraph dataSet={oneWeekFeeRate} recentData={oneDayFeeRate} />
            <FeeDataStats />
            <FeeDataSource />
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
    fontFamily: Fonts.InterBold,
  },
  cardWrapper: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 7,
  },
});
