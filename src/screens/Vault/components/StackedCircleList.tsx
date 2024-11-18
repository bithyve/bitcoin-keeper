import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

interface StackedCirclesListProps {
  items: { Icon: Element; backgroundColor: any }[];
}

const StackedCirclesList: React.FC<StackedCirclesListProps> = ({ items }) => {
  const { colorMode } = useColorMode();

  const totalItems = items.length;
  const maxVisible = 4;

  return (
    <Box style={styles.container}>
      {items.slice(0, maxVisible).map((item, index) => (
        <Box
          key={index}
          left={index * wp(-8)}
          backgroundColor={item.backgroundColor || `${colorMode}.dullGreyBorder`}
          borderColor={`${colorMode}.dullGreyBorder`}
          style={[
            styles.itemContainer,
            {
              zIndex: totalItems - index,
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
          style={styles.itemContainer}
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
    width: wp(20),
    height: wp(20),
  },
  iconContainer: {
    width: wp(30),
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
