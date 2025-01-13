import React from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet, ViewStyle } from 'react-native';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/tick_icon.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';

type SetupSignerOptionsProps = {
  name: string;
  icon: Element;
  isSelected?: boolean;
  onCardSelect?: (selected: any) => void;
  showSelection?: boolean;
  customStyle?: ViewStyle;
  disabled?: boolean;
  backgroundColor?: string;
  borderColor?: string;
};

function SetupSignerOptions({
  name,
  icon,
  isSelected,
  onCardSelect,
  showSelection = true,
  customStyle,
  disabled = false,
  backgroundColor,
  borderColor,
}: SetupSignerOptionsProps) {
  const { colorMode } = useColorMode();
  const cardBackgroundColor = backgroundColor || `${colorMode}.seashellWhite`;
  const cardStyle = [styles.cardContainer, disabled ? { opacity: 0.5 } : null, customStyle];
  const cardBorderColor = borderColor || `${colorMode}.dullGreyBorder`;

  const handlePress = () => {
    if (!disabled && onCardSelect) {
      onCardSelect(isSelected);
    }
  };

  return (
    <Pressable
      style={cardStyle}
      backgroundColor={cardBackgroundColor}
      onPress={handlePress}
      testID={`btn_${name}`}
      disabled={disabled}
      borderColor={cardBorderColor}
    >
      <Box style={styles.iconCheckboxContainer}>
        <Box style={styles.iconWrapper}>{icon}</Box>
        {showSelection && (
          <Box>
            {isSelected ? (
              <Checked width={wp(19)} height={wp(19)} />
            ) : (
              <Box style={styles.circle} borderColor={`${colorMode}.brownBackground`} />
            )}
          </Box>
        )}
      </Box>
      <Box style={styles.textContainer}>
        <Text style={styles.name} color={`${colorMode}.modalWhiteContent`} semiBold>
          {name}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: windowWidth / 2 - windowWidth * 0.05,
    padding: 10,
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
  },
  iconCheckboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: wp(34),
    height: wp(34),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: hp(10),
    marginLeft: wp(2.5),
  },
  name: {
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  circle: {
    width: wp(19),
    height: wp(19),
    borderRadius: wp(19) / 2,
    borderWidth: 1,
  },
});

export default SetupSignerOptions;
