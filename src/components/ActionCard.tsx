import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { windowHeight, windowWidth } from 'src/constants/responsive';

type ActionCardProps = {
  cardName: string;
  description?: string;
  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;
  dottedBorder?: boolean;
};

function ActionCard({
  cardName,
  icon,
  description,
  customStyle,
  callback,
  dottedBorder = false,
}: ActionCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={callback}>
      <Box
        style={[styles.cardContainer, { ...customStyle }]}
        backgroundColor={`${colorMode}.seashellWhite`}
      >
        <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
          {dottedBorder && (
            <Box borderColor={`${colorMode}.PearlWhite`} style={styles.dottedBorder} />
          )}
          {icon && icon}
        </Box>
        <Text color={`${colorMode}.primaryText`}>{cardName}</Text>
        {description && (
          <Text fontSize={11} color={`${colorMode}.GreenishGrey`}>
            {description}
          </Text>
        )}
      </Box>
    </TouchableOpacity>
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
  dottedBorder: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dotted',
  },
});

export default ActionCard;
