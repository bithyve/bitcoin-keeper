import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useColorMode } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FeeIndicator from './FeeIndicator';
import Fonts from 'src/constants/Fonts';
import Text from 'src/components/KeeperText';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';

interface Props {
  showFeesInsightModal: () => void;
  feeInsightData: [];
}

const FeerateStatement = (props: Props) => {
  const [shortFeeStatement, setShortFeeStatement] = useState('');
  const [percentageDifference, setPercentageDifference] = useState(0);
  const { colorMode } = useColorMode();
  const { showFeesInsightModal, feeInsightData } = props;
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
    setPercentageDifference(percentageDifference);
    setShortFeeStatement(resultStatement);
  }

  if (shortFeeStatement.length === 0) {
    return null;
  }

  return (
      <TouchableOpacity onPress={showFeesInsightModal} style={styles.feeInsightContainer}>
        <Text style={styles.highAlertSatsFee}>
          {shortFeeStatement}
          {'\n'}
          <Text style={styles.viewMore}>view more details</Text>
        </Text>
        <View style={styles.feeIndicatorWrapper}>
          <FeeIndicator percentageDifference={percentageDifference} />
        </View>
        <View style={styles.ctaContainer}>
          <RightArrowIcon />
        </View>
      </TouchableOpacity>
  );
};

export default FeerateStatement;

const styles = StyleSheet.create({
  feeInsightContainer: {
    width:'100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highlightFee: {
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  feeIndicatorWrapper: {
    position: 'absolute',
    right: -20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
