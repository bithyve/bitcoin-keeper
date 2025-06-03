import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

const ReceiptWrapper = ({ children, itemContainerStyle = {}, showThemedSvg = false }) => {
  const { colorMode } = useColorMode();
  const itemCount = React.Children.count(children);

  return (
    <Box
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.dullGreyBorder`}
      style={styles.container}
    >
      {React.Children.map(children, (child, index) => {
        const isFirst = index === 0 && showThemedSvg;

        return (
          <View key={index}>
            <Box
              style={[styles.item, isFirst && styles.firstItem, itemContainerStyle]}
              borderColor={`${colorMode}.dullGreyBorder`}
              borderBottomWidth={!isFirst && index !== itemCount - 1 ? 1 : 0}
            >
              {child}

              {isFirst && showThemedSvg && (
                <View style={styles.borderWithSvgContainer}>
                  <Box style={styles.lineLeft} borderColor={`${colorMode}.dullGreyBorder`} />
                  <ThemedSvg name={'triple_arrow'} />
                  <Box style={styles.lineRight} borderColor={`${colorMode}.dullGreyBorder`} />
                </View>
              )}
            </Box>
          </View>
        );
      })}
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
    position: 'relative',
  },
  firstItem: {
    paddingTop: hp(18),
    paddingBottom: hp(25),
  },
  borderWithSvgContainer: {
    position: 'absolute',
    bottom: 0,
    left: wp(18),
    width: '100%',
    height: hp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineLeft: {
    borderWidth: 1,
    flex: 1,
    marginRight: wp(8),
  },
  lineRight: {
    flex: 1,
    borderWidth: 1,
    marginLeft: wp(8),
  },
});

export default ReceiptWrapper;
