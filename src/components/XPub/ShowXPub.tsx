import React, { useContext } from 'react';
import { Box, Text, Image } from 'native-base';
import { Clipboard, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import InfoBox from '../InfoBox';
import { LocalizationContext } from 'src/common/content/LocContext';
import { wp, hp } from 'src/common/data/responsiveness/responsive';

import QrCode from 'src/assets/images/qrcode.png';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';

const ShowXPub = ({ copy = () => { } }) => {
  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];
  const common = translations['common'];

  return (
    <>
      <Box
        justifyContent={'center'}
        alignItems={'center'}
        width={wp(275)}
      >
        <Box >
          <Image style={{ height: 200, width: 200 }} source={QrCode} />
          <Box bg={'light.QrCode'} alignItems={'center'} justifyContent={'center'} p={1} w={200}>
            <Text fontSize={RFValue(12)} color={'light.recieverAddress'} fontFamily={'body'}>
              {wallet.AccountXpub}
            </Text>
          </Box>
        </Box>
        <Box p={2}>
          <Box
            flexDirection={'row'}
            bg={'light.textInputBackground'}
            borderTopLeftRadius={10}
            borderBottomLeftRadius={10}
            width={wp(220)}
            marginTop={hp(30)}
            marginBottom={hp(30)}
          >
            <Box
              py={2}
              alignItems={'center'}
            >
              <Text
                fontSize={RFValue(12)}
                fontFamily={'body'}
                noOfLines={1}
                px={3}
              >
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
              onPress={() => {
                Clipboard.setString('lk2j3429-85213-5134=50t-934285…');
                copy();
              }}
            >
              <Box>
                <CopyIcon />
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
      <InfoBox
        title={common.note}
        desciption={wallet.AccountXpubNote}
        width={wp(210)}
      />
    </>
  );
};
export default ShowXPub;
