import { Box, Pressable, useColorMode } from 'native-base';
import React, { StyleSheet } from 'react-native';
import Text from './KeeperText';
import { hp, wp } from 'src/constants/responsive';

type MenuCardProps = {
  id: number;
  title: string;
  description?: string;
  icon: Element;
  selectedIcon: Element;
  selectedCard: number;
  onCardSelect: (cardName: number) => void;
  numberOfLines?: number;
  isFirst: boolean;
  isLast: boolean;
};

function MenuCard({
  id,
  title,
  description,
  icon,
  selectedIcon,
  selectedCard,
  onCardSelect,
  numberOfLines = 1,
  isFirst,
  isLast,
}: MenuCardProps) {
  const { colorMode } = useColorMode();
  const isSelected = selectedCard === id;

  return (
    <Pressable testID={`btn_${title}`} onPress={() => onCardSelect(id)}>
      <Box
        backgroundColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.seashellWhite`}
        style={[styles.menuCardContainer, isFirst && styles.firstCard, isLast && styles.lastCard]}
        borderWidth={1}
        borderColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.dullGreyBorder`}
      >
        <Box style={styles.detailContainer}>
          <Box
            backgroundColor={
              isSelected ? `${colorMode}.seashellWhiteText` : `${colorMode}.secondaryGrey`
            }
            style={styles.circle}
          >
            {isSelected ? selectedIcon : icon}
          </Box>
          <Box>
            <Text
              color={isSelected ? `${colorMode}.buttonText` : `${colorMode}.menuCardTitleColor`}
              numberOfLines={numberOfLines}
              style={styles.title}
              medium
            >
              {title}
            </Text>
            <Text
              color={isSelected ? `${colorMode}.buttonText` : `${colorMode}.menuCardTitleColor`}
              fontSize={10}
              numberOfLines={2}
              style={styles.description}
            >
              {description}
            </Text>
          </Box>
        </Box>
      </Box>
      {isSelected && (
        <Box
          borderColor={`${colorMode}.pantoneGreen`}
          backgroundColor={`${colorMode}.pantoneGreen`}
          style={styles.arrow}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuCardContainer: {
    height: hp(115),
    width: wp(114),
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: wp(10),
    paddingTop: hp(32),
  },
  arrow: {
    zIndex: -1,
    width: 20,
    height: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    top: -12,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],

    alignSelf: 'flex-end',
    marginRight: 13,
  },
  title: {
    fontSize: 12,
    lineHeight: 17,
  },
  description: {
    lineHeight: 17,
  },
  firstCard: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  lastCard: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default MenuCard;
