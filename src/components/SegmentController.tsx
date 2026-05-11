import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import ThemedColor from './ThemedColor/ThemedColor';

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
  const HexagonIconBackGround = ThemedColor({ name: 'HexagonIcon' });
  const translateX = useRef(new Animated.Value(CONTAINER_PADDING)).current;
  const segmentWidth =
    length > 0 ? Math.max((containerWidth - 2 * CONTAINER_PADDING) / length, 0) : 0;

  const getTranslateX = (index: number) => CONTAINER_PADDING + index * segmentWidth;

  useEffect(() => {
    if (!segmentWidth) return;

    Animated.spring(translateX, {
      toValue: getTranslateX(selectedIndex),
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, segmentWidth, translateX]);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <Box
      style={styles.segmentedControl}
      backgroundColor={`${colorMode}.boxSecondaryBackground`}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.selectedBackground,
          { backgroundColor: HexagonIconBackGround },
          { width: segmentWidth },
          { transform: [{ translateX }] },
        ]}
      />
      {options.map((option, index) => (
        <Pressable key={index} onPress={() => handlePress(index)} style={styles.option}>
          <Text
            style={[styles.label, selectedIndex === index && { color: Colors.headerWhite }]}
            color={`${colorMode}.secondaryText`}
          >
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
    marginBottom: hp(8),
  },
  subLabel: {
    fontSize: 9,
    lineHeight: 9,
  },
});
