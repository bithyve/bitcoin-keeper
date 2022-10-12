import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, Input, View } from 'native-base';
import { Alert, TouchableOpacity } from 'react-native';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import BtcInput from 'src/assets/images/svgs/btc_input.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';

import { LocalizationContext } from 'src/common/content/LocContext';
import LinearGradient from 'react-native-linear-gradient';
import { wp } from 'src/common/data/responsiveness/responsive';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
// import BTC from 'src/assets/images/svgs/btc_grey_big.svg';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import KeyPadView from '../AppNumPad/KeyPadView';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { WalletSpecs } from 'src/core/wallets/interfaces/wallet';

const TransferPolicy = (props) => {
  const { wallet } = props;
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const walletTrans = translations['wallet'];
  const dispatch = useAppDispatch();

  const [policyText, setPolicyText] = useState('');

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit != 'x') {
      temp += digit;
      setPolicyText(temp);
    }
  };

  const onDeletePressed = () => {
    if (policyText) {
      setPolicyText(policyText.slice(0, -1));
    }
  };
  const presshandler = () => {
    let specs: WalletSpecs = JSON.parse(JSON.stringify(wallet.specs));
    specs.transferPolicy = Number(policyText);
    dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, { specs });
    Alert.alert('Transfer Policy Changed');
    props.closeBottomSheet();
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
            {'Edit Transfer Policy'}
          </Text>
          <Text fontSize={RFValue(13)} color={'light.lightBlack2'} fontFamily={'body'}>
            {'Threshold mount at which transfer is triggered'}
          </Text>
        </Box>
      </Box>
      <View
        marginX={'5%'}
        flexDirection={'row'}
        width={'90%'}
        justifyContent={'center'}
        alignItems={'center'}
        borderRadius={5}
        backgroundColor={'light.lightYellow'}
        padding={3}
      >
        <View marginLeft={4}>
          <BtcInput />
        </View>
        <View marginLeft={2} width={0.5} backgroundColor={'#BDB7B1'} opacity={0.3} height={5} />
        <Text width={'100%'}>{policyText && `${policyText} sats`}</Text>
      </View>

      <Box px={10} py={5}>
        <Text fontSize={RFValue(13)} color={'light.modalText'} fontFamily={'body'}>
          {
            'This will only trigger a transfer request which you need to approve before the transfer is done'
          }
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
        <TouchableOpacity onPress={presshandler}>
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
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={'#041513'}
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
};
export default TransferPolicy;
