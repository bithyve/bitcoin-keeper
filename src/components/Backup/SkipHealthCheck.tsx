import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';

function SkipHealthCheck(props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { common } = translations;
  return (
    <Box backgroundColor={`${colorMode}.textInputBackground`} borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          margin={5}
          backgroundColor={`${colorMode}.accent`}
          borderRadius={32}
          h={8}
          width={8}
          alignItems="center"
          justifyContent="center"
          alignSelf="flex-end"
        >
          <Text fontSize={18} color={`${colorMode}.white`}>
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Box padding={10}>
        <Text fontSize={19} color={`${colorMode}.primaryText`}>
          {BackupWallet.skipHealthCheckTitle}
        </Text>
        <Text fontSize={13} color={`${colorMode}.primaryText`}>
          {BackupWallet.skipHealthCheckSubTitle}
        </Text>
      </Box>
      <Box padding={10}>
        <Text fontSize={13} color={`${colorMode}.primaryText`} mb={5} mt={10}>
          {BackupWallet.skipHealthCheckPara01}
        </Text>
        <Text fontSize={13} color={`${colorMode}.primaryText`}>
          {BackupWallet.skipHealthCheckPara02}
        </Text>
      </Box>
      <Buttons
        secondaryText={common.skip}
        secondaryCallback={() => {
          props.closeBottomSheet();
        }}
        primaryText={common.confirmSeed}
        primaryCallback={props.confirmBtnPress()}
      />
    </Box>
  );
}
export default SkipHealthCheck;
