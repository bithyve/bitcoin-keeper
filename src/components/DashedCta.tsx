import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import HexagonIcon from './HexagonIcon';
import Colors from 'src/theme/Colors';
import { hp } from 'src/constants/responsive';
import Text from './KeeperText';
import RightArrow from 'src/assets/images/icon_arrow.svg';
import RightArrowWhite from 'src/assets/images/icon_arrow_white.svg';

type DashedButtonProps = {
  name: string;
  callback?: (name: string) => void;
  cardStyles?: ViewStyle;
  iconWidth?: number;
  customStyle?: ViewStyle;
  iconHeight?: number;
  loading?: boolean;
  description?: string;
  icon?: any;
  backgroundColor?: string;
  hexagonBackgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  titleSize?: number;
  arrowIcon?: any;
  textPosition?: 'center' | 'left';
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
  customStyle,
  hexagonBackgroundColor,
  borderColor,
  textColor,
  arrowIcon,
  textPosition = 'center',
  titleSize = 14,
}: DashedButtonProps) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const defaultBackgroundColor = `${colorMode}.DashedCtaBackground`;
  const defaultTextColor = `${colorMode}.buttonText`;
  const defaultBorderColor = borderColor ? borderColor : `${colorMode}.pantoneGreen`;
  const defaultHexagonBackgroundColor = Colors.headerWhite;

  return (
    <TouchableOpacity onPress={() => callback(name)}>
      <Box
        style={[customStyle ? customStyle : styles.AddCardContainer, cardStyles]}
        backgroundColor={backgroundColor || defaultBackgroundColor}
        borderColor={defaultBorderColor}
        testID={`btn_${name}`}
      >
        {icon && (
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={hexagonBackgroundColor || defaultHexagonBackgroundColor}
            icon={icon}
          />
        )}
        <Box style={[textPosition === 'center' ? styles.textCenter : styles.textLeft]}>
          {name && (
            <Text semiBold color={textColor || defaultTextColor} fontSize={titleSize}>
              {name}
            </Text>
          )}
          {description && (
            <Text color={textColor || defaultTextColor} fontSize={13} style={{ marginTop: hp(4) }}>
              {description}
            </Text>
          )}
        </Box>
        <Box>{arrowIcon && (isDarkMode ? <RightArrowWhite /> : <RightArrow />)}</Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    minHeight: hp(50),
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  textCenter: {
    alignItems: 'center',
  },
  textLeft: {
    alignItems: 'flex-start',
  },
});

export default DashedCta;
