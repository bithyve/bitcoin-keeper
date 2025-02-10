import React from 'react';
import { Box, useColorMode } from 'native-base';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AddCardIcon from 'src/assets/images/add_white.svg';
import Colors from 'src/theme/Colors';
import Text from './KeeperText';
import HexagonIcon from './HexagonIcon';
import EmptyCardBg from 'src/assets/images/emptyWallet.svg';

type EmptyCardProps = {
  name: string;
  callback?: (param: any) => void;
  cardStyles?: ViewStyle;
  iconWidth?: number;
  iconHeight?: number;
  loading?: boolean;
};

function EmptyCard({
  name,
  callback,
  cardStyles,
  iconWidth = 40,
  iconHeight = 34,
  loading = false,
}: EmptyCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={() => callback(name)}>
      <Box
        backgroundColor={`${colorMode}.pantoneGreenLight`}
        borderColor={`${colorMode}.pantoneGreen`}
        style={[styles.AddCardContainer]}
        testID={`btn_${name}`}
      >
        <Box>
          <EmptyCardBg />
        </Box>

        {/* <Box style={styles.detailContainer}>
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={Colors.pantoneGreen}
            icon={<AddCardIcon />}
          />
          <Text color={`${colorMode}.SlateGrey`} style={styles.nameStyle}>
            {name}
          </Text>
          {loading ? <ActivityIndicator /> : null}
        </Box> */}
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: 114,
    backgroundColor: 'pink',
    padding: 10,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  nameStyle: {
    fontSize: 12,
    fontWeight: '400',
  },

  detailContainer: {
    gap: 2,
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

export default EmptyCard;
