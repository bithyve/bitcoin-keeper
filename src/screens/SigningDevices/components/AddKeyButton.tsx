import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import AddGreen from 'src/assets/images/add-plus-green.svg';
import AddWhite from 'src/assets/images/add-plus-white.svg';

export function AddKeyButton({ short = false, onPress }: { short?: boolean; onPress: () => void }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <TouchableOpacity onPress={onPress} style={styles.addNewBtn}>
      <Text color={`${colorMode}.textGreen`} bold style={styles.addNew}>
        {short ? 'Add a key' : 'Add a new key'}
      </Text>
      {isDarkMode ? <AddWhite /> : <AddGreen />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  addNew: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  addNewPlus: {
    fontSize: 26,
    marginTop: hp(6),
  },
});

export default AddKeyButton;
