import { Box } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/theme/Colors';
import CheckmarkIcon from 'src/assets/images/checkmark.svg';

type WalletCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  selectedIcon: Element;
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

function WalletCard({
  walletName,
  walletDescription,
  icon,
  selectedIcon,
  selectedCard,
  onCardSelect,
}: WalletCardProps) {
  const isSelected = selectedCard === walletName;

  return (
    <TouchableOpacity
      style={[styles.walletContainer, isSelected && styles.selectedCard]}
      onPress={() => onCardSelect(walletName)}
    >
      <Box style={styles.circle}>{isSelected && <CheckmarkIcon />}</Box>
      <Box style={styles.detailContainer}>
        <Box>{isSelected ? selectedIcon : icon}</Box>
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
    width: 120,
    height: 130,
    marginVertical: 5,
    padding: 5,
    backgroundColor: Colors.lightBeige,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#eee3d8',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 22 / 2,
    backgroundColor: 'rgba(237, 227, 216, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 15,
  },
  selectedCard: {
    backgroundColor: 'rgba(45, 103, 89, 1)',
  },
});

export default WalletCard;
