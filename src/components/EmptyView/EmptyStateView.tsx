import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowHeight } from 'src/constants/responsive';

function EmptyStateView({
  IllustartionImage,
  title,
  subTitle = '',
}: {
  IllustartionImage: any;
  title: string;
  subTitle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <Box>
        <Text italic style={styles.noTransactionTitle} color={`${colorMode}.black`}>
          {title}
        </Text>
        {subTitle && (
          <Text italic style={styles.noTransactionSubTitle} color={`${colorMode}.black`}>
            {subTitle}
          </Text>
        )}
      </Box>
      {/* {windowHeight > 812 ? <IllustartionImage /> : <IllustartionImage height={100} />} */}
      <IllustartionImage />
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: windowHeight > 800 ? hp(20) : hp(12),
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 20,
  },
  noTransactionTitle: {
    fontSize: 14,
    letterSpacing: 0.6,
    opacity: 0.85,
    fontWeight: '400',
  },
  noTransactionSubTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    opacity: 0.85,
    fontWeight: '400',
    textAlign: 'center',
  },
});
export default EmptyStateView;
