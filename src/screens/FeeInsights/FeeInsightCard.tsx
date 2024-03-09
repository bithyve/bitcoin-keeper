import { StyleSheet, View } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';
import Fonts from 'src/constants/Fonts';
import { Box, useColorMode } from 'native-base';


interface Props{
  line1: string;
  line2: string;
  suffix: string;
  stats:  string | number;
  showArrow?: boolean;
  pointer?: string;
}

const FeeInsightCard = (props:Props) => {
const { colorMode } = useColorMode();
  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.seashellWhite`}>
      <Text style={styles.lineOneStyle}>{props.line1}</Text>
      <Text style={styles.lineOneStyle}>{props.line2}</Text>
      <View style={styles.statsWrapper}>
        <Text style={styles.statStyle}>{props.stats}<Text style={styles.statsSuffix}>{props.suffix}</Text></Text>
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
    lineHeight:14
  },
  statsWrapper: {
    marginTop:5
  },
  statStyle: {
    fontSize: 11,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
  statsSuffix: {
    fontSize: 10,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
});
