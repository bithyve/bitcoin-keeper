import { Box, Pressable, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, ViewStyle } from 'react-native';
import AddCardIcon from 'src/assets/images/addCardIcon.svg';

type AddSignerCardProps = {
  name: string;
  callback?: (param: string) => void;
  cardStyles?: ViewStyle;
};

function AddCard({ name, callback, cardStyles }: AddSignerCardProps) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      backgroundColor={`${colorMode}.pantoneGreenLight`}
      borderColor={`${colorMode}.GreenishBlue`}
      style={[styles.AddCardContainer, cardStyles && cardStyles]}
      onPress={() => callback(name)}
    >
      <Box style={styles.detailContainer}>
        <Box backgroundColor={`${colorMode}.GreenishBlue`} style={styles.iconWrapper}>
          <AddCardIcon />
        </Box>
        <Text color={`${colorMode}.SlateGrey`} style={styles.nameStyle}>
          {name}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: 114,
    padding: 10,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  nameStyle: {
    fontSize: 12,
    fontWeight: '400',
  },

  detailContainer: {
    gap: 2,
    marginTop: 15,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddCard;
