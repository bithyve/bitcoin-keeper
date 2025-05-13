import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import HexagonIcon from './HexagonIcon';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import { useSelector } from 'react-redux';

type EmptyCardProps = {
  name: string;
  callback?: any;
  cardStyles?: ViewStyle;
  iconWidth?: number;
  iconHeight?: number;
  loading?: boolean;
  description?: string;
  icon?: any;
  hexagonBackgroundColor?: any;
};

function DashedButton({
  name,
  callback,
  description,
  iconWidth = 40,
  iconHeight = 34,
  icon,
  hexagonBackgroundColor = Colors.headerWhite,
}: EmptyCardProps) {
  const { colorMode } = useColorMode();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const PrivateLightMode = themeMode === 'PRIVATE_LIGHT';
  return (
    <TouchableOpacity onPress={() => callback(name)}>
      <Box
        style={[styles.AddCardContainer]}
        borderColor={PrivateLightMode ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        testID={`btn_${name}`}
      >
        <HexagonIcon
          width={iconWidth}
          height={iconHeight}
          backgroundColor={hexagonBackgroundColor}
          icon={icon}
        />
        <Box style={styles.TextContainer}>
          {name && (
            <Text
              semiBold
              color={PrivateLightMode ? `${colorMode}.textBlack` : `${colorMode}.buttonText`}
            >
              {name}
            </Text>
          )}
          {description && (
            <Text
              style={styles.descriptionText}
              fontSize={12}
              color={PrivateLightMode ? `${colorMode}.textBlack` : `${colorMode}.buttonText`}
            >
              {description}
            </Text>
          )}
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: wp(320),
    padding: 10,
    minHeight: hp(70),
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameStyle: {
    fontSize: 12,
    fontWeight: '400',
  },

  detailContainer: {
    gap: 2,
    marginTop: 15,
  },
  TextContainer: {
    flex: 1,
  },
  descriptionText: {
    flexWrap: 'wrap',
    width: '100%',
  },
});

export default DashedButton;
