import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration from 'src/assets/images/illustration.svg';
import { useNavigation } from '@react-navigation/native';
import CustomGreenButton from '../CustomButton/CustomGreenButton';

function BackupSuccessful(props) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const navigation = useNavigation();

  return (
    <Box bg="#F7F2EC" borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          m={5}
          bg="#E3BE96"
          borderRadius={32}
          h={8}
          w={8}
          alignItems="center"
          justifyContent="center"
          alignSelf="flex-end"
        >
          <Text fontSize={18} color="#FFF">
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Box p={10}>
        <Text fontSize={19} color="light.primaryText" fontFamily="heading">
          {props.title}
        </Text>
        <Text fontSize={13} color="light.primaryText" fontFamily="body">
          {props.subTitle}
        </Text>
      </Box>
      <Box alignItems="center" my={5}>
        <Illustration />
      </Box>
      <Box p={10}>
        <Text>{props.paragraph}</Text>
      </Box>
      <Box alignItems="flex-end" px={10} mb={5}>
        <CustomGreenButton
          onPress={() => {
            // props.confirmBtnPress();
            navigation.navigate('NewHome');
          }}
          value={BackupWallet.home}
        />
      </Box>
    </Box>
  );
}
export default BackupSuccessful;
