import { Box, useColorMode } from 'native-base';
import { useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import EyeOpen from 'src/assets/images/eye_open.svg';
import EyeClose from 'src/assets/images/eye_close.svg';
type KeeperPasswordInputType = {
  onPress: () => void;
  value: string;
  isActive: boolean;
  placeholder: string;
};

export const KeeperPasswordInput = ({
  value,
  onPress,
  isActive,
  placeholder,
}: KeeperPasswordInputType) => {
  const { colorMode } = useColorMode();
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Box
        height={50}
        backgroundColor={`${colorMode}.seashellWhite`}
        borderWidth={1}
        borderColor={isActive ? `${colorMode}.textColor` : 'transparent'}
        style={styles.ctr}
      >
        <Text style={styles.txt} color={value ? `${colorMode}.primaryText` : 'grey'}>
          {value ? (passwordVisible ? value : '*'.repeat(value.length)) : placeholder}
        </Text>
        <Pressable style={styles.eyeCtr} onPress={() => setPasswordVisible(!passwordVisible)}>
          {passwordVisible ? <EyeOpen /> : <EyeClose />}
        </Pressable>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ctr: {
    borderRadius: 10,
    marginTop: 5,
    paddingLeft: 12,
    flexDirection: 'row',
  },
  eyeCtr: {
    justifyContent: 'center',
    paddingRight: 10,
  },
  txt: {
    fontSize: 13,
    letterSpacing: 0.96,
    flexGrow: 1,
    alignSelf: 'center',
  },
});
