import { StyleSheet, View } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';
import Fonts from 'src/constants/Fonts';
import { Box, useColorMode } from 'native-base';
import BTC_DOWN from 'src/assets/images/btc_down.svg';
import BTC_UP from 'src/assets/images/btc_up.svg';

interface Props {
  line1: string;
  line2: string;
  suffix: string;
  stats: string | number;
  showArrow?: boolean;
  pointer?: string;
}

const FeeInsightCard = (props: Props) => {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.seashellWhite`}>
      <View style={styles.textWrapper}>
        {props.showArrow && (
          <View style={styles.arrowWrapper}>
            {props.pointer==='up'?<BTC_UP />:<BTC_DOWN />}
          </View>
        )}
        <Box>
          <Text style={styles.lineOneStyle}>{props.line1}</Text>
          <Text style={styles.lineOneStyle}>{props.line2}</Text>
        </Box>
      </View>
      <View style={styles.statsWrapper}>
        <Text>
          <Text style={styles.statsWrapper}>{props.stats}</Text>
          <Text style={styles.statStyle}>{props.suffix}</Text>
        </Text>
      </View>
    </Box>
  );
};

export default FeeInsightCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
  },
  lineOneStyle: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedMedium,
    lineHeight: 14,
  },
  statsWrapper: {
    marginTop: 5,
  },
  statStyle: {
    fontSize: 11,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
  statsSuffix: {
    fontSize: 11,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
  arrowWrapper: {
    width: 15,
    height: 20,
    paddingTop:2,
    paddingRight:2
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
