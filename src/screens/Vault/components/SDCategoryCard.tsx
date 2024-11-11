import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import { hp, wp } from 'src/constants/responsive';

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
          <Text style={styles.title} color={`${colorMode}.primaryText`}>
            {title}
          </Text>
          <Text style={styles.description} color={`${colorMode}.secondarySubtitle`}>
            {description}
          </Text>
        </Box>
        <Box>{isDarkMode ? <RightArrowWhite /> : <RightArrow />}</Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(95),
    paddingVertical: hp(16),
    paddingHorizontal: wp(22),
    borderRadius: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: wp(30),
    marginRight: wp(21),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: -5,
  },
  title: {
    fontSize: 15,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
});

export default SDCategoryCard;
