import React from 'react';
import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';

function EmptyStateView({ IllustartionImage, title }: { IllustartionImage: any; title: string }) {
  return (
    <Box style={styles.container}>
      <IllustartionImage />
      <Text style={styles.noTransactionText}>{title}</Text>
      <Text></Text>
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: windowHeight > 800 ? hp(20) : 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  noTransactionText: {
    fontSize: 12,
    letterSpacing: 0.6,
    opacity: 0.85,
    fontWeight: '300',
  },
});
export default EmptyStateView;
