import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';

const DetailsWrapper = ({ children, itemContainerStyle = {} }) => {
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
          style={[
            styles.item,
            index === 0 && styles.firstItem,
            index === itemCount - 1 && styles.lastItem,
            itemContainerStyle,
          ]}
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
    borderRadius: 10,
  },
  item: {
    paddingHorizontal: wp(23),
    paddingTop: hp(10),
    paddingBottom: hp(6),
  },
  firstItem: {
    paddingTop: hp(18),
    paddingBottom: hp(10),
  },
  lastItem: {
    paddingTop: hp(10),
    paddingBottom: hp(18),
  },
});

export default DetailsWrapper;
