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
  showDot?: boolean;
};

function WalletInfoCard({
  walletName,
  walletDescription,
  icon,
  amount,
  tags,
  isShowAmount = false,
  setIsShowAmount,
  showDot = false,
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
              backgroundColor={index % 2 !== 0 ? null : `${colorMode}.SignleSigCardPillBackColor`}
              cardStyle={index % 2 !== 0 && styles.secondCard}
            />
          );
        })}
      </Box>
      <Box style={styles.detailContainer}>
        <HexagonIcon
          width={44}
          height={38}
          backgroundColor={Colors.DarkGreen}
          icon={icon}
          showDot={showDot}
        />
        <Box>
          <Text fontSize={12} color={`${colorMode}.buttonText`} numberOfLines={1}>
            {walletDescription}
          </Text>
          <Text color={`${colorMode}.buttonText`} medium style={{ fontSize: 14 }} numberOfLines={1}>
            {walletName}
          </Text>
        </Box>
        <TouchableOpacity
          style={styles.balance}
          testID="btn_currencyinfo"
          onPress={setIsShowAmount}
        >
          <CurrencyInfo
            amount={amount}
            hideAmounts={!isShowAmount}
            fontSize={24}
            color={colorMode === 'light' ? Colors.White : Colors.SecondaryWhite}
            variation="light"
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
    flexWrap: 'wrap',
  },
  detailContainer: {
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 20,
    marginLeft: 10,
  },
  secondCard: {
    maxWidth: wp(80),
  },
  balance: {
    height: hp(30),
  },
});

export default WalletInfoCard;
