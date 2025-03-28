import React, { useContext, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { BackupType } from 'src/models/enums/BHR';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import { cryptoRandom } from 'src/utils/service-utilities/encryption';
import KeeperTextInput from '../KeeperTextInput';

function HealthCheckComponent(props) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { common } = translations;
  const { type } = props;
  const [seedWord, setSeedWord] = useState('');
  const [strongPassword, setStrongPassword] = useState('');
  const { words } = props;
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

  const onPressConfirm = () => {
    if (type === BackupType.SEED) {
      if (seedWord.toLocaleLowerCase() === words[index].toLocaleLowerCase()) {
        props.onConfirmed('');
      } else {
        setInvalid(true);
      }
    } else if (strongPassword === props.password) {
      props.onConfirmed(strongPassword);
    } else {
      setInvalid(true);
    }
  };

  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} style={styles.wrapper}>
      <Box>
        <Text fontSize={19} color={`${colorMode}.primaryText`}>
          {BackupWallet.healthCheck}
        </Text>
        <Text fontSize={13} color={`${colorMode}.secondaryText`} mb={10}>
          For the Recovery Phrase
        </Text>
      </Box>
      <Box>
        <Text fontSize={13} ml={3}>
          {type === BackupType.SEED
            ? `Enter the ${getSeedNumber(index)} word`
            : `Hint: ${props.hint}`}
        </Text>
        <KeeperTextInput
          placeholder={type === BackupType.SEED ? `Enter ${getHint(index)} word` : 'Enter Password'}
          value={type === BackupType.SEED ? seedWord : strongPassword}
          onChangeText={(value) =>
            type === BackupType.SEED ? setSeedWord(value) : setStrongPassword(value)
          }
        />
      </Box>
      {invalid && (
        <Text color="red.400" fontSize={13} ml={1}>
          Invalid word
        </Text>
      )}
      <Box my={5}>
        <Text fontSize={13}>{BackupWallet.healthCheckNote}</Text>
      </Box>
      <Buttons
        secondaryText={common.skip}
        secondaryCallback={() => {
          props.closeBottomSheet();
        }}
        primaryText={common.confirm}
        primaryCallback={onPressConfirm}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 25,
    borderRadius: 10,
  },
  inputContainer: {
    fontSize: 13,
    letterSpacing: 0.96,
    height: 50,
  },
});

export default HealthCheckComponent;
