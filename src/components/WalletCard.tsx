import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
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
  const { colorMode } = useColorMode();
  const isSelected = selectedCard === walletName;

  return (
    <TouchableOpacity
      style={[
        styles.walletContainer,
        isSelected
          ? { backgroundColor: `${colorMode}.primaryGreen` }
          : { backgroundColor: `${colorMode}.seashellWhite` },
      ]}
      onPress={() => onCardSelect(walletName)}
    >
      <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
        {isSelected && <CheckmarkIcon />}
      </Box>
      <Box style={styles.detailContainer}>
        <Box>{isSelected ? selectedIcon : icon}</Box>
        <Text style={isSelected && { color: `${colorMode}.white` }} numberOfLines={1}>
          {walletName}
        </Text>
        <Text style={[isSelected && { color: `${colorMode}.white` }]} numberOfLines={1}>
          {walletDescription}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: 114,
    marginVertical: 15,
    padding: 10,
    height: 125,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#eee3d8',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 22 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 15,
  },
});

export default WalletCard;
