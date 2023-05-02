import React from 'react';
import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import Colors from 'src/theme/Colors';

function EmptyStateView({
  IllustartionImage,
  title,
  subTitle,
}: {
  IllustartionImage: any;
  title: string;
  subTitle: string;
}) {
  return (
    <Box style={styles.container}>
      {windowHeight > 812 ? <IllustartionImage /> : <IllustartionImage height={100} />}
      <Text italic style={styles.noTransactionTitle}>
        {title}
      </Text>
      <Text italic style={styles.noTransactionSubTitle}>
        {subTitle}
      </Text>
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: windowHeight > 800 ? hp(20) : hp(12),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  noTransactionTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    opacity: 0.85,
    fontWeight: '400',
    marginTop: hp(20),
    color: Colors.RichBlack,
  },
  noTransactionSubTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    opacity: 0.85,
    fontWeight: '400',
    textAlign: 'center',
    color: Colors.RichBlack,
  },
});
export default EmptyStateView;
