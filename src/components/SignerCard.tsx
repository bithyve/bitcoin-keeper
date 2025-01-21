import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';

type SignerCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

function SignerCard({
  walletName,
  walletDescription,
  icon,
  selectedCard,
  onCardSelect,
}: SignerCardProps) {
  const isSelected = selectedCard === walletName;

  const { colorMode } = useColorMode();
  return (
    <Pressable
      backgroundColor={isSelected ? `${colorMode}.Teal` : `${colorMode}.seashellWhite`}
      borderColor={`${colorMode}.TransactionIconBackColor`}
      style={styles.walletContainer}
      onPress={() => onCardSelect(walletName)}
    >
      <Box backgroundColor={`${colorMode}.BrownNeedHelp`} style={styles.circle} />
      <Box style={styles.detailContainer}>
        <Box backgroundColor={`${colorMode}.BrownNeedHelp`} style={styles.iconWrapper}>
          {icon}
        </Box>
        <Text
          color={isSelected ? `${colorMode}.white` : `${colorMode}.secondaryText`}
          style={styles.walletName}
        >
          {walletName}
        </Text>
        <Text
          style={styles.walletDescription}
          color={isSelected ? `${colorMode}.white` : `${colorMode}.secondaryText`}
          numberOfLines={1}
        >
          {walletDescription}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: 114,
    padding: 10,
    height: 125,
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 0.5,
  },
  walletName: {
    fontSize: 12,
    fontWeight: '400',
  },
  walletDescription: {
    fontSize: 11,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  detailContainer: {
    gap: 2,
    marginTop: 15,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignerCard;
