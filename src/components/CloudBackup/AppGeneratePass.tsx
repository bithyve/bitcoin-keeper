import React, { useContext, useState } from 'react';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { LocalizationContext } from 'src/common/content/LocContext';

import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import { generateKey } from 'src/core/services/operations/encryption';
import Text from 'src/components/KeeperText';
import CustomGreenButton from '../CustomButton/CustomGreenButton';

function AppGeneratePass(props: any) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const [agsp] = useState(
    generateKey(18)
      .match(/.{1,6}/g)
      .join('-')
  );
  const [copied, setCopied] = useState(false);

  const { common } = translations;
  const { closeBottomSheet, confirmBtnPress } = props;
  return (
    <Box bg="#F7F2EC" borderRadius={10}>
      <TouchableOpacity onPress={() => closeBottomSheet()}>
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
      <Box px={10} py={5}>
        <Text fontSize={19} color="light.primaryText">
          {BackupWallet.appGeneratePassTitle}
        </Text>
        <Text fontSize={13} color="light.primaryText">
          {BackupWallet.appGeneratePassSubTitle}
        </Text>
      </Box>
      {/* {Input Field} */}
      <Box alignItems="center" borderBottomLeftRadius={10} borderTopLeftRadius={10}>
        <TouchableOpacity
          activeOpacity={0.4}
          onPress={() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1500);
            Clipboard.setString(agsp);
          }}
        >
          <Box
            flexDirection="row"
            width="80%"
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="light.textInputBackground"
          >
            <Text width="80%" marginLeft={4} noOfLines={1} fontSize={18}>
              {agsp}
            </Text>
            <Box
              backgroundColor="light.copyBackground"
              padding={3}
              borderTopRightRadius={10}
              borderBottomRightRadius={10}
            >
              <CopyIcon />
            </Box>
          </Box>
        </TouchableOpacity>
        {copied && (
          <Text
            color="gray.400"
            style={{
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Copied to clipboard
          </Text>
        )}
      </Box>
      <Box p={10}>
        <Text fontSize={13} color="light.primaryText">
          {BackupWallet.appGeneratePassSubTitle}
        </Text>
      </Box>
      <Box px={10} w="90%" flexDirection="row" alignItems="center">
        <Box w="15%">
          <CopyIcon />
        </Box>
        <Box w="80%">
          <Text fontSize={12} bold>
            Backing up drive
          </Text>
          <Text fontSize={12}>Lorem ipsum dolor sit amet</Text>
        </Box>
      </Box>
      <Box alignItems="center" flexDirection="row" w="95%" py={5}>
        <TouchableOpacity
          onPress={() => closeBottomSheet()}
          style={{ width: '60%', paddingLeft: '15%' }}
        >
          <Text fontSize={14} textAlign="center">
            {common.cancel}
          </Text>
        </TouchableOpacity>
        <Box w="40%">
          <CustomGreenButton
            onPress={() => {
              confirmBtnPress(agsp);
            }}
            value={common.next}
          />
        </Box>
      </Box>
    </Box>
  );
}
export default AppGeneratePass;
