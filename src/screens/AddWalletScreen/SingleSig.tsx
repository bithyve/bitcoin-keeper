import { Box, ScrollView, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import WalletCard from 'src/components/WalletCard';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletDark from 'src/assets/images/walletDark.svg';
import { StyleSheet } from 'react-native';

type Props = {
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

const dummyData = [
  {
    walletName: 'Hot Wallet',
    walletDescription: "App's mobile key",
  },
  {
    walletName: 'Watch Only',
    walletDescription: 'Use external xPub',
  },
  {
    walletName: 'Import',
    walletDescription: 'Import External wallet',
  },
];

function SingleSig({ selectedCard, onCardSelect }: Props) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <Text>Single Sig</Text>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={styles.cardContainer}
      >
        {dummyData.map((data) => (
          <WalletCard
            walletName={data.walletName}
            walletDescription={data.walletDescription}
            icon={colorMode === 'dark' ? <WalletActiveIcon /> : <WalletDark />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
        ))}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});

export default SingleSig;
