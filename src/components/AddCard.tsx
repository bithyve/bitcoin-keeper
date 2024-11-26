import React from 'react';
import { Box, useColorMode } from 'native-base';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AddCardIcon from 'src/assets/images/add_white.svg';
import Colors from 'src/theme/Colors';
import Text from './KeeperText';
import HexagonIcon from './HexagonIcon';

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

function AddCard({
  name,
  callback,
  cardStyles,
  iconWidth = 40,
  iconHeight = 34,
  loading = false,
  borderColor,
  nameColor,
  isAddWallet,
  icon = <AddCardIcon />,
}: AddSignerCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      testID={isAddWallet ? 'btn_add_wallet' : `btn_${name}`}
      activeOpacity={0.95}
      onPress={() => callback(name)}
    >
      <Box
        backgroundColor={`${colorMode}.pantoneGreenLight`}
        borderColor={borderColor ? borderColor : `${colorMode}.pantoneGreen`}
        style={[styles.AddCardContainer, cardStyles && cardStyles]}
      >
        <Box style={styles.detailContainer}>
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={Colors.pantoneGreen}
            icon={icon}
          />
          <Text semiBold color={nameColor} style={styles.nameStyle}>
            {name}
          </Text>
          {loading ? <ActivityIndicator /> : null}
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: 114,
    padding: 10,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  nameStyle: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },

  detailContainer: {
    gap: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddCard;
