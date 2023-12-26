import { Box } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/theme/Colors';

type WalletCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

function WalletCard({
  walletName,
  walletDescription,
  icon,
  selectedCard,
  onCardSelect,
}: WalletCardProps) {
  const isSelected = selectedCard === walletName;
  return (
    <TouchableOpacity
      style={[styles.walletContainer, isSelected && styles.selectedCard]}
      onPress={() => onCardSelect(walletName)}
    >
      <Box style={styles.circle} />
      <Box style={styles.detailContainer}>
        <Box>{icon}</Box>
        <Text style={isSelected && { color: Colors.White }}>{walletName}</Text>
        <Text style={[isSelected && { color: Colors.White }]} numberOfLines={1}>
          {walletDescription}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: 130,
    marginVertical: 15,
    padding: 10,

    backgroundColor: Colors.lightBeige,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#eee3d8',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: '#eee3d8',
  },
  detailContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 15,
  },
  selectedCard: {
    backgroundColor: '#2e6759',
  },
});

export default WalletCard;
