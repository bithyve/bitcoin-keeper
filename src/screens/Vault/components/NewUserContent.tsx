import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import debounce from 'lodash.debounce';

type Props = {
  setPermittedActions: (value: boolean) => void;
  setAddNewUserModal: (value: boolean) => void;
  setNewUserName: (value: string) => void;
  newUserName: string;
  isOnL4: boolean;
};

const NewUserContent = (props: Props) => {
  const { colorMode } = useColorMode();
  const [username, setUserName] = useState('');

  useEffect(() => {
    if (props.newUserName) {
      setUserName(props.newUserName);
    }
  }, [props.newUserName]);

  const debouncedUpdate = React.useRef(
    debounce((val: string) => {
      props.setNewUserName(val);
    }, 2000)
  ).current;

  const handleChangeText = (text: string) => {
    setUserName(text);
    debouncedUpdate(text);
  };

  return (
    <Box style={styles.cardWrapper}>
      <KeeperTextInput
        placeholder="Enter Your Name/label"
        placeholderTextColor={`${colorMode}.placeHolderTextColor`}
        inpuBorderColor={
          props.isOnL4 ? `${colorMode}.dullGreyBorder` : `${colorMode}.textInputBackground`
        }
        value={username}
        onChangeText={handleChangeText}
      />
      <TouchableOpacity
        onPress={() => {
          props.setPermittedActions(true);
          props.setAddNewUserModal(false);
        }}
      >
        <Box
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.dullGreyBorder`}
          borderWidth={1}
          style={styles.cardContainer}
        >
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
