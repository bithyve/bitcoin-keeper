import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
  calculateCustomFee,
  calculateSendMaxFee,
  crossTransfer,
  sendPhaseTwo,
} from 'src/store/sagaActions/send_and_receive';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import BTC from 'src/assets/images/btc_grey.svg';
import BitcoinUnit from 'src/common/data/enums/BitcoinUnit';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import RadioButton from 'src/components/RadioButton';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import { TxPriority } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/icon_wallet.svg';
import VaultIcon from 'src/assets/images/icon_vault2.svg';

import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import { crossTransferReset, sendPhaseTwoReset } from 'src/store/reducers/send_and_receive';
import { timeConvertNear30 } from 'src/common/utilities';
import { useAppSelector } from 'src/store/hooks';
import useAvailableTransactionPriorities from 'src/store/hooks/sending-utils/UseAvailableTransactionPriorities';
import { useDispatch } from 'react-redux';
import useFormattedAmountText from 'src/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from 'src/hooks/formatting/UseFormattedUnitText';
import KeeperModal from 'src/components/KeeperModal';
import { TransferType } from 'src/common/data/enums/TransferType';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import CustomPriorityModal from './CustomPriorityModal';

const customFeeOptionTransfers = [
  TransferType.VAULT_TO_ADDRESS,
  TransferType.VAULT_TO_WALLET,
  TransferType.WALLET_TO_WALLET,
  TransferType.WALLET_TO_ADDRESS,
];

const vaultTransfers = [TransferType.WALLET_TO_VAULT];
const walletTransfers = [TransferType.VAULT_TO_WALLET, TransferType.WALLET_TO_WALLET];
const internalTransfers = [TransferType.VAULT_TO_VAULT];

function SendConfirmation({ route }) {
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const {
    sender,
    recipient,
    address,
    amount,
    walletId,
    transferType,
    uaiSetActionFalse,
  }: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    address: string;
    amount: number;
    walletId: string;
    uiMetaData: any;
    transferType: TransferType;
    uaiSetActionFalse: any;
  } = route.params;

  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const { isSuccessful: crossTransferSuccess, hasFailed: crossTransferFailed } = useAppSelector(
    (state) => state.sendAndReceive.crossTransfer
  );
  const { inProgress } = useAppSelector((state) => state.sendAndReceive.sendPhaseTwo);

  const [transactionPriority, setTransactionPriority] = useState(TxPriority.LOW);
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const sourceWallet = wallets.find((item) => item.id === walletId);
  const defaultVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const availableTransactionPriorities = useAvailableTransactionPriorities();
  const [transactionPriorities, setTransactionPriorities] = useState(
    availableTransactionPriorities
  );

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const walletTransactions = translations.wallet;

  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleTransVaultModal, setVisibleTransVaultModal] = useState(false);
  const [title, setTitle] = useState('Sending to address');
  const [subTitle, setSubTitle] = useState('Choose priority and fee');

  useEffect(() => {
    if (vaultTransfers.includes(transferType)) {
      setTitle('Sending to vault');
    } else if (walletTransfers.includes(transferType)) {
      setTitle('Sending to wallet');
    } else if (internalTransfers.includes(transferType)) {
      setTitle('Transfer Funds to the new vault');
      setSubTitle('On-chain transaction incurs fees');
    }
  }, []);

  function SendSuccessfulContent() {
    return (
      <View>
        <Box alignSelf="center">
          <SuccessIcon />
        </Box>
        <Text color="light.greenText" fontSize={13} padding={2}>
          You can view the confirmation status of the transaction on any block explorer or when the
          vault transaction list is refreshed
        </Text>
      </View>
    );
  }
  function ApproveTransVaultContent() {
    return (
      <>
        <View style={{ marginVertical: 25 }}>
          <Text color="light.greenText" fontSize={13} py={3}>
            Once approved, bitcoin will be transferred from the wallets to the vault for safekeeping
          </Text>
          <Text color="light.greenText" fontSize={13} py={3}>
            You can change the policy that triggers auto-transfer to suit your needs
          </Text>
        </View>
        <Buttons
          secondaryText="Remind me Later"
          secondaryCallback={() => {
            setVisibleTransVaultModal(false);
          }}
          primaryText="Transfer Now"
          primaryCallback={() => onTransferNow()}
          paddingHorizontal={wp(20)}
        />
      </>
    );
  }

  useEffect(() => {
    if (transferType === TransferType.WALLET_TO_VAULT) {
      dispatch(calculateSendMaxFee({ numberOfRecipients: 1, wallet: sourceWallet }));
    }
  }, []);

  const onTransferNow = () => {
    setVisibleTransVaultModal(false);
    dispatch(
      crossTransfer({
        sender: sourceWallet,
        recipient: defaultVault,
        amount: sourceWallet.specs.balances.confirmed - sendMaxFee,
      })
    );
  };

  const onProceed = () => {
    if (transferType === TransferType.WALLET_TO_VAULT) {
      if (sourceWallet.specs.balances.confirmed < sourceWallet.transferPolicy.threshold) {
        showToast('Not enough Balance', <ToastErrorIcon />);
        return;
      }
      if (defaultVault) {
        setVisibleTransVaultModal(true);
      }
    } else {
      dispatch(
        sendPhaseTwo({
          wallet: sender,
          txnPriority: transactionPriority,
        })
      );
    }
  };

  useEffect(
    () => () => {
      dispatch(sendPhaseTwoReset());
      dispatch(crossTransferReset());
    },
    []
  );

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
    setVisibleModal(false);
    if (vaultTransfers.includes(transferType)) {
      const navigationState = {
        index: 1,
        routes: [{ name: 'NewHome' }, { name: 'VaultDetails', params: { autoRefresh: true } }],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    }
    const navigationState = {
      index: 1,
      routes: [{ name: 'NewHome' }, { name: 'WalletDetails', params: { autoRefresh: true } }],
    };
    navigation.dispatch(CommonActions.reset(navigationState));
  };

  useEffect(() => {
    if (walletSendSuccessful) {
      setVisibleModal(true);
    }
  }, [walletSendSuccessful]);

  useEffect(() => {
    if (crossTransferSuccess) {
      setVisibleModal(true);
      if (uaiSetActionFalse) {
        uaiSetActionFalse();
      }
    }
  }, [crossTransferSuccess]);

  function Card({ title, subTitle, isVault = false }) {
    return (
      <Box
        borderRadius={10}
        backgroundColor="light.primaryBackground"
        flexDirection="row"
        padding={windowHeight * 0.019}
      >
        <Box
          backgroundColor="light.accent"
          height={10}
          width={10}
          borderRadius={20}
          justifyContent="center"
          alignItems="center"
        >
          {isVault ? <VaultIcon /> : <WalletIcon />}
        </Box>
        <Box marginLeft={3}>
          <Text
            color="light.sendCardHeading"
            fontSize={14}
            letterSpacing={1.12}
            numberOfLines={1}
            maxWidth={200}
          >
            {title}
          </Text>
          <Box flexDirection="row">{subTitle}</Box>
        </Box>
      </Box>
    );
  }

  function SendingCard({ isSend }) {
    const getCardDetails = () => {
      switch (transferType) {
        case TransferType.VAULT_TO_VAULT:
          return isSend ? (
            <Card title="Old Vault" subTitle="Moving all funds" isVault />
          ) : (
            <Card
              title="New Vault"
              subTitle={`Created on ${moment(new Date()).format('DD MMM YYYY')}`}
              isVault
            />
          );
        case TransferType.VAULT_TO_WALLET:
          return isSend ? (
            <Card
              title="Vault"
              subTitle={`Available: ${sender.specs.balances.confirmed} sats`}
              isVault
            />
          ) : (
            <Card
              title={recipient?.presentationData.name}
              subTitle={`Transferring: ${amount} sats`}
            />
          );
        case TransferType.VAULT_TO_ADDRESS:
          return isSend ? (
            <Card title="Vault" subTitle={`${amount} sats`} isVault />
          ) : (
            <Card title={address} subTitle={`${amount} sats`} />
          );
        case TransferType.WALLET_TO_WALLET:
          return isSend ? (
            <Card
              title={sender?.presentationData.name}
              subTitle={`Available: ${sender?.specs.balances.confirmed} sats`}
            />
          ) : (
            <Card
              title={recipient?.presentationData.name}
              subTitle={`Transferring: ${amount} sats`}
            />
          );
        case TransferType.WALLET_TO_VAULT:
          return isSend ? (
            <Card
              title={sourceWallet.presentationData.name}
              subTitle={`Available balance: ${sourceWallet.specs.balances.confirmed} sats`}
            />
          ) : (
            <Card title="Vault" subTitle="Transferrings all avaiable funds" isVault />
          );
        case TransferType.WALLET_TO_ADDRESS:
          return isSend ? (
            <Card
              title={sender?.presentationData.name}
              subTitle={`Available balance: ${sender.specs.balances.confirmed} sats`}
            />
          ) : (
            <Card title={address} subTitle={`Transferring: ${amount} sats`} />
          );
      }
    };
    return (
      <Box marginY={windowHeight * 0.01}>
        <Text
          color="light.primaryText"
          fontSize={14}
          letterSpacing={1.12}
          marginY={windowHeight * 0.011}
        >
          {isSend ? 'Sending From' : 'Sending To'}
        </Text>
        {getCardDetails()}
      </Box>
    );
  }

  function Transaction() {
    return (
      <Box flexDirection="row" justifyContent="space-between" marginY={3}>
        <Text color="light.primaryText" fontSize={14} letterSpacing={1.12}>
          Transaction Priority
        </Text>
        <Text color="light.GreyText" fontSize={14} letterSpacing={0.28}>
          {txFeeInfo[transactionPriority?.toLowerCase()]?.amount} sats
        </Text>
      </Box>
    );
  }

  function TextValue({ amt, unit }) {
    return (
      <Text
        style={{
          ...styles.priorityTableText,
          flex: 1,
        }}
      >{`${useFormattedAmountText(amt)} ${useFormattedUnitText(unit)}`}</Text>
    );
  }

  function SendingPriority() {
    return (
      <Box flexDirection="column">
        <Transaction />
        <Box flexDirection="row" justifyContent="space-between">
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
          {availableTransactionPriorities?.map((priority) => (
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
                  isChecked={transactionPriority === priority}
                  borderColor="#E3E3E3"
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
          ))}
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
                isChecked={transactionPriority===TxPriority.CUSTOM} />

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
  }

  function CustomPriorityBox() {
    const [visible, setModalVisible] = useState(false);

    const open = () => {
      setModalVisible(true);
    };
    const close = () => setModalVisible(false);

    return (
      <Box>
        <TouchableOpacity onPress={open}>
          <Box
            flexDirection="row"
            rounded="lg"
            background="light.primaryBackground"
            justifyContent="space-between"
            alignItems="center"
            marginTop={hp(10)}
            mx={wp(29)}
            textAlign="center"
            px="2"
            py="2"
          >
            <Text
              style={styles.customPriority}
              color="light.greenText2"
              fontSize={12}
              bold
              padding={2}
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
          buttonCallback={(customFeePerByte, customEstimatedBlocks) => {
            dispatch(
              calculateCustomFee({
                wallet: sender,
                recipients: [recipient],
                feePerByte: customFeePerByte,
                customEstimatedBlocks,
              })
            );
          }}
          network={(sender as Wallet).networkType}
        />
      </Box>
    );
  }

  function FeeInfo() {
    return (
      <HStack width={windowWidth * 0.75} justifyContent="space-between" alignItems="center">
        <VStack>
          <Text
            color="light.primaryText"
            fontSize={14}
            letterSpacing={1.12}
            marginTop={windowHeight * 0.011}
          >
            Fees
          </Text>
          <Text color="light.primaryText" fontSize={12} letterSpacing={1.12} light>
            ~ 10 - 30 mins
          </Text>
        </VStack>
        <Text
          color="light.primaryText"
          fontSize={14}
          letterSpacing={1.12}
          marginTop={windowHeight * 0.011}
        >
          <BTC />
          {transferType === TransferType.WALLET_TO_VAULT
            ? sendMaxFee
            : txFeeInfo[transactionPriority?.toLowerCase()]?.amount}
        </Text>
      </HStack>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderTitle title={title} subtitle={subTitle} paddingTop={hp(5)} />
      <Box marginTop={windowHeight * 0.01} marginX={7}>
        <SendingCard isSend />
        <SendingCard isSend={false} />
        <Box marginTop={windowHeight * 0.01}>
          {customFeeOptionTransfers.includes(transferType) ? <SendingPriority /> : <FeeInfo />}
        </Box>
      </Box>
      <Box style={styles.noteBox}>
        {transferType === TransferType.VAULT_TO_VAULT ? (
          <Note
            title="Note"
            subtitle="Old Vaults with the previous signing device configuration will be in the archived list of vaults"
          />
        ) : null}
      </Box>
      <Box position="absolute" bottom={windowHeight > 800 ? windowHeight * 0.025 : 2} right={10}>
        <Buttons
          primaryText="Proceed"
          secondaryText="Cancel"
          secondaryCallback={() => {
            navigation.navigate('NewHome');
          }}
          primaryCallback={onProceed}
          primaryLoading={inProgress}
        />
      </Box>
      <KeeperModal
        visible={visibleModal}
        close={() => viewDetails()}
        title={walletTransactions.SendSuccess}
        subTitle="The transaction has been successfully broadcasted"
        buttonText={walletTransactions.ViewDetails}
        buttonCallback={() => viewDetails()}
        textcolor="light.greenText"
        buttonTextColor="light.white"
        Content={SendSuccessfulContent}
      />
      <KeeperModal
        visible={visibleTransVaultModal}
        close={() => setVisibleTransVaultModal(false)}
        title={walletTransactions.approveTransVault}
        subTitle={walletTransactions.approveTransVaultSubtitle}
        textcolor="light.greenText"
        Content={ApproveTransVaultContent}
      />
    </ScreenWrapper>
  );
}
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
  noteBox: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: hp(40),
  },
  customPriority: {
    fontStyle: 'italic',
  },
});
