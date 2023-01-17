import React, { useContext, useState } from 'react';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { LocalizationContext } from 'src/common/content/LocContext';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import Text from 'src/components/KeeperText';
import KeyPadView from './AppNumPad/KeyPadView';
import CustomGreenButton from './CustomButton/CustomGreenButton';
import CVVInputsView from './HealthCheck/CVVInputsView';

function SettingUpTapsigner(props) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { tapsigner } = translations;
  const { healthcheck } = translations;

  const [passcodeFlag] = useState(true);

  const { onPress, inputText, setInputText } = props;

  const onPressNumber = (text) => {
    let tmpPasscode = inputText;
    tmpPasscode += text;
    if (inputText.length <= 5) {
      setInputText(tmpPasscode);
    }
  };

  const onDeletePressed = (text) => {
    let str = inputText;
    str = str.substring(0, str.length - 1);
    setInputText(str);
  };

  return (
    <Box backgroundColor="light.mainBackground" borderRadius={10}>
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
          {tapsigner.SetupTitle}
        </Text>
        <Text fontSize={13} color="light.secondaryText">
          {healthcheck.EnterCVV}
        </Text>
      </Box>
      <Box px={4}>
        {/* pin input view */}
        <CVVInputsView passCode={inputText} passcodeFlag={passcodeFlag} backgroundColor textColor />
        {/*  */}
        <Box mt={10} alignSelf="flex-end" mr={10}>
          {inputText.length === 6 && (
            <Box>
              <CustomGreenButton onPress={onPress} value={common.proceed} />
            </Box>
          )}
        </Box>
      </Box>
      {/* keyboardview start */}
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor="light.primaryText"
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
}
export default SettingUpTapsigner;
