import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FeeIndicator from './FeeIndicator';
import Fonts from 'src/constants/Fonts';
import Text from 'src/components/KeeperText';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import BTC_DOWN from 'src/assets/images/btc_down.svg';
import BTC_UP from 'src/assets/images/btc_up.svg';
import { Box, useColorMode } from 'native-base';

interface Props {
  showFeesInsightModal: () => void;
  feeInsightData: [];
}

const FeerateStatement = (props: Props) => {
  const [shortFeeStatement, setShortFeeStatement] = useState('');
  const [arrowPointer, setArrowPointer] = useState('higher');
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
      setArrowPointer('higher');
      resultStatement = `Fees are ${percentageDifference.toFixed(2)}% higher than usual.`;
    } else {
      setArrowPointer('lower');
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
      <Box style={styles.feeIndicatorWrapper}>
        <FeeIndicator percentageDifference={percentageDifference} />
      </Box>
      <View style={styles.divider}></View>
      <Box style={styles.statementWrapper}>
        <Text style={styles.highAlertSatsFee} color={`${colorMode}.feeInfoTitleColor`}>
          Fees are
        </Text>
        <Box>
          <Box style={styles.textWrapper}>
            <Box style={styles.arrowWrapper}>
              {arrowPointer === 'lower' ? <BTC_DOWN /> : <BTC_UP />}
            </Box>
            <Text style={styles.percentageStatement} color={`${colorMode}.feeInfoColor`}>
              {Math.abs(Number(percentageDifference.toFixed(2)))}%
            </Text>
          </Box>
          <Text style={styles.highAlertSatsFee} color={`${colorMode}.feeInfoColor`}>
            {arrowPointer} than usual
          </Text>
        </Box>
      </Box>
      <View style={styles.ctaContainer}>
        <RightArrowIcon color={`${colorMode}.SlateGrey`} />
      </View>
    </TouchableOpacity>
  );
};

export default FeerateStatement;

const styles = StyleSheet.create({
  feeInsightContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    flex: 1,
  },
  statementWrapper: {
    flex: 1,
  },
  highlightFee: {
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  feeIndicatorWrapper: {
    position: 'absolute',
    left: -20,
    top: 10,
  },
  viewMore: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  highAlertSatsFee: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  percentageStatement: {
    fontSize: 16,
    fontFamily: Fonts.FiraSansCondensedBold,
    fontWeight: '700',
  },
  ctaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
  },
  arrowWrapper: {
    width: 15,
    height: 20,
    paddingTop: 5,
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
