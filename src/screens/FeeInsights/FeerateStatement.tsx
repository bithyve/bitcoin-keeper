import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FeeIndicator from './FeeIndicator';
import Fonts from 'src/constants/Fonts';
import Text from 'src/components/KeeperText';
import Animated, { FadeIn } from 'react-native-reanimated';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';

interface Props {
  showFeesInsightModal: () => void;
  feeInsightData: [];
  showCTA?: boolean;
}

const FeerateStatement = (props: Props) => {
  const [shortFeeStatement, setShortFeeStatement] = useState('');
  const { colorMode } = useColorMode();
  const { showFeesInsightModal, feeInsightData, showCTA } = props;
  useEffect(() => {
    if (feeInsightData.length > 0) {
      generateFeeStatement(feeInsightData);
    }
  }, [feeInsightData]);

  function generateFeeStatement(data: any[]) {
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

  if (shortFeeStatement.length === 0) {
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
            <FeeIndicator dataSet={feeInsightData} />
          </View>
          {showCTA && <View style={styles.ctaContainer}>
            <Box justifyContent="center" alignItems="flex-end">
              <RightArrowIcon />
            </Box>
          </View>}
        </Box>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FeerateStatement;

const styles = StyleSheet.create({
  feeInsightContainer: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    
  },
  highlightFee: {
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  feeIndicatorWrapper: {
    width: 100,
    marginRight: 10,
  },
  viewMore: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  highAlertSatsFee: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  ctaContainer: {
    position: 'absolute',
    right: 15,
    top:30
  },
});
