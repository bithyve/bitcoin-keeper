import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import CurrencyInfo from 'src/screens/HomeScreen/components/CurrencyInfo';
import { useAppSelector } from 'src/store/hooks';
import CardPill from './CardPill';
import Text from './KeeperText';

type WalletInfoCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  amount: number;
  tags: string[];
};

function WalletInfoCard({
  walletName,
  walletDescription,
  icon,
  amount,
  tags,
}: WalletInfoCardProps) {
  const { colorMode } = useColorMode();
  const { satsEnabled } = useAppSelector((state) => state.settings);

  return (
    <Box backgroundColor={`${colorMode}.pantoneGreen`} style={styles.walletContainer}>
      <Box style={styles.pillsContainer}>
        {tags.map((tag, index) => {
          return (
            <CardPill
              key={tag}
              heading={tag}
              cardStyles={index % 2 === 0 ? null : { backgroundColor: 'white' }}
            />
          );
        })}
      </Box>
      <Box style={styles.detailContainer}>
        <Box backgroundColor={`${colorMode}.textBlack`} style={styles.iconWrapper}>
          {icon}
        </Box>
        <Box>
          <Text color={`${colorMode}.white`} numberOfLines={1}>
            {walletDescription}
          </Text>
          <Text color={`${colorMode}.white`} bold style={{ fontSize: 14 }} numberOfLines={1}>
            {walletName}
          </Text>
        </Box>
        <CurrencyInfo
          hideAmounts={false}
          amount={amount}
          fontSize={satsEnabled ? 17 : 20}
          color={`${colorMode}.white`}
          variation={colorMode === 'light' ? 'light' : 'dark'}
        />
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
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContainer: {
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 20,
    marginLeft: 10,
  },
});

export default WalletInfoCard;
