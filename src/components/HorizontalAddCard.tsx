import React from 'react';
import { Box, useColorMode } from 'native-base';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AddCardIcon from 'src/assets/images/add_white.svg';
import Colors from 'src/theme/Colors';
import Text from './KeeperText';
import HexagonIcon from './HexagonIcon';
import { hp, wp } from 'src/constants/responsive';

type AddSignerCardProps = {
  name: string;
  callback?: (param: any) => void;
  cardStyles?: ViewStyle;
  iconWidth?: number;
  iconHeight?: number;
  loading?: boolean;
  borderColor?: string;
  nameColor?: string;
  icon?: any;
  isAddWallet?: boolean;
};

function HorizontalAddCard({
  name,
  callback,
  cardStyles,
  iconWidth = 40,
  iconHeight = 34,
  loading = false,
  borderColor,
  nameColor,
  isAddWallet,
  icon = <AddCardIcon width={wp(11)} height={hp(11)} />,
}: AddSignerCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      testID={isAddWallet ? 'btn_add_wallet' : `btn_${name}`}
      activeOpacity={0.95}
      onPress={() => callback(name)}
    >
      <Box
        backgroundColor={`${colorMode}.overlayGreen`}
        borderColor={borderColor ? borderColor : `${colorMode}.pantoneGreen`}
        style={[styles.AddCardContainer, cardStyles && cardStyles]}
      >
        <Box style={styles.detailContainer}>
          <Text semiBold color={nameColor || `${colorMode}.black`} style={styles.nameStyle}>
            {name}
          </Text>
          {loading ? <ActivityIndicator /> : null}
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={Colors.pantoneGreen}
            icon={icon}
            style={styles.iconStyle}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: '100%',
    padding: 20,
    paddingHorizontal: wp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  nameStyle: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'left',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconStyle: {
    marginLeft: 'auto',
  },
});

export default HorizontalAddCard;
