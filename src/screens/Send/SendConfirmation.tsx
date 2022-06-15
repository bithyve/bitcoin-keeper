import React from 'react';
import { Box, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import WalletIcon from 'src/assets/images/svgs/icon_wallet.svg';
import BTC from 'src/assets/images/svgs/btc_grey.svg';

const SendConfirmation = () => {
  const navigtaion = useNavigation();

  const SendingCard = () => {
    return (
      <Box marginY={windowHeight * 0.01} >
        <Text
          color={'light.lightBlack'}
          fontSize={14}
          letterSpacing={1.12}
          fontWeight={200}
          marginY={windowHeight * 0.011}
        >
          Sending From
        </Text>
        <Box borderRadius={10} backgroundColor={'light.lightYellow'} flexDirection={'row'} padding={windowHeight * 0.019}>
          <Box
            backgroundColor={'light.yellow1'}
            height={10}
            width={10}
            borderRadius={20}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <WalletIcon />
          </Box>
          <Box marginLeft={3}>
            <Text
              color={'light.sendCardHeading'}
              fontSize={14}
              letterSpacing={1.12}
              fontWeight={200}
            >
              Funds
            </Text>
            <Box flexDirection={'row'}>
              <Text
                color={'light.GreyText'}
                fontSize={12}
                letterSpacing={0.24}
                fontWeight={100}
              >
                Available to spend {' '}
              </Text>
              <Box justifyContent={'center'}>
                <BTC />
              </Box>
              <Text
                color={'light.GreyText'}
                fontSize={14}
                letterSpacing={1.4}
                fontWeight={300}
              >
                {' '}0.000018
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const Transaction = () => {
    return (
      <Box flexDirection={'row'} justifyContent={'space-between'} marginY={3}>
        <Text color={'light.lightBlack'} fontSize={14} fontWeight={200} letterSpacing={1.12}>Transaction Fee</Text>
        <Text color={'light.seedText'} fontSize={14} fontWeight={200} letterSpacing={0.28}>0.03 $</Text>
      </Box>
    );
  }
  return (
    <Box
      padding={windowHeight * 0.01}
      paddingX={5}
      background={'light.ReceiveBackground'}
      flexGrow={1}
      position={'relative'}
    >
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Sending to address"
        subtitle="Lorem ipsum dolor sit amet,"
        color="light.ReceiveBackground"
        onPressHandler={() => navigtaion.goBack()}
      />
      <Box marginTop={windowHeight * 0.01} marginX={7}>
        <SendingCard />
        <SendingCard />

        <Box marginTop={windowHeight * 0.01}>
          <Transaction />
          <Transaction />
        </Box>
      </Box>

      <Box position={'absolute'} bottom={windowHeight * 0.025} right={10}>
        <Buttons
          primaryText='Proceed'
          secondaryText='Cancel'
          primaryCallback={() => { console.log('proceed') }}
          secondaryCallback={() => { console.log('Cancle') }}
        />
      </Box>
    </Box >
  );
};
export default SendConfirmation;
