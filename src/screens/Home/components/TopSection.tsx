import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import { hp } from 'src/constants/responsive';
import HeaderDetails from '../components/HeaderDetails';

export function TopSection({ colorMode, top }) {
  return (
    <Box
      backgroundColor={`${colorMode}.primaryGreenBackground`}
      style={[styles.wrapper, { paddingTop: top }]}
    >
      <Box width="90%" style={styles.padding}>
        <HeaderDetails />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 10,
  },
  wrapper: {
    flex: 0.15,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    position: 'absolute',
    top: hp(230),
  },
  actionCard: { justifyContent: 'flex-end' },
});
