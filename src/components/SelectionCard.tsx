import React from 'react';
import { Box, useColorMode } from 'native-base';
import { Pressable, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import Checked from 'src/assets/images/check-white.svg';

interface SelectionCardProps {
  id: number;
  title: string;
  subtitle: string;
  isSelected: boolean;
  callback?: () => void;
  setSelectedOption: React.Dispatch<React.SetStateAction<any>>;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  id,
  title,
  subtitle,
  isSelected,
  callback,
  setSelectedOption,
}) => {
  const { colorMode } = useColorMode();

  const handlePress = () => {
    setSelectedOption({ id, title, subtitle, callback });
  };

  return (
    <Pressable onPress={handlePress}>
      <Box
        style={styles.container}
        borderColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.dullGreyBorder`}
        backgroundColor={isSelected ? `${colorMode}.thirdBackground` : `${colorMode}.seashellWhite`}
        borderWidth={isSelected ? 2 : 1}
      >
        <Box style={styles.contentContainer}>
          <Box style={styles.textContainer}>
            <Text
              color={isSelected ? `${colorMode}.modalWhiteButtonText` : `${colorMode}.primaryText`}
              fontSize={14}
              numberOfLines={1}
              medium
            >
              {title}
            </Text>
            <Text
              color={
                isSelected ? `${colorMode}.modalWhiteButtonText` : `${colorMode}.secondaryText`
              }
              fontSize={11}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </Box>
          <Box
            style={styles.circle}
            borderColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.dullGreyBorder`}
            backgroundColor={
              isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.seashellWhite`
            }
          >
            {isSelected && <Checked />}
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    minHeight: hp(72),
    borderRadius: 12,
    padding: wp(16),
  },
  contentContainer: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '90%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    right: 0,
    width: wp(16),
    height: wp(16),
    borderWidth: 1,
    borderRadius: 30 / 2,
  },
});

export default SelectionCard;
