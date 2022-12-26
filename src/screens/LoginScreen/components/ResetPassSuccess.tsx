import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';

import Illustration from 'src/assets/images/illustration.svg';
// import login from 'src/store/reducers/login';
import { LocalizationContext } from 'src/common/content/LocContext';

function ResetPassSuccess(props) {
  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  function onPressProceed() {}

  return (
    <Box backgroundColor="light.secondaryBackground" padding={10} borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          backgroundColor="light.lightAccent"
          borderRadius={32}
          h={8}
          width={8}
          alignItems="center"
          justifyContent="center"
          alignSelf="flex-end"
        >
          <Text fontSize={18} color="light.white">
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Text fontSize={19} color="light.primaryText">
        {login.resetSuccess}
      </Text>
      <Text fontSize={13} color="light.textColor2">
        {login.ResetPassSubPara1}
      </Text>
      <Box alignItems="center" my={10}>
        <Illustration />
      </Box>
      <Text fontSize={13} color="light.textColor2" my={5}>
        {login.ResetPassSubPara2}
      </Text>
      <Box alignSelf="flex-end">
        <CustomGreenButton
          onPress={() => props.closeBottomSheet()}
          value="Login"
          disabled={false}
        />
      </Box>
    </Box>
  );
}
export default ResetPassSuccess;
