import { Box, Pressable, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, ViewStyle } from 'react-native';
import { windowHeight, windowWidth } from 'src/constants/responsive';

type ActionCardProps = {
  cardName: string;
  description?: string;
  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;
};

function ActionCard({ cardName, icon, description, customStyle, callback }: ActionCardProps) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      style={[styles.cardContainer, { ...customStyle }]}
      backgroundColor={`${colorMode}.seashellWhite`}
      onPress={callback}
    >
      <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
        {icon && icon}
      </Box>
      <Text numberOfLines={2} color={`${colorMode}.primaryText`}>
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
    width: windowWidth / 3.3,
    height: windowHeight / 6.5,
    padding: 10,
    borderRadius: 10,
  },

  circle: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
});

export default ActionCard;
