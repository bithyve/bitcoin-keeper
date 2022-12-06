import React, { useContext } from 'react';
import { Box, Text, Image } from 'native-base';
import { Clipboard, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import { LocalizationContext } from 'src/common/content/LocContext';
import { wp, hp } from 'src/common/data/responsiveness/responsive';

import QRCode from 'react-native-qrcode-svg';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import Note from '../Note/Note';

function ShowXPub({
  data,
  copy = () => {},
  subText,
  noteSubText,
  copyable = true,
}: {
  data: string;
  copy: Function;
  subText: string;
  noteSubText: string;
  copyable?: boolean;
}) {
  const { translations } = useContext(LocalizationContext);
  const {common} = translations;

  return (
    <>
      <Box justifyContent="center" alignItems="center" width={wp(275)}>
        <Box>
          <QRCode value={data} logoBackgroundColor="transparent" size={hp(200)} />
          <Box bg="light.QrCode" alignItems="center" justifyContent="center" p={1} w={200}>
            <Text fontSize={RFValue(12)} color="light.recieverAddress" fontFamily="body">
              {subText}
            </Text>
          </Box>
        </Box>
        <Box p={2}>
          {copyable ? (
            <Box
              flexDirection="row"
              bg="light.textInputBackground"
              borderTopLeftRadius={10}
              borderBottomLeftRadius={10}
              width={wp(220)}
              marginTop={hp(30)}
              marginBottom={hp(30)}
            >
              <Box py={2} alignItems="center">
                <Text fontSize={RFValue(12)} fontFamily="body" noOfLines={1} px={3}>
                  {data}
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
                  Clipboard.setString(data);
                  copy();
                }}
              >
                <Box>
                  <CopyIcon />
                </Box>
              </TouchableOpacity>
            </Box>
          ) : null}
        </Box>
      </Box>
      <Box width="85%">
        <Note title={common.note} subtitle={noteSubText} subtitleColor="GreyText" />
      </Box>
    </>
  );
}
export default ShowXPub;
