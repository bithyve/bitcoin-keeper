import React, { useContext } from 'react';
import { Box, Text, Image } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';

import { LocalizationContext } from 'src/common/content/LocContext';
import QrCode from 'src/assets/images/qrcode.png';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import Note from '../Note/Note';

const ShowXPub = (props) => {
  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];
  const common = translations['common'];
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
          {wallet.XPubTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {wallet.XPubSubTitle}
        </Text>
      </Box>
      <Box alignItems={'center'} justifyContent={'center'} my={5}>
        <Image style={{ height: 200, width: 200 }} source={QrCode} />
        <Box bg={'light.QrCode'} alignItems={'center'} justifyContent={'center'} p={1} w={200}>
          <Text fontSize={RFValue(12)} color={'light.recieverAddress'} fontFamily={'body'}>
            {wallet.AccountXpub}
          </Text>
        </Box>
      </Box>
      <Box p={10}>
        <Box flexDirection={'row'} bg={'light.textInputBackground'} w={'100%'}>
          <Box w={'85%'} py={3} alignItems={'center'}>
            <Text fontSize={RFValue(12)} fontFamily={'body'}>
              lk2j3429-85213-5134=50t-934285…
            </Text>
          </Box>
          <TouchableOpacity
            style={{
              width: '15%',
              paddingVertical: 3,
              backgroundColor: '#CDD8D6',
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box>
              <CopyIcon />
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
      <Box p={2} mb={5}>
        <Note title={common.note} subtitle={wallet.AccountXpubNote} />
      </Box>
    </Box>
  );
};
export default ShowXPub;
