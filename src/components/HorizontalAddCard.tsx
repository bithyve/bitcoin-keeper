import React from 'react';
import { Box, useColorMode } from 'native-base';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AddCardIcon from 'src/assets/images/add_white.svg';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import HexagonIcon from './HexagonIcon';
import { useSelector } from 'react-redux';

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
  KeyIcon?: any;
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
  KeyIcon,
  icon = <AddCardIcon width={wp(11)} height={hp(11)} />,
}: AddSignerCardProps) {
  const { colorMode } = useColorMode();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  return (
    <TouchableOpacity
      testID={isAddWallet ? 'btn_add_wallet' : `btn_${name}`}
      activeOpacity={0.95}
      onPress={() => callback(name)}
    >
      <Box
        backgroundColor={`${colorMode}.overlayGreen`}
        borderColor={borderColor || `${colorMode}.pantoneGreen`}
        style={[styles.AddCardContainer, cardStyles && cardStyles]}
      >
        <Box style={styles.detailContainer}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {KeyIcon ? <KeyIcon /> : null}
            <Text medium color={nameColor || `${colorMode}.secondaryText`} style={styles.nameStyle}>
              {name}
            </Text>
          </Box>
          {loading ? <ActivityIndicator /> : null}
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={privateTheme ? Colors.goldenGradient : Colors.primaryGreen}
            icon={icon}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: '100%',
    padding: wp(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  nameStyle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default HorizontalAddCard;
