import React, { useContext } from 'react';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { LocalizationContext } from 'src/common/content/LocContext';
import Text from 'src/components/KeeperText';
import Buttons from '../Buttons';

function SkipHealthCheck(props) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { common } = translations;
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
          {BackupWallet.skipHealthCheckTitle}
        </Text>
        <Text fontSize={13} color="light.primaryText" fontFamily="body">
          {BackupWallet.skipHealthCheckSubTitle}
        </Text>
      </Box>
      <Box p={10}>
        <Text fontSize={13} color="light.primaryText" fontFamily="body" mb={5} mt={10}>
          {BackupWallet.skipHealthCheckPara01}
        </Text>
        <Text fontSize={13} color="light.primaryText" fontFamily="body">
          {BackupWallet.skipHealthCheckPara02}
        </Text>
      </Box>
      <Buttons
        secondaryText={common.skip}
        secondaryCallback={() => {
          props.closeBottomSheet();
        }}
        primaryText="Confirm Seeds"
        primaryCallback={props.confirmBtnPress()}
      />
    </Box>
  );
}
export default SkipHealthCheck;
