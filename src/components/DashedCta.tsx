import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import HexagonIcon from './HexagonIcon';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';

type DashedButtonProps = {
  name: string;
  callback?: (name: string) => void;
  cardStyles?: ViewStyle;
  iconWidth?: number;
  iconHeight?: number;
  loading?: boolean;
  description?: string;
  icon?: any;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  arrowIcon?: any;
};

function DashedCta({
  name,
  callback = () => {},
  description,
  iconWidth = 40,
  iconHeight = 34,
  icon,
  cardStyles,
  backgroundColor,
  borderColor,
  textColor,
  arrowIcon,
}: DashedButtonProps) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const defaultBackgroundColor = `${colorMode}.DashedCtaBackground`;
  const defaultTextColor = `${colorMode}.dashedButtonContent`;
  const defaultBorderColor = borderColor ? borderColor : `${colorMode}.pantoneGreen`;

  return (
    <TouchableOpacity onPress={() => callback(name)}>
      <Box
        style={[styles.AddCardContainer, cardStyles]}
        backgroundColor={backgroundColor || defaultBackgroundColor}
        borderColor={defaultBorderColor}
      >
        {icon && (
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={Colors.White}
            icon={icon}
          />
        )}
        <Box>
          {name && (
            <Text semiBold color={textColor || defaultTextColor} fontSize={18}>
              {name}
            </Text>
          )}
          {description && <Text color={textColor || defaultTextColor}>{description}</Text>}
        </Box>
        <Box>{arrowIcon && (isDarkMode ? <RightArrowWhite /> : <RightArrow />)}</Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: wp(320),
    padding: 20,
    height: hp(80),
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});

export default DashedCta;
