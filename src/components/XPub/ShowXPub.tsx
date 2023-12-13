import React, { useContext, useEffect, useState } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { wp, hp } from 'src/constants/responsive';

import QRCode from 'react-native-qrcode-svg';
import CopyIcon from 'src/assets/images/icon_copy.svg';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import Note from '../Note/Note';

function ShowXPub({
  wallet,
  data,
  copy = () => {},
  subText,
  noteSubText,
  copyable = true,
  cosignerDetails = false,
  keeper,
}: {
  data: string;
  wallet?: Wallet;
  copy?: Function;
  subText: string;
  noteSubText?: string;
  copyable: boolean;
  cosignerDetails?: boolean;
  keeper?: KeeperApp;
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (cosignerDetails) {
      setTimeout(() => {
        setDetails(JSON.stringify(getCosignerDetails(wallet, keeper.id)));
      }, 200);
    } else {
      setDetails(data);
    }
  }, [cosignerDetails, data]);

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
            <Text fontSize={12} color={`${colorMode}.recieverAddress`}>
              {subText}
            </Text>
          </Box>
        </Box>
        <Box padding={2}>
          {copyable ? (
            <Pressable
              backgroundColor={`${colorMode}.seashellWhite`}
              onPress={() => {
                Clipboard.setString(details);
                copy();
              }}
              style={{
                flexDirection: 'row',
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
                width: '90%',
                marginTop: hp(30),
                marginBottom: hp(30),
              }}
            >
              <Box py={2} alignItems="center">
                <Text fontSize={12} numberOfLines={1} px={3}>
                  {details}
                </Text>
              </Box>

              <Box
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
              </Box>
            </Pressable>
          ) : null}
        </Box>
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
