import React, { useContext, useEffect, useState } from 'react';
import { Box, Text, VStack, HStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import WalletIcon from 'src/assets/images/svgs/icon_wallet.svg';
import BTC from 'src/assets/images/svgs/btc_grey.svg';
import { useDispatch } from 'react-redux';
import { crossTransfer, sendPhaseTwo } from 'src/store/sagaActions/send_and_receive';
import { TxPriority, WalletType } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { useAppSelector } from 'src/store/hooks';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Vault } from 'src/core/wallets/interfaces/vault';
import {
  getTransactionPadding,
  hp,
  windowWidth,
  wp,
} from 'src/common/data/responsiveness/responsive';

import RadioButton from 'src/components/RadioButton';

const SendConfirmation = ({ route }) => {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { isVaultTransfer, uaiSetActionFalse, wallet } = route.params; // isVaultTransfer: switches between automated transfer and typical send
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const [transactionPriority, setTransactionPriority] = useState(TxPriority.LOW);
  const { useQuery } = useContext(RealmWrapperContext);
  const defaultWallet: Wallet = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject)[0];
  const defaultVault: Vault = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject)[0];

  const onProceed = () => {
    if (isVaultTransfer) {
      if (uaiSetActionFalse) {
        uaiSetActionFalse();
      }
      if (defaultVault) {
        dispatch(
          crossTransfer({
            sender: defaultWallet,
            recipient: defaultVault,
            amount: 10e3,
          })
        );
        if (uaiSetActionFalse) {
          uaiSetActionFalse();
        }
        navigtaion.goBack();
      }
    } else {
      dispatch(
        sendPhaseTwo({
          wallet,
          txnPriority: transactionPriority,
        })
      );
    }
  };

  const SendingCard = ({ isSend }) => {
    return (
      <Box marginY={windowHeight * 0.01}>
        <Text
          color={'light.lightBlack'}
          fontSize={14}
          letterSpacing={1.12}
          fontWeight={200}
          marginY={windowHeight * 0.011}
        >
          {isSend ? 'Sending From' : 'Sending To'}
        </Text>
        <Box
          borderRadius={10}
          backgroundColor={'light.lightYellow'}
          flexDirection={'row'}
          padding={windowHeight * 0.019}
        >
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
              {isVaultTransfer && !isSend ? 'Vault' : 'Funds'}
            </Text>
            <Box flexDirection={'row'}>
              <Text color={'light.GreyText'} fontSize={12} letterSpacing={0.24} fontWeight={100}>
                {isVaultTransfer && !isSend ? '' : `Available to spend ${' '}`}
              </Text>
              <Box justifyContent={'center'}>
                <BTC />
              </Box>
              <Text color={'light.GreyText'} fontSize={14} letterSpacing={1.4} fontWeight={300}>
                {isVaultTransfer && defaultWallet && isSend
                  ? (defaultWallet as Wallet).specs.balances.confirmed / 10e8
                  : ''}
                {wallet ? (wallet as Wallet).specs.balances.confirmed / 10e8 : ''}
                {!isSend && isVaultTransfer ? '0.0001' : ''}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const Transaction = () => {
    return (
      <Box flexDirection={'row'} justifyContent={'space-between'} marginY={3}>
        <Text color={'light.lightBlack'} fontSize={14} fontWeight={200} letterSpacing={1.12}>
          Transaction Priority
        </Text>
        <Text color={'light.seedText'} fontSize={14} fontWeight={200} letterSpacing={0.28}>
          {/* {txFeeInfo && !isVaultTransfer ? txFeeInfo[transactionPriority].amount : '274 sats'} */}
        </Text>
      </Box>
    );
  };

  const SendingPriority = () => {
    return (
      <Box>
        <Box flexDirection={'row'} justifyContent={'space-between'}>
          <Box ml={5} mr={wp(80)}>
            <Text>Prority</Text>
          </Box>
          <Box mr={wp(80)}>
            <Text>Arrival</Text>
          </Box>
          <Box>
            <Text>Fee</Text>
          </Box>
        </Box>
        <HStack my={hp(15)}>
          <Box mr={5} ml={5}>
            <RadioButton isChecked={true} ignoresTouch />
          </Box>
          <Text mr={wp(55)}>High</Text>
          <Text mr={wp(38)}>10 - 20 minutes</Text>
          <Text>0.10 $</Text>
        </HStack>
        <HStack my={hp(15)}>
          <Box mr={5} ml={5}>
            <RadioButton isChecked={false} ignoresTouch />
          </Box>
          <Text mr={wp(35)}>Medium</Text>
          <Text mr={wp(35)}>20 - 40 minutes</Text>
          <Text>0.03 $</Text>
        </HStack>
        <HStack my={hp(15)}>
          <Box mr={5} ml={5}>
            <RadioButton isChecked={false} ignoresTouch />
          </Box>
          <Text mr={wp(60)}>Low</Text>
          <Text mr={wp(35)}>20 - 40 minutes</Text>
          <Text>0.03 $</Text>
        </HStack>
        <HStack my={hp(15)}>
          <Box mr={5} ml={5}>
            <RadioButton isChecked={false} ignoresTouch />
          </Box>
          <Text mr={wp(37)}>Custom</Text>
          <Text mr={wp(35)}>20 - 40 minutes</Text>
          <Text>0.03 $</Text>
        </HStack>
      </Box>
    );
  };

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
        <SendingCard isSend />
        <SendingCard />

        <Box marginTop={windowHeight * 0.01}>
          <Transaction />
        </Box>

        <Box>
          <SendingPriority />
        </Box>
      </Box>

      <Box position={'absolute'} bottom={windowHeight * 0.025} right={10}>
        <Buttons
          primaryText="Proceed"
          secondaryText="Cancel"
          // primaryCallback={onProceed}
          secondaryCallback={() => {
            console.log('Cancel');
          }}
        />
      </Box>
    </Box>
  );
};
export default SendConfirmation;
