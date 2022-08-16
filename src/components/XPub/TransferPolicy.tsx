import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, Input } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';

import { LocalizationContext } from 'src/common/content/LocContext';
import LinearGradient from 'react-native-linear-gradient';
import { wp } from 'src/common/data/responsiveness/responsive';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import BTC from 'src/assets/images/svgs/btc_grey_big.svg';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import KeyPadView from '../AppNumPad/KeyPadView';

const TransferPolicy = (props) => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const wallet = translations['wallet'];
  const dispatch = useAppDispatch();

  const [policyText, setPolicyText] = useState('');

  const onPressNumber = (text) => {
    let tmpPolicyCode = text;
    setPolicyText(tmpPolicyCode);
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
      <Box flexDirection={'row'}>
        <Box p={10}>
          <Text fontSize={RFValue(19)} color={'light.lightBlack'} fontFamily={'heading'}>
            {wallet.EditTransferPolicy}
          </Text>
          <Text fontSize={RFValue(13)} color={'light.lightBlack2'} fontFamily={'body'}>
            {'Lorem ipsum dolor sit amet'}
          </Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box
        px={10}
        width={'90%'}
        height={12}
        flexDirection={'row'}
        backgroundColor={'light.lightYellow'}
      >
        <Box justifyContent={'center'}>
          <BTC />
        </Box>
        <Box
          marginLeft={2}
          width={0.5}
          backgroundColor={'light.borderSaperator'}
          opacity={0.3}
          height={7}
          marginTop={2}
        />
        <Text
          color={'light.textBlack'}
          fontWeight={'300'}
          fontSize={RFValue(20)}
          fontFamily={'body'}
          marginTop={1}
          marginLeft={2}
        >
          {policyText}
        </Text>
      </Box>
      <Box px={10} py={5}>
        <Text fontSize={RFValue(13)} color={'light.modalText'} fontFamily={'body'}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do'}
        </Text>
      </Box>
      <Box
        p={10}
        alignItems={'center'}
        alignSelf={'flex-end'}
        bg={'transparent'}
        flexDirection={'row'}
      >
        <TouchableOpacity onPress={() => props.closeBottomSheet()}>
          <Text
            fontSize={13}
            fontFamily={'body'}
            fontWeight={'300'}
            letterSpacing={1}
            color={'light.greenText'}
            mr={wp(18)}
          >
            {common.cancel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#00836A', '#073E39']}
            style={{ paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 }}
          >
            <Text
              fontSize={13}
              fontFamily={'body'}
              fontWeight={'300'}
              letterSpacing={1}
              color={'light.white'}
            >
              {common.confirm}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Box>
      {/* keyboardview start */}
      <KeyPadView onPressNumber={onPressNumber} keyColor={'#041513'} ClearIcon={<DeleteIcon />} />
    </Box>
  );
};
export default TransferPolicy;
