import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';

const ReceiptWrapper = ({ children, itemContainerStyle = {} }) => {
  const { colorMode } = useColorMode();
  const itemCount = React.Children.count(children);

  return (
    <Box
      backgroundColor={`${colorMode}.receiptBackground`}
      borderColor={`${colorMode}.receiptBorder`}
      style={styles.container}
    >
      {React.Children.map(children, (child, index) => (
        <Box
          style={[styles.item, index === 0 && styles.firstItem, itemContainerStyle]}
          borderColor={`${colorMode}.receiptBorder`}
          borderBottomWidth={index !== itemCount - 1 ? 1 : 0}
          key={index}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
  },
  item: {
    paddingHorizontal: wp(18),
    paddingTop: hp(15),
    paddingBottom: hp(15),
  },
  firstItem: {
    paddingTop: hp(18),
    paddingBottom: hp(15),
  },
});

export default ReceiptWrapper;
