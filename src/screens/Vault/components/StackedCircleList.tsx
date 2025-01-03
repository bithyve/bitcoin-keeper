import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

interface StackedCirclesListProps {
  items: { Icon: Element; backgroundColor?: any }[];
  width?: number;
  height?: number;
  itemDistance?: number;
  borderColor?: string;
  reverse?: boolean;
}

const StackedCirclesList: React.FC<StackedCirclesListProps> = ({
  items,
  width = wp(20),
  height = wp(20),
  itemDistance = wp(-8),
  borderColor,
  reverse = false,
}) => {
  const { colorMode } = useColorMode();
  const totalItems = items.length;
  const maxVisible = 4;

  const zIndexModifier = reverse ? (index: number) => index : (index: number) => totalItems - index;

  return (
    <Box style={styles.container}>
      {items.slice(0, maxVisible).map((item, index) => (
        <Box
          key={index}
          left={index * itemDistance}
          backgroundColor={item.backgroundColor || `${colorMode}.dullGreyBorder`}
          borderColor={borderColor || `${colorMode}.dullGreyBorder`}
          style={[
            styles.itemContainer,
            {
              zIndex: zIndexModifier(index),
              width: width,
              height: height,
            },
          ]}
        >
          <Box style={styles.iconContainer}>{item.Icon}</Box>
        </Box>
      ))}

      {totalItems > maxVisible && (
        <Box
          left={maxVisible * wp(-8)}
          backgroundColor={`${colorMode}.pantoneGreen`}
          borderColor={`${colorMode}.dullGreyBorder`}
          style={[styles.itemContainer, { width: width, height: height }]}
        >
          <Text medium style={styles.countText} color={`${colorMode}.modalGreenContent`}>
            +{totalItems - maxVisible}
          </Text>
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainer: {
    borderWidth: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    marginLeft: wp(5),
    fontSize: 10,
    textAlign: 'right',
  },
});

export default StackedCirclesList;
