import { Box, useColorMode } from 'native-base';
import React, { useState } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

const CONTAINER_PADDING = 2;

type SegmentedControllerProps = {
  options: { label: string; sub: string }[];
  selectedIndex: number;
  setSelectedIndex: (val: number) => void;
};

export const SegmentedController = ({
  options,
  selectedIndex,
  setSelectedIndex,
}: SegmentedControllerProps) => {
  const length = options.length;
  const { colorMode } = useColorMode();
  const [containerWidth, setContainerWidth] = useState(0);
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE' || themeMode === 'PRIVATE_LIGHT';
  const translateX = new Animated.Value(
    selectedIndex != 0
      ? selectedIndex * ((containerWidth - 2 * CONTAINER_PADDING) / length)
      : CONTAINER_PADDING
  );

  const handlePress = (index) => {
    setSelectedIndex(index);
    Animated.spring(translateX, {
      toValue:
        index != 0
          ? index * ((containerWidth - 2 * CONTAINER_PADDING) / length)
          : CONTAINER_PADDING,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Box
      style={styles.segmentedControl}
      backgroundColor={`${colorMode}.boxSecondaryBackground`}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.selectedBackground,
          { backgroundColor: privateTheme ? Colors.goldenGradient : Colors.primaryGreen },
          { width: (containerWidth - 2 * CONTAINER_PADDING) / length },
          { transform: [{ translateX }] },
        ]}
      />
      {options.map((option, index) => (
        <Pressable key={index} onPress={() => handlePress(index)} style={styles.option}>
          <Text style={[styles.label, selectedIndex === index && { color: Colors.headerWhite }]}>
            {option.label}
          </Text>
          <Text
            style={[styles.subLabel, selectedIndex === index && { color: Colors.bodyText }]}
            color={`${colorMode}.secondaryText`}
          >
            ({option.sub})
          </Text>
        </Pressable>
      ))}
    </Box>
  );
};

const styles = StyleSheet.create({
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 7,
    padding: CONTAINER_PADDING,
    position: 'relative',
    alignItems: 'center',
  },
  selectedBackground: {
    position: 'absolute',
    height: '100%',
    borderRadius: 7,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(9),
  },
  label: {
    fontSize: 13,
    lineHeight: 13,
    marginBottom: hp(8),
  },
  subLabel: {
    fontSize: 9,
    lineHeight: 9,
  },
});
