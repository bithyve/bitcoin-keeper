import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

export function AddKeyButton({ short = false, onPress }: { short?: boolean; onPress: () => void }) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={onPress} style={styles.addNewBtn}>
      <Text color={`${colorMode}.textGreen`} semiBold style={styles.addNew}>
        {short ? 'Add a key' : 'Add a new key'}
      </Text>
      <Text style={styles.addNewPlus} color={`${colorMode}.textGreen`} medium>
        +
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addNewBtn: {
    flexDirection: 'row',
  },
  addNew: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginRight: wp(5),
  },
  addNewPlus: {
    fontSize: 26,
    marginTop: hp(6),
  },
});

export default AddKeyButton;
