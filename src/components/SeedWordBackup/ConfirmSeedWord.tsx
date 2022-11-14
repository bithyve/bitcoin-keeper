import { Box, Input, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

import CustomGreenButton from '../CustomButton/CustomGreenButton';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { TouchableOpacity } from 'react-native';
import Buttons from '../Buttons';

const ConfirmSeedWord = (props) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const common = translations['common'];
  const { words } = props;
  const [seedWord, setSeedWord] = useState('');
  const [index] = useState(Math.floor(Math.random() * words.length));
  const [invalid, setInvalid] = useState(false);

  const getSeedNumber = (seedNumber) => {
    switch (seedNumber + 1) {
      case 1:
        return 'first (01)';
      case 2:
        return 'second (02)';
      case 3:
        return 'third (03)';
      case 4:
        return 'fourth (04)';
      case 5:
        return 'fifth (05)';
      case 6:
        return 'sixth (06)';
      case 7:
        return 'seventh (07)';
      case 8:
        return 'eighth (08)';
      case 9:
        return 'ninth (09)';
      case 10:
        return 'tenth (10)';
      case 11:
        return 'eleventh (11)';
      case 12:
        return 'twelfth (12)';
    }
  };

  const getHint = (seedNumber) => {
    switch (seedNumber + 1) {
      case 1:
        return 'first';
      case 2:
        return 'second';
      case 3:
        return 'third';
      case 4:
        return 'fourth';
      case 5:
        return 'fifth';
      case 6:
        return 'sixth';
      case 7:
        return 'seventh';
      case 8:
        return 'eighth';
      case 9:
        return 'ninth';
      case 10:
        return 'tenth';
      case 11:
        return 'eleventh';
      case 12:
        return 'twelfth';
    }
  };

  return (
    <Box bg={'light.ReceiveBackground'} p={10} borderRadius={10}>
      <Box>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'}>
          {BackupWallet.confirmSeedWord}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack2'} mb={10}>
          Exactly as they were displayed
        </Text>
      </Box>
      <Box>
        <Text fontSize={RFValue(13)} ml={1}>
          {`Enter the ${getSeedNumber(index)} word`}
        </Text>
        <Input
          placeholder={`Enter ${getHint(index)} word`}
          placeholderTextColor={'light.lightBlack2'}
          backgroundColor={'light.lightYellow'}
          value={seedWord}
          autoCorrect={false}
          autoComplete="off"
          keyboardType="name-phone-pad"
          onChangeText={(value) => {
            setSeedWord(value.trim());
            setInvalid(false);
          }}
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
      {invalid && (
        <Text color="red.400" fontSize={RFValue(13)} ml={1}>
          {'Invalid word'}
        </Text>
      )}

      <Box my={5}>
        <Text fontSize={RFValue(13)}>{BackupWallet.seedWordNote}</Text>
      </Box>
      {/* <Box alignItems={'center'} flexDirection={'row'} w={'90%'}> */}
      {/* <TouchableOpacity onPress={() => props.closeBottomSheet()} style={{ width: '60%' }}>
          <Text fontSize={RFValue(14)} textAlign={'center'}>
            {BackupWallet.startOver}
          </Text>
        </TouchableOpacity>
        <Box>
          <CustomGreenButton
            onPress={() => {
              if (seedWord === words[index]) {
                props.confirmBtnPress();
              } else {
                setInvalid(true);
              }
            }}
            value={common.confirm}
          />
        </Box> 
        </Box>*/}
      <Buttons
        secondaryText={BackupWallet.startOver}
        secondaryCallback={() => {
          props.closeBottomSheet();
        }}
        primaryText={common.confirm}
        primaryCallback={() => {
          if (seedWord === words[index]) {
            props.confirmBtnPress();
          } else {
            setInvalid(true);
          }
        }}
      />
    </Box>
  );
};
export default ConfirmSeedWord;
