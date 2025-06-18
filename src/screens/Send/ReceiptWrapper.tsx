import React, { useContext, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ReceiptWrapper = ({
  children,
  itemContainerStyle = {},
  showThemedSvg = false,
  toggleVisibilityButton = false,
  setShowMore,
  showMore,
}) => {
  const { colorMode } = useColorMode();
  const [expanded, setExpanded] = useState(!toggleVisibilityButton);
  const validChildren = React.Children.toArray(children).filter(Boolean);
  const itemCount = validChildren.length;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <Box
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.dullGreyBorder`}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {validChildren.map((child, index) => {
          const isFirst = index === 0 && showThemedSvg;

          return (
            <View key={index}>
              <Box
                style={[styles.item, isFirst && styles.firstItem, itemContainerStyle]}
                borderColor={`${colorMode}.dullGreyBorder`}
                borderBottomWidth={!isFirst && index !== itemCount - 1 ? 1 : 0}
              >
                {child}

                {isFirst && (
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

        {toggleVisibilityButton && (
          <TouchableOpacity
            onPress={() => {
              setExpanded(!expanded);
              setShowMore(!showMore);
            }}
            style={[styles.toggleButton]}
          >
            <Box
              style={styles.toggleButtonBackground}
              borderColor={`${colorMode}.separator`}
              backgroundColor={`${colorMode}.primaryBackground`}
            >
              <Text style={styles.toggleButtonText} color={`${colorMode}.textGreen`} medium>
                {expanded ? common.lessInfo : common.moreInfo}
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    borderWidth: 1,
    borderRadius: 20,
  },
  innerContainer: {
    overflow: 'visible',
    paddingBottom: hp(20),
    position: 'relative',
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
  toggleButton: {
    position: 'absolute',
    bottom: -hp(12),
    left: '50%',
    transform: [{ translateX: -wp(50) }],
    zIndex: 10,
  },
  toggleButtonText: {
    fontSize: 11,
  },
  toggleButtonBackground: {
    borderWidth: 1,
    paddingHorizontal: wp(20),
    paddingVertical: hp(4),
    borderRadius: 999,
  },
});

export default ReceiptWrapper;
