import { Box, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { crossTransfer, sendPhaseTwo, sendingFailed } from 'src/store/sagaActions/send_and_receive';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';

import ArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';
import BTC from 'src/assets/images/svgs/btc_grey.svg';
import BitcoinUnit from 'src/common/data/enums/BitcoinUnit';
import Buttons from 'src/components/Buttons';
import CustomPriorityModal from './CustomPriorityModal';
import Header from 'src/components/Header';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import RadioButton from 'src/components/RadioButton';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import StatusBarComponent from 'src/components/StatusBarComponent';
import SuccessIcon from 'src/assets/images/svgs/successSvg.svg';
import SuccessModal from 'src/components/HealthCheck/SuccessModal';
import Transactions from './Transactions';
import { TxPriority } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/svgs/icon_wallet.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { sendPhaseTwoReset } from 'src/store/reducers/send_and_receive';
import { timeConvertNear30 } from 'src/common/utilities';
import { useAppSelector } from 'src/store/hooks';
import useAvailableTransactionPriorities from 'src/store/hooks/sending-utils/UseAvailableTransactionPriorities';
import { useDispatch } from 'react-redux';
import useFormattedAmountText from 'src/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from 'src/hooks/formatting/UseFormattedUnitText';
import { getAmount } from 'src/common/constants/Bitcoin';

const SendConfirmation = ({ route }) => {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { isVaultTransfer, uaiSetActionFalse, wallet } = route.params; // isVaultTransfer: switches between automated transfer and typical send
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const [transactionPriority, setTransactionPriority] = useState(TxPriority.LOW);
  const { useQuery } = useContext(RealmWrapperContext);
  const defaultWallet: Wallet = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject)[0];
  const defaultVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const availableTransactionPriorities = useAvailableTransactionPriorities();
  const [transactionPriorities, setTransactionPriorities] = useState(
    availableTransactionPriorities
  );
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  const walletTransactions = translations['wallet'];

  // // Sending process is still not executed
  // const [sendingModal, setSendingModal] = useState(false);
  // const openSendModal = () => setSendingModal(true);
  // const closeSendModal = () => setSendingModal(false);

  // // Send is Successful
  // const [visible, setVisible] = useState(false);
  // const open = () => setVisible(true);
  // const close = () => setVisible(false);

  // // Send Failed
  // const [sendFailed, setSendFailed] = useState(false);
  // const openFailedModal = () => setSendFailed(true);
  // const closeFailModal = () => setSendFailed(false);

  // const closeAllModal = () => {
  //   closeFailModal();
  //   close()
  //   closeSendModal()
  // }

  const SendSuccessfulContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>
          <SuccessIcon />
        </Box>
        <Text color={'#5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
        <Text color={'5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {
            'To get started, you need to add a Signer (hardware wallet or a signer device) to Keeper'
          }
        </Text>
      </View>
    );
  };

  // const openLoaders = () => {
  //   setTimeout(() => {
  //     closeAllModal();
  //     openSendModal();
  //   }, 2000);
  // };

  const onProceed = () => {
    // closeAllModal();
    if (isVaultTransfer) {
      if (uaiSetActionFalse) {
        uaiSetActionFalse();
      }
      // openSendModal();
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
      // openLoaders();
      dispatch(
        sendPhaseTwo({
          wallet,
          txnPriority: transactionPriority,
        })
      );
    }
  };

  useEffect(() => {
    return () => {
      dispatch(sendPhaseTwoReset());
    };
  }, []);

  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );

  const walletSendSuccessful = useAppSelector((state) => state.sendAndReceive.sendPhaseTwo.txid);
  const sendHasFailed = useAppSelector(
    (state) =>
      state.sendAndReceive.sendPhaseOne.hasFailed || state.sendAndReceive.sendPhaseTwo.hasFailed
  );
  const failedMsg = useAppSelector(
    (state) =>
      state.sendAndReceive.sendPhaseOne.failedErrorMessage ||
      state.sendAndReceive.sendPhaseTwo.failedErrorMessage
  );

  const navigation = useNavigation();

  useEffect(() => {
    if (serializedPSBTEnvelops && serializedPSBTEnvelops.length) {
      navigation.dispatch(CommonActions.navigate('SignTransactionScreen'));
    }
  }, [serializedPSBTEnvelops]);

  const viewDetails = () => {
    // close();
    navigation.navigate('WalletDetails');
  };

  // useEffect(() => {
  //   if (sendHasFailed) {
  //     closeSendModal();
  //     openFailedModal();
  //   }
  // }, [sendHasFailed]);

  useEffect(() => {
    if (walletSendSuccessful) {
      viewDetails();
    }
  }, [walletSendSuccessful]);

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
                  ? getAmount((defaultWallet as Wallet).specs.balances.confirmed)
                  : ''}
                {wallet ? getAmount((wallet as Wallet).specs.balances.confirmed) : ''}
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
          {txFeeInfo && !isVaultTransfer
            ? txFeeInfo[transactionPriority?.toLowerCase()]?.amount
            : '274 sats'}
        </Text>
      </Box>
    );
  };

  const TextValue = ({ amt, unit }) => {
    return (
      <Text
        style={{
          ...styles.priorityTableText,
          flex: 1,
        }}
      >{`${useFormattedAmountText(amt)} ${useFormattedUnitText(unit)}`}</Text>
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
                  setTransactionPriority(priority);
                  // onTransactionPriorityChanged(priority)
                }}
              >
                <Box style={styles.priorityBox}>
                  <RadioButton
                    size={20}
                    isChecked={transactionPriority == priority}
                    borderColor={'#E3E3E3'}
                    onpress={() => {
                      setTransactionPriority(priority);
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
                <Text
                  style={{
                    ...styles.priorityTableText,
                    flex: 1,
                  }}
                >
                  ~
                  {timeConvertNear30(
                    (txFeeInfo[priority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation + 1) * 10
                  )}
                </Text>
                <TextValue
                  amt={txFeeInfo[priority?.toLowerCase()]?.amount}
                  unit={{
                    bitcoinUnit: BitcoinUnit.SATS,
                  }}
                />
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

  const CustomPriorityBox = () => {
    const [visible, setModalVisible] = useState(false);

    const open = () => {
      setModalVisible(true);
    };
    const close = () => setModalVisible(false);

    return (
      <Box>
        <TouchableOpacity onPress={open}>
          <Box
            flexDirection={'row'}
            rounded="lg"
            background={'#FDF7F0'}
            justifyContent={'space-between'}
            alignItems={'center'}
            marginTop={hp(10)}
            mx={wp(29)}
            textAlign={'center'}
            px="2"
            py="2"
          >
            <Text
              fontStyle={'italic'}
              color={'#00715B'}
              fontSize={12}
              fontFamily={'body'}
              fontWeight={'300'}
              p={2}
            >
              Custom Priority
            </Text>
            <ArrowIcon />
          </Box>
        </TouchableOpacity>
        <CustomPriorityModal
          visible={visible}
          close={close}
          title="Custom Priority"
          subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          info="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et "
          buttonText="Confirm"
        />
      </Box>
    );
  };

  // const handleCustomPriority = () => {
  //   const { translations } = useContext(LocalizationContext);
  //   const vault = translations['vault'];
  //   const common = translations['common'];

  //   return (
  //     <CustomPriorityModal
  //       visible={visible}
  //       title={vault.CustomPriority}
  //       subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
  //       info="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et "
  //       close={close}
  //       buttonText={common.confirm}
  //     />
  //   );
  // };

  return (
    <Box
      padding={windowHeight * 0.01}
      paddingX={5}
      background={'light.ReceiveBackground'}
      flexGrow={1}
      flex={1}
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
        <Box marginTop={windowHeight * 0.01}>
          <Transaction />
        </Box>

        <Box>
          <SendingPriority />
        </Box>

        <Box flexDirection={'row'} justifyContent={'space-between'}>
          <Text
            color={'light.lightBlack'}
            fontSize={14}
            fontWeight={200}
            letterSpacing={0.24}
            width={wp(48)}
            noOfLines={2}
          >
            Total Amount
          </Text>
          <Text color={'light.sendCardHeading'} fontSize={24} fontWeight={200} letterSpacing={0.24}>
            0.024
          </Text>
        </Box>
      </Box>

      <CustomPriorityBox />

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

      {/* {showOverlay && (
        <View
          height={windowHeight}
          width={windowWidth}
          zIndex={99}
          opacity={0.4}
          bg={'#000'}
          position={'absolute'}
        ></View>
      )} */}
      {/* <KeeperModal
        visible={visible}
        close={close}
        title={walletTransactions.SendSuccess}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
        buttonText={walletTransactions.ViewDetails}
        textColor={'#073B36'}
        buttonTextColor={'#FAFAFA'}
        cancelButtonText={common.cancel}
        cancelButtonColor={'#073E39'}
        Content={SendSuccessfulContent}
        buttonPressed={viewDetails}
      />

      <KeeperModal
        visible={sendingModal}
        close={closeSendModal}
        title={'Send Loader'}
        subTitle={'Sending...'}
        textColor={'#073B36'}
        dismissible={false}
        showButtons={false}
        // Content={SendSuccessfulContent}
      />

      <KeeperModal
        visible={sendFailed}
        close={closeFailModal}
        title={'Sending Failed'}
        subTitle={failedMsg}
        textColor={'#073B36'}
        // Content={SendSuccessfulContent}
      /> */}
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
