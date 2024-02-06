import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CardPill from 'src/components/CardPill';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import { useAppSelector } from 'src/store/hooks';
import Colors from 'src/theme/Colors';
import HexagonIcon from 'src/components/HexagonIcon';

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
  const { satsEnabled } = useAppSelector((state) => state.settings);

  return (
    <Box backgroundColor={`${colorMode}.pantoneGreen`} style={styles.walletContainer}>
      <Box style={styles.pillsContainer}>
        {tags?.map((tag, index) => {
          return (
            <CardPill
              key={tag}
              heading={tag}
              backgroundColor={index % 2 === 0 ? `${colorMode}.PaleTurquoise` : null}
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
            hideAmounts={false}
            amount={isShowAmount ? amount : '****'}
            fontSize={satsEnabled ? 17 : 20}
            color={`${colorMode}.white`}
            variation={colorMode === 'light' ? 'light' : 'dark'}
          />
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: 160,
    height: 260,
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
