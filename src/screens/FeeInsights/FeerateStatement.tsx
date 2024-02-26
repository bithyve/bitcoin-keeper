import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FeeIndicator from './FeeIndicator';
import Fonts from 'src/constants/Fonts';
import { windowWidth } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Animated, { FadeIn } from    'react-native-reanimated';

interface Props {
  showFeesInsightModal: () => void;
  feeInsightData: [];
}

const FeerateStatement = (props: Props) => {
  const [shortFeeStatement, setShortFeeStatement] = useState('');
  const { colorMode } = useColorMode();
  const { showFeesInsightModal, feeInsightData } = props;
  useEffect(() => {
   if(feeInsightData.length>0){
    generateFeeStatement(feeInsightData)
   }
  }, [feeInsightData]);


  function generateFeeStatement(data:any[]) {
    if (data.length === 0) {
      return;
    }

    // Calculate the historical average of avgFee_75
    const total = data.reduce((sum, record) => sum + record.avgFee_75, 0);
    const historicalAverage = total / data.length;

    // Get the most recent avgFee_75
    const recentFee = data[data.length - 1].avgFee_75;

    // Calculate the percentage difference
    const difference = recentFee - historicalAverage;
    const percentageDifference = (difference / historicalAverage) * 100;

    // Generate the statement
    let resultStatement = '';
    if (difference === 0) {
      resultStatement = 'Fees are the same as the usual average.';
    } else if (difference > 0) {
      resultStatement = `Fees are ${percentageDifference.toFixed(2)}% higher than usual.`;
    } else {
      resultStatement = `Fees are ${Math.abs(percentageDifference).toFixed(2)}% lower than usual.`;
    }
    setShortFeeStatement(resultStatement);
  }

  if(shortFeeStatement.length===0){
    return null;
  }

  return (
    <Animated.View entering={FadeIn}>
    <TouchableOpacity onPress={showFeesInsightModal}>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.feeInsightContainer}>
        <Text style={styles.highAlertSatsFee}>
          {shortFeeStatement}
          {'\n'}
          <Text style={styles.viewMore}>view more details</Text>
        </Text>
        <View style={styles.feeIndicatorWrapper}>
          <FeeIndicator dataSet={feeInsightData}/>
        </View>
      </Box>
    </TouchableOpacity>
    </Animated.View>
  );
};

export default FeerateStatement;

const styles = StyleSheet.create({
  feeInsightContainer: {
    width: windowWidth * 0.8,
    padding: 10,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  highlightFee: {
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  feeIndicatorWrapper: {
    width:70,
    marginRight:10
  },
  viewMore: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  highAlertSatsFee: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
});
