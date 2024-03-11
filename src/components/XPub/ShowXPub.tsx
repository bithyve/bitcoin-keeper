import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { ActivityIndicator } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { wp, hp } from 'src/constants/responsive';
import QRCode from 'react-native-qrcode-svg';
import Note from '../Note/Note';
import WalletFingerprint from '../WalletFingerPrint';

function ShowXPub({
  data,
  copy = () => {},
  subText,
  noteSubText,
  copyable = true,
}: {
  data: string;
  copy?: Function;
  subText: string;
  noteSubText?: string;
  copyable: boolean;
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [details, setDetails] = useState('');

  useEffect(() => {
    setDetails(data);
  }, [data]);

  return (
    <>
      <Box justifyContent="center" alignItems="center">
        <Box>
          {details ? (
            <QRCode value={details} logoBackgroundColor="transparent" size={hp(200)} />
          ) : (
            <ActivityIndicator />
          )}
          <Box
            backgroundColor={`${colorMode}.QrCode`}
            alignItems="center"
            justifyContent="center"
            padding={1}
            width={hp(200)}
          >
            <Text fontSize={12} bold color={`${colorMode}.RussetBrown`}>
              {subText}
            </Text>
          </Box>
        </Box>
        <Box padding={2}>{copyable && <WalletFingerprint fingerprint={details} copy={copy} />}</Box>
      </Box>
      {noteSubText ? (
        <Box width={wp(280)}>
          <Note title={common.note} subtitle={noteSubText} subtitleColor="GreyText" />
        </Box>
      ) : null}
    </>
  );
}
export default ShowXPub;
