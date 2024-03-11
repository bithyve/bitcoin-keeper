import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import HexagonIcon from './HexagonIcon';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';

type EmptyCardProps = {
  name: string;
  callback?: (param: any) => void;
  cardStyles?: ViewStyle;
  iconWidth?: number;
  iconHeight?: number;
  loading?: boolean;
  description?: string;
  icon?: any;
};

function DashedButton({
  name,
  callback,
  description,
  iconWidth = 40,
  iconHeight = 34,
  icon,
}: EmptyCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={() => callback(name)}>
      <Box style={[styles.AddCardContainer]}>
        <HexagonIcon
          width={iconWidth}
          height={iconHeight}
          backgroundColor={Colors.White}
          icon={icon}
        />
        <Box>
          <Text color={`${colorMode}.choosePlanHome`}>{name}</Text>
          <Text color={`${colorMode}.choosePlanHome`}>{description}</Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: wp(320),
    padding: 10,
    height: hp(70),
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.White,
    backgroundColor: Colors.lightGreen,
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
});

export default DashedButton;
