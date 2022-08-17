import React, { useContext, useState, useEffect } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { RFValue } from 'react-native-responsive-fontsize';

import { LocalizationContext } from 'src/common/content/LocContext';
import KeyPadView from './AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import CustomGreenButton from './CustomButton/CustomGreenButton';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import CVVInputsView from './CVVInputsView';

const SettingUpTapsigner = (props) => {
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const tapsigner = translations['tapsigner'];
  const healthcheck = translations['healthcheck'];
  const dispatch = useAppDispatch();

  const [passcodeFlag] = useState(true);

  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);

  const { onPress, inputText, setInputText } = props;

  const onPressNumber = (text) => {
    let tmpPasscode = inputText;
    tmpPasscode += text;
    setInputText(tmpPasscode);
    console.log(inputText);
  };

  return (
    <Box bg={'#F7F2EC'} borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          m={5}
          bg={'#E3BE96'}
          borderRadius={32}
          h={8}
          w={8}
          alignItems={'center'}
          justifyContent={'center'}
          alignSelf={'flex-end'}
        >
          <Text fontSize={18} color={'#FFF'}>
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Box p={10}>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'} fontFamily={'heading'}>
          {tapsigner.SetupTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack2'} fontFamily={'body'}>
          {healthcheck.EnterCVV}
        </Text>
      </Box>
      <Box>
        {/* pin input view */}
        <CVVInputsView
          passCode={inputText}
          passcodeFlag={passcodeFlag}
          backgroundColor={true}
          textColor={true}
        />
        {/*  */}
        <Box mt={10} alignSelf={'flex-end'} mr={10}>
          {inputText.length == 6 && (
            <Box>
              <CustomGreenButton onPress={onPress} value={common.proceed} />
            </Box>
          )}
        </Box>
      </Box>
      {/* keyboardview start */}
      <KeyPadView onPressNumber={onPressNumber} keyColor={'#041513'} ClearIcon={<DeleteIcon />} />
    </Box>
  );
};
export default SettingUpTapsigner;
