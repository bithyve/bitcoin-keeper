import React, { useContext, useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, View } from 'native-base';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Header from 'src/components/Header';
import Buttons from 'src/components/Buttons';
import BTC from 'src/assets/images/svgs/btc_grey.svg';
import { crossTransfer, sendPhaseTwo } from 'src/store/sagaActions/send_and_receive';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import SigningController from './SigningController';
import { TxPriority } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import {
  hp,
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
import { timeConvertNear30 } from 'src/common/utilities';
import BitcoinUnit from 'src/common/data/enums/BitcoinUnit';
import useFormattedAmountText from 'src/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from 'src/hooks/formatting/UseFormattedUnitText';

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
        {/* <Text color={'light.seedText'} fontSize={14} fontWeight={200} letterSpacing={0.28}>
          {txFeeInfo && !isVaultTransfer ? txFeeInfo[transactionPriority?.toLowerCase()]?.amount : '274 sats'}
        </Text> */}
      </Box>
    );
  };

  const TextValue = ({ amt, unit }) => {
    return (
      <Text style={{
        ...styles.priorityTableText,
        flex: 1,
      }}>{`${useFormattedAmountText(amt)} ${useFormattedUnitText(unit)}`}</Text>
    )
  }
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
            <Text style={styles.headingLabelText} ml={wp(13)}>
              Priority
            </Text>
            <Text style={styles.headingLabelText}>Arrival Time</Text>
            <Text style={styles.headingLabelText}>Fees</Text>
          </Box>
        </Box>

        {/* taken from hexa --> TransactionPriorityScreen.tsx - Line */}
        <Box mt={hp(1)}>
          {availableTransactionPriorities?.map((priority) => {
            return (
              <TouchableOpacity
                style={styles.priorityRowContainer}
                key={priority}
                onPress={() => {
                  setTransactionPriority(priority)
                  // onTransactionPriorityChanged(priority)
                }}>
                <Box style={styles.priorityBox}>
                  <RadioButton
                    size={20}
                    isChecked={transactionPriority == priority}
                    borderColor={'#E3E3E3'}
                    onpress={() => {
                      setTransactionPriority(priority)
                      // onTransactionPriorityChanged(priority)
                    }}
                  />

                  <Text
                    style={{
                      ...styles.priorityTableText,
                      marginLeft: 12,
                      fontStyle: 'normal',
                    }}
                  >
                    {String(priority)}
                  </Text>
                </Box>
                <Text style={{
                  ...styles.priorityTableText,
                  flex: 1,
                }}>
                  ~
                  {timeConvertNear30(
                    (txFeeInfo[priority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation + 1)
                    * 10
                  )}
                </Text>
                <TextValue amt={txFeeInfo[priority?.toLowerCase()]?.amount} unit={{
                  bitcoinUnit: BitcoinUnit.SATS,
                }} />
              </TouchableOpacity>
            );
          })}
          {/* {Disable custom priority for now } */}

          {/* <TouchableOpacity
            style={styles.customPriorityRowContainer}
            onPress={() => {
              setTransactionPriority(TxPriority.CUSTOM)
              //  onTransactionPriorityChanged( priority )
            }}
          >
            <Box style={styles.priorityBox}>
              <RadioButton
                size={20}
                borderColor={'#E3E3E3'}
                onpress={() => {
                  setTransactionPriority(TxPriority.CUSTOM)
                  //  onTransactionPriorityChanged( priority )
                }}
                isChecked={transactionPriority == TxPriority.CUSTOM} />

              <Text
                style={{
                  ...styles.priorityTableText,
                  marginLeft: 12,
                  fontStyle: 'normal',
                }}
              >
                Custom Priority
              </Text>
            </Box>
            <Text style={{
              ...styles.priorityTableText,
              flex: 1,
            }}>
              ~
              {timeConvertNear30(
                (txFeeInfo[TxPriority?.CUSTOM?.toLowerCase()]?.estimatedBlocksBeforeConfirmation + 1)
                * 10
              )}
            </Text>
            <TextValue amt={txFeeInfo[TxPriority?.CUSTOM?.toLowerCase()]?.amount} unit={{
              bitcoinUnit: BitcoinUnit.SATS,
            }} />
          </TouchableOpacity> */}
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
      <Box marginLeft={3}>
        <Header
          title="Sending to address"
          subtitle="Lorem ipsum dolor sit amet,"
          onPressHandler={() => navigtaion.goBack()}
        />
      </Box>
      <Box marginTop={windowHeight * 0.01} marginX={7}>
        <SendingCard isSend />
        <SendingCard isSend={false} />

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
          primaryCallback={onProceed}
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
    fontWeight: '500',
    textAlign: 'center',
    color: '#656565',
  },
  priorityRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    paddingHorizontal: 12,
    borderBottomColor: 'rgba(0, 85, 69, 0.15)',
  },
  customPriorityRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(14),
    flex: 1,
  },
  priorityTableText: {
    fontSize: 10,
    textAlign: 'right',
    color: '#656565',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});
