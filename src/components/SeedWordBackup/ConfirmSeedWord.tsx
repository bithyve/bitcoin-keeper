import Text from 'src/components/KeeperText';
import { Box, Input, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import Buttons from 'src/components/Buttons';
import { cryptoRandom } from 'src/services/operations/encryption';

function ConfirmSeedWord(props) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { common } = translations;
  const { words } = props;
  const [seedWord, setSeedWord] = useState('');
  const [index] = useState(Math.floor(cryptoRandom() * words.length));
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
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} padding={10} borderRadius={10}>
      <Box>
        <Text fontSize={19} color={`${colorMode}.primaryText`}>
          {BackupWallet.confirmSeedWord}
        </Text>
        <Text fontSize={13} color={`${colorMode}.secondaryText`} mb={10}>
          Exactly as they were displayed
        </Text>
      </Box>
      <Box>
        <Text fontSize={13} ml={1}>
          {`Enter the ${getSeedNumber(index)} word`}
        </Text>
        <Input
          placeholder={`Enter ${getHint(index)} word`}
          placeholderTextColor={`${colorMode}.secondaryText`}
          backgroundColor={`${colorMode}.seashellWhite`}
          value={seedWord}
          autoCorrect={false}
          autoComplete="off"
          autoCapitalize="none"
          keyboardType="name-phone-pad"
          onChangeText={(value) => {
            setSeedWord(value.trim());
            setInvalid(false);
          }}
          style={{
            fontSize: 13,
            letterSpacing: 0.96,
          }}
          borderRadius={10}
          marginY={2}
          height={10}
          borderWidth="0"
        />
      </Box>
      {invalid && (
        <Text color="red.400" fontSize={13} ml={1}>
          Invalid word
        </Text>
      )}

      <Box my={5}>
        <Text fontSize={13}>{BackupWallet.seedWordNote}</Text>
      </Box>
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
}
export default ConfirmSeedWord;
