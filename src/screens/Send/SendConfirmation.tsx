import React, { useContext, useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, View } from 'native-base';
import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import BTC from 'src/assets/images/svgs/btc_grey.svg';
import { crossTransfer, sendPhaseTwo } from 'src/store/sagaActions/send_and_receive';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import SigningController from './SigningController';
import { TxPriority } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import {
  getTransactionPadding,
  hp,
  windowWidth,
  wp,
} from 'src/common/data/responsiveness/responsive';

import RadioButton from 'src/components/RadioButton';
import { StyleSheet, TouchableOpacity } from 'react-native';

import useAvailableTransactionPriorities from 'src/store/hooks/sending-utils/UseAvailableTransactionPriorities';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/svgs/icon_wallet.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { windowHeight } from 'src/common/data/responsiveness/responsive';

const SendConfirmation = ({ route }) => {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { isVaultTransfer, uaiSetActionFalse, wallet } = route.params; // isVaultTransfer: switches between automated transfer and typical send
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const [transactionPriority, setTransactionPriority] = useState(TxPriority.LOW);
  const { useQuery } = useContext(RealmWrapperContext);
  const defaultWallet: Wallet = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject)[0];
  const defaultVault: Vault = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject)[0];
  const availableTransactionPriorities = useAvailableTransactionPriorities();
  const [transactionPriorities, setTransactionPriorities] = useState(
    availableTransactionPriorities
  );

  // taken from hexa --> TransactionPriority.tsx - line 98
  const setCustomTransactionPriority = () => {
    // logic for custom transaction priority
  };

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
          {txFeeInfo && !isVaultTransfer ? txFeeInfo[transactionPriority].amount : '274 sats'}
        </Text>
      </Box>
    );
  };

  const SendingPriority = () => {
    return (
      <Box flexDirection={'column'}>
        <Box flexDirection={'row'} justifyContent={'space-between'}>
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 10,
              flex: 1,
            }}
          >
            <Text style={styles.headingLabelText}>Priority</Text>
            <Text style={styles.headingLabelText}>Arrival Time</Text>
            <Text style={styles.headingLabelText}>Fsee</Text>
          </Box>
        </Box>

        {/* taken from hexa --> TransactionPriorityScreen.tsx - Line */}
        <Box my={hp(20)}>
          {availableTransactionPriorities.map((priority) => {
            return (
              <TouchableOpacity style={styles.priorityRowContainer} key={priority}>
                <Box style={styles.priorityBox}>
                  <RadioButton
                    size={20}
                    isChecked={transactionPriority == priority}
                    onpress={() => {
                      //  setTransactionPriority( priority )
                      //  onTransactionPriorityChanged( priority )
                    }}
                  />
                  <Text
                    style={{
                      ...styles.priorityTableText,
                      marginLeft: 12,
                    }}
                  >
                    {String(priority.toUpperCase())}
                  </Text>
                  <Text
                    style={{
                      ...styles.priorityTableText,
                    }}
                  >
                    ~
                  </Text>
                </Box>
              </TouchableOpacity>
            );
          })}
        </Box>
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
        onPressHandler={() => navigtaion.goBack()}
      />
      <Box marginTop={windowHeight * 0.01} marginX={7}>
        <SendingCard isSend />
        <SendingCard isSend />

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
          secondaryCallback={() => {
            console.log('Cancel');
          }}
        />
      </Box>
      <SigningController />
    </Box>
  );
};
export default SendConfirmation;

const styles = StyleSheet.create({
  headingLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    color: '#656565',
  },
  priorityRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingHorizontal: 25,
  },
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(20),
    flex: 1,
  },
  priorityTableText: {
    fontSize: 12,
    textAlign: 'right',
  },
});
