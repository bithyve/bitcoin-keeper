import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CardPill from 'src/components/CardPill';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';
import HexagonIcon from 'src/components/HexagonIcon';
import { hp, wp } from 'src/constants/responsive';

type WalletInfoCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  amount: number;
  tags: string[];
  isShowAmount: boolean;
  setIsShowAmount: () => void;
};

function WalletInfoCard({
  walletName,
  walletDescription,
  icon,
  amount,
  tags,
  isShowAmount = false,
  setIsShowAmount,
}: WalletInfoCardProps) {
  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={`${colorMode}.pantoneGreen`} style={styles.walletContainer}>
      <Box style={styles.pillsContainer}>
        {tags?.map((tag, index) => {
          return (
            <CardPill
              key={tag}
              heading={tag}
              backgroundColor={index % 2 !== 0 ? null : `${colorMode}.PaleTurquoise`}
            />
          );
        })}
      </Box>
      <Box style={styles.detailContainer}>
        <HexagonIcon width={44} height={38} backgroundColor={Colors.DarkGreen} icon={icon} />
        <Box>
          <Text fontSize={12} color={`${colorMode}.white`} numberOfLines={1}>
            {walletDescription}
          </Text>
          <Text color={`${colorMode}.white`} bold style={{ fontSize: 14 }} numberOfLines={1}>
            {walletName}
          </Text>
        </Box>
        <TouchableOpacity onPress={setIsShowAmount}>
          <CurrencyInfo
            amount={amount}
            hideAmounts={!isShowAmount}
            fontSize={24}
            color={colorMode === 'light' ? Colors.RichBlackDark : Colors.RichBlack}
            variation={colorMode === 'light' ? 'light' : 'dark'}
          />
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: wp(160),
    height: hp(260),
    padding: 10,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
  },
  detailContainer: {
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 20,
    marginLeft: 10,
  },
});

export default WalletInfoCard;
