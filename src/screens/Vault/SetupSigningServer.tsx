import { Box, Text, View } from 'native-base';
import { Clipboard, Image, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import BtcGreen from 'src/assets/images/svgs/btc_round_green.svg';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';
import Header from 'src/components/Header';
import InfoBox from '../../components/InfoBox';
import { LocalizationContext } from 'src/common/content/LocContext';
import QRCode from 'react-native-qrcode-svg';
import QrCode from 'src/assets/images/qrcode.png';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { getNextFreeAddress } from 'src/store/sagas/send_and_receive';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import Buttons from 'src/components/Buttons';

// import { useDispatch } from 'react-redux';

const SetupSigningServer = ({ route }: { route }) => {
  const navigtaion = useNavigation();
  // const dispatch = useDispatch();

  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          title={'Set up 2FA for Signing Server'}
          subtitle={'Lorem ipsum dolor sit amet,'}
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.headerText'}
        />
      </Box>
      <Box
        marginTop={hp(50)}
        alignItems={'center'}
        alignSelf={'center'}
        width={hp(250)}
      >
        <Text
          color={'light.recieverAddress'}
          fontFamily={'body'}
          fontWeight={300}
          fontSize={12}
          letterSpacing={1.08}
          width={hp(250)}
          noOfLines={1}
          style={{
            marginVertical: hp(30)
          }}
        >
          Scan the QR below to add Backup Key
        </Text>
        <QRCode
          value={'address'}
          logoBackgroundColor="transparent"
          size={hp(250)}
        />
      </Box>

      {/* {Bottom note} */}
      <Box
        position={'absolute'}
        bottom={hp(45)}
        marginX={5}
      >
        <Box marginBottom={hp(30)}>
          <InfoBox
            title={'Note'}
            desciption={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'}
            width={300}
          />
        </Box>
        <Buttons
          primaryCallback={() => { }}
          primaryText={'Next'}
          secondaryText={'Cancel'}
          secondaryCallback={() => { }}
        />
      </Box>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },
  textBox: {
    width: '80%',
    // backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
});
export default SetupSigningServer;
