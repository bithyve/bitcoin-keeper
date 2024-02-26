import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { windowWidth } from 'src/constants/responsive';
import FeeGraph from './FeeGraph';
import Text from 'src/components/KeeperText';
import FeeDataStats from './FeeDataStats';
import Relay from 'src/services/operations/Relay';
import { useColorMode } from 'native-base';

interface Props {
  oneDayFeeRate: any[];
}

const FeeInsightsContent = (props: Props) => {
  const [oneWeekFeeRate, setOneWeekFreeRate] = useState([]);
  const [feeStatement, setFeeStatement] = useState('');
  const [blockStatement, setBlockStatement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    fetchOneWeekData();
  }, []);

  useEffect(() => {
    if (oneWeekFeeRate.length > 0) {
      generateFeeStatement(oneWeekFeeRate);
      calculateAverageBlockTime(props.oneDayFeeRate)
    }
  }, [oneWeekFeeRate]);

  const fetchOneWeekData = async () => {
    setIsLoading(true);
    const result = await Relay.fetchOneWeekHistoricalFee();
    if (result && result.length > 0) {
      setOneWeekFreeRate(result);
    }else{}
      setIsLoading(false);
  };

  function generateFeeStatement(data) {
   // Define one day and one week in seconds
   const oneDay = 24 * 60 * 60;
   const oneWeek = 7 * oneDay;

   // Get the current timestamp to compare
   const now = Math.floor(Date.now() / 1000);

   // Find the most recent record for 'current'
   const currentFee = data[data.length - 1].avgFee_75;

   // Find the record from one day ago for 'yesterday'
   const yesterdayRecord = data.find(record => now - record.timestamp >= oneDay);
   const yesterdayFee = yesterdayRecord ? yesterdayRecord.avgFee_75 : currentFee; // Fallback to current if not found

   // Find the record from one week ago for 'a week before'
   const lastWeekRecord = data.find(record => now - record.timestamp >= oneWeek);
   const lastWeekFee = lastWeekRecord ? lastWeekRecord.avgFee_75 : currentFee; // Fallback to current if not found

   // Determine the trend for yesterday
   const trendYesterday = currentFee > yesterdayFee ? 'up' : (currentFee < yesterdayFee ? 'down' : 'unchanged');
   const yesterdayStatement = trendYesterday !== 'unchanged' ?
     `, ${trendYesterday} from ${yesterdayFee} sats/vByte yesterday` : '';

   // Determine the trend for last week
   const trendLastWeek = currentFee > lastWeekFee ? 'up' : (currentFee < lastWeekFee ? 'down' : 'unchanged');
   const lastWeekStatement = trendLastWeek !== 'unchanged' ?
     ` and ${trendLastWeek} from ${lastWeekFee} sats/vByte a week before` : '';

   // Generate the statement
   const feeStatement = `Bitcoin average transaction fees are currently at ${currentFee} sats/vByte${yesterdayStatement}${lastWeekStatement}.`;
   
    // Generate the statement
    setFeeStatement(feeStatement);
  }

  function calculateAverageBlockTime(data) {
    if (data.length < 2) {
      return;
    }


    // Calculate the time differences between each block in minutes
    let timeDifferences = [];
    for (let i = 1; i < data.length; i++) {
      let timeDifference = (data[i].timestamp - data[i - 1].timestamp) / 60; // Convert seconds to minutes
      timeDifferences.push(timeDifference);
    }

    // Calculate the average time difference
    const total = timeDifferences.reduce((sum, time) => sum + time, 0);
    const averageBlockTime = total / timeDifferences.length;
    // Set the statement
    setBlockStatement(
      `In the last 24 hours, the blocks are being mined at an average of ${averageBlockTime.toFixed(
        2
      )} minutes per block. This is the time needed to get one confirmation for your txn.`
    );
    setIsLoading(false);
  }


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight:400}}>
        <View style={[styles.headerWrapper,{backgroundColor:`${colorMode}.seashellWhite`}]}>
          <Text style={styles.titleLabel} color={`${colorMode}.modalGreenTitle`}>Fee Insights</Text>
        </View>
        {isLoading ? (
          <View style={styles.loaderContainer}><ActivityIndicator size="small" /></View>
        ) : (
          <>
            <Text style={styles.statementWrapper} color={`${colorMode}.SlateGrey`}>
              {feeStatement}
              {'\n'}
              {'\n'}
              {blockStatement}
            </Text>
            <FeeGraph dataSet={oneWeekFeeRate} />
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
    marginTop:10
  },
  loaderContainer:{
    flex:1,
    alignContent:'center',
    justifyContent:'center'
  }
});
