import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, Input } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import CustomGreenButton from '../CustomButton/CustomGreenButton';

const HealthCheckComponent = (props) => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const common = translations['common'];

  const [seedWord, setSeedWord] = useState('');
  const [strongPassword, setStrongPassword] = useState('');
  const [nextStatus, setNextStatus] = useState(false);

  return (
    <Box bg={'light.ReceiveBackground'} p={10} borderRadius={10}>
      <Box>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'}>
          {BackupWallet.healthCheck}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack2'} mb={10}>
          Lorem ipsum dolor sit amet
        </Text>
      </Box>
      <Box>
        <Text fontSize={RFValue(13)} ml={3}>
          {!nextStatus ? BackupWallet.enterSeedWord : BackupWallet.enterStrongPass}
        </Text>
        <Input
          placeholder={!nextStatus ? 'Port Number (eg: 8003)' : 'Enter Password'}
          placeholderTextColor={'light.lightBlack2'}
          backgroundColor={'light.lightYellow'}
          value={!nextStatus ? seedWord : strongPassword}
          onChangeText={(value) => (nextStatus ? setSeedWord(value) : setStrongPassword(value))}
          style={{
            fontSize: RFValue(13),
            letterSpacing: 0.96,
            height: 50,
          }}
          borderRadius={10}
          marginY={2}
          borderWidth={'0'}
        />
      </Box>
      <Box my={5}>
        <Text fontSize={RFValue(13)}>{BackupWallet.healthCheckNote}</Text>
      </Box>
      <Box alignItems={'center'} flexDirection={'row'} w={'90%'}>
        <TouchableOpacity onPress={() => props.closeBottomSheet()} style={{ width: '60%' }}>
          <Text fontSize={RFValue(14)} textAlign={'center'}>
            {common.skip}
          </Text>
        </TouchableOpacity>
        <Box>
          <CustomGreenButton
            onPress={() => {
              setNextStatus(!nextStatus);
            }}
            value={common.confirm}
          />
        </Box>
      </Box>
    </Box>
  );
};
export default HealthCheckComponent;
