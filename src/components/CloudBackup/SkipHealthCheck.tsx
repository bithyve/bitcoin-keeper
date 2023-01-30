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
    <Box backgroundColor="light.secondaryBackground" borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          margin={5}
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
      <Box padding={10}>
        <Text fontSize={19} color="light.primaryText">
          {BackupWallet.skipHealthCheckTitle}
        </Text>
        <Text fontSize={13} color="light.primaryText">
          {BackupWallet.skipHealthCheckSubTitle}
        </Text>
      </Box>
      <Box padding={10}>
        <Text fontSize={13} color="light.primaryText" mb={5} mt={10}>
          {BackupWallet.skipHealthCheckPara01}
        </Text>
        <Text fontSize={13} color="light.primaryText">
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
        touchDisable={true}
      />
    </Box>
  );
}
export default SkipHealthCheck;
