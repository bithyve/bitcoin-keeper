import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

type Props = {
  setPermittedActions: (value: boolean) => void;
  setAddNewUserModal: (value: boolean) => void;
  setNewUserName: (value: string) => void;
  newUserName: string;
};

const NewUserContent = (props: Props) => {
  const { colorMode } = useColorMode();
  const [username, setUserName] = useState('');

  useEffect(() => {
    if (props.newUserName) {
      setUserName(props.newUserName);
    }
  }, [props.newUserName]);

  const handleChangeText = (text: string) => {
    setUserName(text);
  };

  return (
    <Box style={styles.cardWrapper}>
      <KeeperTextInput
        placeholder="Enter Your Name/label"
        placeholderTextColor={`${colorMode}.placeHolderTextColor`}
        inpuBorderColor={`${colorMode}.textInputBackground`}
        value={username}
        onChangeText={handleChangeText}
        onBlur={() => {
          props.setNewUserName(username);
        }}
      />
      <TouchableOpacity
        onPress={() => {
          props.setPermittedActions(true);
          props.setAddNewUserModal(false);
        }}
      >
        <Box backgroundColor={`${colorMode}.textInputBackground`} style={styles.cardContainer}>
          <Text>Select Permitted Actions</Text>
          <RightArrowIcon />
        </Box>
      </TouchableOpacity>
    </Box>
  );
};

export default NewUserContent;

const styles = StyleSheet.create({
  cardWrapper: {
    gap: hp(10),
  },
  cardContainer: {
    paddingVertical: hp(15),
    paddingHorizontal: wp(16),
    borderRadius: wp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
