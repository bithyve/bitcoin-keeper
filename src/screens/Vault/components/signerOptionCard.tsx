import React from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet, ViewStyle } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';

type SignerOptionCardProps = {
  name: string;
  icon: React.ReactElement;
  isSelected?: boolean;
  onCardSelect?: (selected: any) => void;
  showSelection?: boolean;
  customStyle?: ViewStyle;
  disabled?: boolean;
  backgroundColor?: string;
  borderColor?: string;
};

function SignerOptionCard({
  name,
  icon,
  isSelected,
  onCardSelect,
  customStyle,
  disabled = false,
  backgroundColor,
  borderColor,
}: SignerOptionCardProps) {
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
      {icon}
      <Box style={styles.textContainer}>
        <Text style={styles.name} color={`${colorMode}.modalWhiteContent`} medium>
          {name}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: windowWidth * 0.87,
    paddingVertical: hp(17),
    paddingHorizontal: wp(20),
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    gap: wp(15),
  },
  iconCheckboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default SignerOptionCard;
