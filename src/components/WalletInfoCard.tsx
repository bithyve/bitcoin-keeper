import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet } from 'react-native';
import CardPill from './CardPill';
import CurrencyInfo from 'src/screens/HomeScreen/components/CurrencyInfo';
import { useAppSelector } from 'src/store/hooks';

type WalletInfoCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  amount: number;
};

function WalletInfoCard({ walletName, walletDescription, icon, amount }: WalletInfoCardProps) {
  const { colorMode } = useColorMode();
  const { satsEnabled } = useAppSelector((state) => state.settings);

  return (
    <Box backgroundColor={`${colorMode}.pantoneGreen`} style={styles.walletContainer}>
      <Box style={styles.pillsContainer}>
        <CardPill heading="SINGLE SIG" cardStyles={{ backgroundColor: 'white' }} />
        <CardPill heading="WHAT HERE?" />
      </Box>
      <Box style={styles.detailContainer}>
        <Box style={styles.iconWrapper}>{icon}</Box>
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
    backgroundColor: 'rgba(9, 44, 39, 0.5)',
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
