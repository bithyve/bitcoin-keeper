import { StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Fonts from 'src/constants/Fonts';
import Text from 'src/components/KeeperText';
import RightArrowGrey from 'src/assets/images/icon_arrow_grey.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import BTC_UP from 'src/assets/images/btc_up.svg';
import { Box, useColorMode } from 'native-base';
import { generateFeeStatement } from 'src/utils/feeInisghtUtil';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

interface Props {
  showFeesInsightModal: () => void;
  feeInsightData: [];
}

const FeerateStatement = (props: Props) => {
  const [shortFeeStatement, setShortFeeStatement] = useState('');
  const [arrowPointer, setArrowPointer] = useState('higher');
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { error, common } = translations;

  const { showFeesInsightModal, feeInsightData } = props;
  useEffect(() => {
    if (feeInsightData.length > 0) {
      updateFeeStatement(feeInsightData);
    }
  }, [feeInsightData]);

  function updateFeeStatement(data: any[]) {
    if (data.length === 0) {
      setShortFeeStatement(error.failedTofetchFeeStats);
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
    <TouchableOpacity
      onPress={showFeesInsightModal}
      style={styles.feeInsightContainer}
      testID="fee_insight"
    >
      <Box>
        <Box>
          <Text color={`${colorMode}.primaryText`} fontSize={16} medium>
            {common.feeSats}
          </Text>
        </Box>

        <Box style={styles.statementWrapper}>
          <Box style={styles.textWrapper}>
            {shortFeeStatement.includes('higher than usual') ||
            shortFeeStatement.includes('lower than usual') ? (
              <>
                <Text style={styles.highAlertSatsFee} color={`${colorMode}.modalWhiteContent`}>
                  {`Fees are `}
                </Text>
                <Box style={styles.arrowWrapper}>
                  {arrowPointer === 'lower' ? <ThemedSvg name={'btc_down_arrow'} /> : <BTC_UP />}
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
                <Text style={styles.highAlertSatsFee} color={`${colorMode}.modalWhiteContent`}>
                  {shortFeeStatement}
                </Text>

                {(shortFeeStatement.includes('low') || shortFeeStatement.includes('high')) && (
                  <Box style={styles.arrowWrapper}>
                    {arrowPointer === 'lower' ? <ThemedSvg name={'btc_down_arrow'} /> : <BTC_UP />}
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
