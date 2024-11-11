import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';

interface SDCategoryCardProps {
  title: string;
  description: string;
  Icon: Element;
  onPress: () => void;
}

const SDCategoryCard: React.FC<SDCategoryCardProps> = ({ title, description, Icon, onPress }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Pressable onPress={onPress}>
      <Box
        style={styles.card}
        backgroundColor={`${colorMode}.secondaryBackground`}
        borderColor={`${colorMode}.dullGreyBorder`}
      >
        <Box style={styles.iconContainer}>{Icon}</Box>

        <Box style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </Box>

        <Box style={styles.arrowContainer}>{isDarkMode ? <RightArrowWhite /> : <RightArrow />}</Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 95,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 16,
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  arrowContainer: {
    marginLeft: 16,
  },
});

export default SDCategoryCard;
