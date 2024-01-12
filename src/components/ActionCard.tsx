import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';

type ActionCardProps = {
  cardName: string;
  callback: () => void;
  icon?: Element;
  description?: string;
};

function ActionCard({ cardName, icon, callback, description }: ActionCardProps) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      style={[styles.cardContainer]}
      backgroundColor={`${colorMode}.seashellWhite`}
      onPress={callback}
    >
      <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
        {icon && icon}
      </Box>
      <Text fontSize={12} color={`${colorMode}.primaryText`}>
        {cardName}
      </Text>
      {description && (
        <Text fontSize={11} color={`${colorMode}.GreenishGrey`}>
          {description}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 114,
    height: 125,
    padding: 10,
    borderRadius: 10,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
});

export default ActionCard;
