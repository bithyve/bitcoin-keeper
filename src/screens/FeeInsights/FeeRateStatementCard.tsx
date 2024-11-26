import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Fonts from 'src/constants/Fonts';
import Text from 'src/components/KeeperText';
import RightArrowGrey from 'src/assets/images/icon_arrow_grey.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import BTC_DOWN from 'src/assets/images/btc_down.svg';
import BTC_UP from 'src/assets/images/btc_up.svg';
import { Box, useColorMode } from 'native-base';
import { generateFeeStatement } from 'src/utils/feeInisghtUtil';
import { hp, wp } from 'src/constants/responsive';

interface Props {
  showFeesInsightModal: () => void;
  feeInsightData: [];
}

const FeerateStatement = (props: Props) => {
  const [shortFeeStatement, setShortFeeStatement] = useState('');
  const [arrowPointer, setArrowPointer] = useState('higher');
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const { showFeesInsightModal, feeInsightData } = props;
  useEffect(() => {
    if (feeInsightData.length > 0) {
      updateFeeStatement(feeInsightData);
    }
  }, [feeInsightData]);

  function updateFeeStatement(data: any[]) {
    if (data.length === 0) {
      setShortFeeStatement('Failed to fetch fee stats');
      return;
    }

    let resultStatement = generateFeeStatement(data);
    if (resultStatement.includes('low')) {
      setArrowPointer('lower');
    } else if (resultStatement.includes('high')) {
      setArrowPointer('higher');
    }

    setShortFeeStatement(resultStatement);
  }

  return (
    <TouchableOpacity onPress={showFeesInsightModal} style={styles.feeInsightContainer}>
      <Box>
        <Box>
          <Text color={`${colorMode}.primaryText`} fontSize={16} medium>
            Fee Stats
          </Text>
        </Box>

        <Box style={styles.statementWrapper}>
          <Box style={styles.textWrapper}>
            {shortFeeStatement.includes('higher than usual') ||
            shortFeeStatement.includes('lower than usual') ? (
              <>
                <Text style={styles.highAlertSatsFee} color={`${colorMode}.feeInfoTitleColor`}>
                  {`Fees are `}
                </Text>
                <Box style={styles.arrowWrapper}>
                  {arrowPointer === 'lower' ? <BTC_DOWN /> : <BTC_UP />}
                </Box>
                <Text style={styles.percentageStatement} bold color={`${colorMode}.feeInfoColor`}>
                  {Number(shortFeeStatement.match(/\d+\.?\d*/)?.[0] || 0)}%
                </Text>
                <Text style={styles.highAlertSatsFee} color={`${colorMode}.feeInfoColor`}>
                  {`  ${arrowPointer} than usual`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.highAlertSatsFee} color={`${colorMode}.feeInfoTitleColor`}>
                  {shortFeeStatement}
                </Text>

                {(shortFeeStatement.includes('low') || shortFeeStatement.includes('high')) && (
                  <Box style={styles.arrowWrapper}>
                    {arrowPointer === 'lower' ? <BTC_DOWN /> : <BTC_UP />}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Box>
        <Box style={styles.ctaContainer}>
          {isDarkMode ? <RightArrowWhite /> : <RightArrowGrey />}
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default FeerateStatement;

const styles = StyleSheet.create({
  feeInsightContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statementWrapper: {
    flex: 1,
  },
  highAlertSatsFee: {
    fontSize: 14,
    fontFamily: Fonts.InterRegular,
  },
  percentageStatement: {
    fontSize: 16,
  },
  ctaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowWrapper: {
    width: 15,
    height: 20,
    marginTop: hp(3),
    marginHorizontal: wp(5),
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
});
