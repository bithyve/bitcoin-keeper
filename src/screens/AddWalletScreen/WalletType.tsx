import { Box, ScrollView } from 'native-base';
import Text from 'src/components/KeeperText';
import WalletCard from 'src/components/WalletCard';
import { StyleSheet } from 'react-native';

type Props = {
  walletData: any;
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

function WalletType({ walletData, selectedCard, onCardSelect }: Props) {
  return (
    <Box style={styles.container}>
      <Text>{walletData.heading}</Text>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={styles.cardContainer}
      >
        {walletData.data.map((wallet: any) => (
          <WalletCard
            walletName={wallet.walletName}
            walletDescription={wallet.walletDescription}
            icon={wallet.icon}
            selectedIcon={wallet.selectedIcon}
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

export default WalletType;
