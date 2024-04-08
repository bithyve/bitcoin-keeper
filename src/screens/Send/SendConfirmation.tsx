import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, View, useColorMode, ScrollView, HStack } from 'native-base';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
  calculateSendMaxFee,
  crossTransfer,
  sendPhaseTwo,
} from 'src/store/sagaActions/send_and_receive';
import moment from 'moment';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { TxPriority } from 'src/services/wallets/enums';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/wallet_hexa.svg';
import VaultIcon from 'src/assets/images/wallet_vault.svg';
import BTC from 'src/assets/images/btc_grey.svg';
import LabelImg from 'src/assets/images/labels.svg';
import {
  crossTransferReset,
  customPrioritySendPhaseOneReset,
  sendPhaseTwoReset,
} from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import useAvailableTransactionPriorities from 'src/store/hooks/sending-utils/UseAvailableTransactionPriorities';
import { useDispatch } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { TransferType } from 'src/models/enums/TransferType';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useWallets from 'src/hooks/useWallets';
import { whirlPoolWalletTypes } from 'src/services/wallets/factories/WalletFactory';
import useVault from 'src/hooks/useVault';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';

import { UTXO } from 'src/services/wallets/interfaces';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import SignerCard from '../AddSigner/SignerCard';
import AddCard from 'src/components/AddCard';
import CustomPriorityModal from './CustomPriorityModal';
import LoginMethod from 'src/models/enums/LoginMethod';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import CurrencyInfo from '../Home/components/CurrencyInfo';

const vaultTransfers = [TransferType.WALLET_TO_VAULT];
const walletTransfers = [TransferType.VAULT_TO_WALLET, TransferType.WALLET_TO_WALLET];
const internalTransfers = [TransferType.VAULT_TO_VAULT];

function Card({ title, subTitle, isVault = false, showFullAddress = false }) {
  const { colorMode } = useColorMode();
  return (
    <Box
      borderRadius={10}
      backgroundColor={`${colorMode}.seashellWhite`}
      flexDirection="row"
      paddingLeft={3}
      alignItems={'center'}
      minHeight={hp(70)}
    >
      <Box justifyContent="center" alignItems="center">
        {isVault ? <VaultIcon /> : <WalletIcon />}
      </Box>
      <Box marginLeft={3}>
        <Text numberOfLines={showFullAddress ? 2 : 1} style={styles.cardTitle}>
          {title}
        </Text>
        {!showFullAddress && (
          <Text numberOfLines={1} style={styles.cardSubtitle}>
            {subTitle}
          </Text>
        )}
      </Box>
    </Box>
  );
}

function SendingCard({
  isSend,
  currentCurrency,
  currencyCode,
  sender,
  recipient,
  address,
  amount,
  transferType,
  getBalance,
  getSatUnit,
}) {
  const { colorMode } = useColorMode();
  const getCurrencyIcon = () => {
    if (currentCurrency === CurrencyKind.BITCOIN) {
      return '₿';
    }
    return currencyCode;
  };

  const getCardDetails = () => {
    switch (transferType) {
      case TransferType.VAULT_TO_VAULT:
        return isSend ? (
          <Card title="Old vault" subTitle="Moving all funds" isVault />
        ) : (
          <Card
            title="New vault"
            subTitle={`Created on ${moment(new Date()).format('DD MMM YYYY')}`}
            isVault
          />
        );
      case TransferType.VAULT_TO_WALLET:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available: ${getCurrencyIcon()} ${getBalance(
              sender.specs.balances.confirmed
            )} ${getSatUnit()}`}
            isVault
          />
        ) : (
          <Card
            title={recipient?.presentationData?.name || address}
            subTitle={`Transferring: ${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
          />
        );
      case TransferType.VAULT_TO_ADDRESS:
        return isSend ? (
          <Card
            title="Vault"
            subTitle={`${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
            isVault
          />
        ) : (
          <Card
            title={address}
            subTitle={`${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
          />
        );
      case TransferType.WALLET_TO_WALLET:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available: ${getCurrencyIcon()} ${getBalance(
              sender?.specs?.balances?.confirmed || 0
            )} ${getSatUnit()}`}
          />
        ) : (
          <Card
            title={recipient?.presentationData?.name || address}
            subTitle={`Transferring: ${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
          />
        );
      case TransferType.WALLET_TO_VAULT:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available balance: ${getCurrencyIcon()} ${getBalance(
              sender?.specs?.balances?.confirmed || 0
            )}${getSatUnit()}`}
          />
        ) : (
          <Card title="Vault" subTitle="Transferrings all avaiable funds" isVault />
        );
      case TransferType.WALLET_TO_ADDRESS:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available balance: ${getCurrencyIcon()} ${getBalance(
              sender?.specs?.balances?.confirmed || 0
            )} ${getSatUnit()}`}
          />
        ) : (
          <Card
            title={address}
            subTitle={`Transferring: ${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
            showFullAddress={true}
          />
        );
    }
  };
  return (
    <Box marginY={windowHeight > 570 ? windowHeight * 0.01 : 0}>
      <Text color={`${colorMode}.primaryText`} style={styles.sendingFromText}>
        {isSend ? 'Sending From' : 'Sending To'}
      </Text>
      {getCardDetails()}
    </Box>
  );
}

function Transaction({ txFeeInfo, transactionPriority }) {
  const { colorMode } = useColorMode();
  return (
    <Box flexDirection="row" justifyContent="space-between" marginY={windowHeight > 570 ? 3 : 1}>
      <Text color={`${colorMode}.primaryText`} fontSize={14} letterSpacing={1.12}>
        Transaction Priority
      </Text>
      <Text color={`${colorMode}.GreyText`} fontSize={14} letterSpacing={0.28}>
        {txFeeInfo[transactionPriority?.toLowerCase()]?.amount} sats
      </Text>
    </Box>
  );
}

function TextValue({ amt, getValueIcon, inverted = false }) {
  return (
    <Text
      style={{
        ...styles.priorityTableText,
      }}
    >
      {amt} {getValueIcon() === 'sats' ? 'sats' : '$'}
    </Text>
  );
}

function SendingPriority({
  txFeeInfo,
  transactionPriority,
  setTransactionPriority,
  availableTransactionPriorities,
  setVisibleCustomPriorityModal,
  getBalance,
  getSatUnit,
}) {
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Box flexDirection={'row'}>
        {availableTransactionPriorities?.map((priority) => {
          if (txFeeInfo[priority?.toLowerCase()].estimatedBlocksBeforeConfirmation !== 0) {
            return (
              <TouchableOpacity
                key={priority}
                onPress={() => {
                  setTransactionPriority(priority);
                }}
              >
                <Box>
                  <SignerCard
                    titleComp={
                      <TextValue
                        amt={getBalance(txFeeInfo[priority?.toLowerCase()]?.amount)}
                        getValueIcon={getSatUnit}
                      />
                    }
                    isSelected={transactionPriority === priority}
                    key={priority}
                    name={String(priority)}
                    description={`~${
                      txFeeInfo[priority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation * 10
                    } mins`}
                    numberOfLines={2}
                    onCardSelect={() => setTransactionPriority(priority)}
                    customStyle={{
                      width: windowWidth / 3.4 - windowWidth * 0.05,
                      height: 135,
                      opacity: transactionPriority === priority ? 1 : 0.5,
                    }}
                    colorMode={colorMode}
                  />
                </Box>
              </TouchableOpacity>
            );
          }
        })}
      </Box>
      <AddCard
        cardStyles={{ width: windowWidth / 3.4 - windowWidth * 0.05, marginTop: 5 }}
        name="Custom Priority"
        callback={setVisibleCustomPriorityModal}
      />
    </Box>
  );
}

// function FeeInfo({ txFeeInfo, transactionPriority, transferType, sendMaxFee }) {
//   return (
//     <HStack width={windowWidth * 0.75} justifyContent="space-between" alignItems="center">
//       <VStack>
//         <Text
//           color={`${colorMode}.primaryText`}
//           fontSize={14}
//           letterSpacing={1.12}
//           marginTop={windowHeight * 0.011}
//         >
//           Fees
//         </Text>
//         <Text color={`${colorMode}.primaryText`} fontSize={12} letterSpacing={1.12} light>
//           ~ 10 - 30 mins
//         </Text>
//       </VStack>
//       <Text
//         color={`${colorMode}.primaryText`}
//         fontSize={14}
//         letterSpacing={1.12}
//         marginTop={windowHeight * 0.011}
//       >
//         <BTC />
//         &nbsp;
//         {transferType === TransferType.WALLET_TO_VAULT
//           ? sendMaxFee
//           : txFeeInfo[transactionPriority?.toLowerCase()]?.amount}
//       </Text>
//     </HStack>
//   );
// }

function SendSuccessfulContent({ transactionPriority, amount, sender, recipient, getSatUnit }) {
  const { colorMode } = useColorMode();
  const { getBalance } = useBalance();
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const currencyCode = useCurrencyCode();

  const getCurrencyIcon = () => {
    if (currentCurrency === CurrencyKind.BITCOIN) {
      return '₿';
    }
    return currencyCode;
  };

  return (
    <View>
      <Box flexDirection={'row'}>
        <Box width={'50%'} marginRight={2}>
          <Text>Sent To</Text>
          <Card
            isVault={recipient.entityKind === 'WALLET' ? false : true}
            title={recipient?.presentationData?.name}
          />
        </Box>
        <Box width={'50%'}>
          <Text>Sent From</Text>
          <Card
            isVault={recipient.entityKind === 'WALLET' ? false : true}
            title={sender?.presentationData?.name}
            subTitle={`${getCurrencyIcon()} ${getBalance(
              sender.specs.balances.confirmed
            )} ${getSatUnit()}`}
          />
        </Box>
      </Box>
      <AmountDetails title={walletTransactions.totalAmount} satsAmount={getBalance(amount)} />
      <AmountDetails
        title={walletTransactions.totalFees}
        satsAmount={getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount)}
      />
      <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
      <AmountDetails
        title={walletTransactions.total}
        satsAmount={getBalance(amount + txFeeInfo[transactionPriority?.toLowerCase()]?.amount)}
        fontSize={17}
        fontWeight={'400'}
      />
      {/* TODO For Lableling */}
      {/* <AddLabel /> */}

      <Text color={`${colorMode}.greenText`} fontSize={13} padding={2} marginTop={5}>
        {walletTransactions.sendTransSuccessMsg}
      </Text>
    </View>
  );
}

function ApproveTransVaultContent({ setVisibleTransVaultModal, onTransferNow }) {
  const { colorMode } = useColorMode();
  return (
    <>
      <View style={{ marginVertical: 25 }}>
        <Text color={`${colorMode}.greenText`} fontSize={13} py={3}>
          Once approved, bitcoin will be transferred from the wallets to the vault for safekeeping
        </Text>
        <Text color={`${colorMode}.greenText`} fontSize={13} py={3}>
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
function TransactionPriorityDetails({
  transactionPriority,
  txFeeInfo,
  getBalance,
  getCurrencyIcon,
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;

  return (
    <Box>
      <Box style={styles.transTitleWrapper}>
        <Text style={styles.transTitleText} color={`${colorMode}.primaryText`}>
          {walletTransactions.transactionPriority}
        </Text>
      </Box>
      <Box style={styles.transPriorityWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
        <HStack style={styles.priorityWrapper}>
          <Box>
            <Text style={styles.transLabelText}>{walletTransactions.PRIORITY}</Text>
            <Text style={styles.transLabelText}>{walletTransactions.ARRIVALTIME}</Text>
            <Text style={styles.transLabelText}>{walletTransactions.FEE}</Text>
          </Box>
          <Box>
            <Text style={styles.transLabelText}>{transactionPriority.toUpperCase()}</Text>
            <Text style={styles.transLabelText}>
              ~{' '}
              {txFeeInfo[transactionPriority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation *
                10}{' '}
              mins
            </Text>
            <Box>
              <Box style={styles.transSatsFeeWrapper}>
                {getCurrencyIcon(BTC, 'dark')}
                &nbsp;
                <Text color={`${colorMode}.secondaryText`} style={styles.transSatsFeeText}>
                  {getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount)}
                </Text>
              </Box>
            </Box>
          </Box>
        </HStack>
        <Box>
          <Text style={{ fontSize: 20 }}>...</Text>
        </Box>
      </Box>
    </Box>
  );
}

function AmountDetails({ title, fontSize, fontWeight, fiatAmount, satsAmount }) {
  const { getCurrencyIcon } = useBalance();

  return (
    <Box justifyContent={'space-between'} style={[styles.amountDetailsWrapper]}>
      <Box style={styles.amtDetailsTitleWrapper}>
        <Text style={[styles.amtDetailsText, { fontSize: fontSize, fontWeight: fontWeight }]}>
          {title}
        </Text>
      </Box>
      <Box style={styles.amtFiatSatsTitleWrapper}>
        <Box>
          <Text style={[styles.amtDetailsText, { fontSize: fontSize, fontWeight: fontWeight }]}>
            {fiatAmount}
          </Text>
        </Box>
      </Box>
      {satsAmount && (
        <Box style={styles.amtFiatSatsTitleWrapper}>
          <Box style={styles.currencyIcon}>
            {getCurrencyIcon(BTC, 'dark')}
            &nbsp;
            <Text style={styles.amtDetailsText}>{satsAmount}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function HighFeeAlert({ transactionPriority, txFeeInfo, amountToSend, getBalance }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;

  const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()].amount;
  return (
    <>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text style={styles.highFeeTitle}>{walletTransactions.networkFee}</Text>
        <CurrencyInfo
          amount={selectedFee}
          hideAmounts={false}
          fontSize={16}
          bold
          color={colorMode !== 'light' ? Colors.White : Colors.RichBlack}
          variation={colorMode !== 'light' ? 'light' : 'dark'}
        />
      </Box>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text style={styles.highFeeTitle}>{walletTransactions.amtBeingSent}</Text>
        <CurrencyInfo
          amount={amountToSend}
          hideAmounts={false}
          fontSize={16}
          bold
          color={colorMode !== 'light' ? Colors.White : Colors.RichBlack}
          variation={colorMode !== 'light' ? 'light' : 'dark'}
        />
      </Box>
      <Box width={'70%'}>
        <Text fontSize={13}>If not urgent, you could consider waiting for the fees to reduce</Text>
      </Box>
    </>
  );
}

function AddLabel() {
  return (
    <Box
      flexDirection={'row'}
      alignItems={'center'}
      backgroundColor={Colors.MintWhisper}
      padding={3}
      borderWidth={1}
      borderStyle={'dashed'}
      borderRadius={10}
      borderColor={Colors.GreenishBlue}
      marginTop={10}
    >
      <Box marginRight={3}>
        <LabelImg />
      </Box>
      <Box>
        <Text
          style={{ marginBottom: 3, fontWeight: 'bold', fontSize: 13 }}
          color={Colors.GreenishBlue}
        >
          Add Labels to Transaction
        </Text>
        <Box>Lorem ipsum dolor sit amet, consectetu</Box>
      </Box>
    </Box>
  );
}

function SendConfirmation({ route }) {
  const { colorMode } = useColorMode();
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
    note,
    label,
    selectedUTXOs,
  }: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    address: string;
    amount: number;
    walletId: string;
    uiMetaData: any;
    transferType: TransferType;
    uaiSetActionFalse: any;
    note: string;
    label: {
      name: string;
      isSystem: boolean;
    }[];
    selectedUTXOs: UTXO[];
  } = route.params;
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const { isSuccessful: crossTransferSuccess } = useAppSelector(
    (state) => state.sendAndReceive.crossTransfer
  );
  const [transactionPriority, setTransactionPriority] = useState(TxPriority.LOW);
  const { wallets } = useWallets({ getAll: true });
  const sourceWallet = wallets.find((item) => item.id === walletId);
  const sourceWalletAmount = sourceWallet?.specs.balances.confirmed - sendMaxFee;

  const { activeVault: defaultVault } = useVault({ includeArchived: false, getFirst: true });
  const availableTransactionPriorities = useAvailableTransactionPriorities();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions, common, vault } = translations;

  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleTransVaultModal, setVisibleTransVaultModal] = useState(false);
  const [title, setTitle] = useState('Sending to address');
  const [subTitle, setSubTitle] = useState('Review the transaction setup');
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transPriorityModalVisible, setTransPriorityModalVisible] = useState(false);
  const [highFeeAlertVisible, setHighFeeAlertVisible] = useState(false);
  const [visibleCustomPriorityModal, setVisibleCustomPriorityModal] = useState(false);
  const [feePercentage, setFeePercentage] = useState(0);

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

  useEffect(() => {
    if (transferType === TransferType.WALLET_TO_VAULT) {
      dispatch(calculateSendMaxFee({ numberOfRecipients: 1, wallet: sourceWallet }));
    }
  }, []);

  useEffect(() => {
    let hasHighFee = false;
    const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()].amount;
    if (selectedFee > amount / 10) hasHighFee = true; // if fee is greater than 10% of the amount being sent

    setFeePercentage(Math.trunc((selectedFee / amount) * 100));

    if (hasHighFee) setHighFeeAlertVisible(true);
    else setHighFeeAlertVisible(false);
  }, [transactionPriority, amount]);

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

  const [inProgress, setProgress] = useState(false);

  useEffect(() => {
    if (inProgress) {
      setTimeout(() => {
        dispatch(sendPhaseTwoReset());
        dispatch(
          sendPhaseTwo({
            wallet: sender,
            txnPriority: transactionPriority,
            note,
            label,
            transferType,
          })
        );
      }, 200);
    }
  }, [inProgress]);

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
      setProgress(true);
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

  const { txid: walletSendSuccessful, hasFailed: sendPhaseTwoFailed } = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo
  );
  const { satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } = useAppSelector(
    (state) => state.settings
  );
  const navigation = useNavigation();

  useEffect(() => {
    if (serializedPSBTEnvelops && serializedPSBTEnvelops.length) {
      setProgress(false);
      navigation.dispatch(
        CommonActions.navigate('SignTransactionScreen', {
          note,
          label,
          vaultId: sender.id,
        })
      );
    }
  }, [serializedPSBTEnvelops]);

  const viewDetails = () => {
    setVisibleModal(false);
    if (vaultTransfers.includes(transferType)) {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: {
              autoRefresh: true,
              vaultId: defaultVault.id,
            },
          },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    } else if (whirlPoolWalletTypes.includes(sender.type)) {
      const popAction = StackActions.pop(3);
      navigation.dispatch(popAction);
    } else {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'WalletDetails', params: { autoRefresh: true, walletId: sender.id } },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    }
  };

  useEffect(() => {
    if (walletSendSuccessful) {
      setProgress(false);
      setVisibleModal(true);
    }
  }, [walletSendSuccessful]);

  useEffect(() => {
    if (sendPhaseTwoFailed) setProgress(false);
  }, [sendPhaseTwoFailed]);

  useEffect(() => {
    if (crossTransferSuccess) {
      setVisibleModal(true);
      if (uaiSetActionFalse) {
        uaiSetActionFalse();
      }
    }
  }, [crossTransferSuccess]);

  const addNumbers = (str1, str2): number => {
    if (typeof str1 === 'string' && typeof str2 === 'string') {
      // Convert strings to numbers

      const num1 = parseFloat(str1?.replace(/,/g, ''));
      const num2 = parseFloat(str2?.replace(/,/g, ''));
      // Check if the conversion is successful
      if (!isNaN(num1) && !isNaN(num2)) {
        // Add the numbers
        const sum = num1 + num2;
        return sum;
      } else {
        // Handle invalid input
        console.error('Invalid input. Please provide valid numeric strings.');
        return 0;
      }
    } else {
      const sum = Number(str1) || 0 + Number(str2) || 0;
      return sum;
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Send Confirmation"
        subtitle={subTitle}
        rightComponent={<CurrencyTypeSwitch />}
      />
      <ScrollView marginX={7} flex={1} showsVerticalScrollIndicator={false}>
        <SendingCard
          isSend
          currentCurrency={currentCurrency}
          currencyCode={currencyCode}
          sender={sender || sourceWallet}
          recipient={recipient}
          address={address}
          amount={amount}
          transferType={transferType}
          getBalance={getBalance}
          getSatUnit={getSatUnit}
        />
        <SendingCard
          isSend={false}
          currentCurrency={currentCurrency}
          currencyCode={currencyCode}
          sender={sender}
          recipient={recipient}
          address={address}
          amount={amount}
          transferType={transferType}
          getBalance={getBalance}
          getSatUnit={getSatUnit}
        />
        {/* Custom priority diabled for auto transfer  */}
        {transferType !== TransferType.WALLET_TO_VAULT ? (
          <TouchableOpacity
            testID="btn_transactionPriority"
            onPress={() => setTransPriorityModalVisible(true)}
          >
            <TransactionPriorityDetails
              transactionPriority={transactionPriority}
              txFeeInfo={txFeeInfo}
              getBalance={getBalance}
              getCurrencyIcon={getCurrencyIcon}
            />
          </TouchableOpacity>
        ) : null}
        <AmountDetails
          title={walletTransactions.totalAmount}
          satsAmount={
            transferType === TransferType.WALLET_TO_VAULT
              ? getBalance(sourceWalletAmount)
              : getBalance(amount)
          }
        />
        <AmountDetails
          title={walletTransactions.totalFees}
          satsAmount={
            transferType === TransferType.WALLET_TO_VAULT
              ? getBalance(sendMaxFee)
              : getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount)
          }
        />
        <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
        <AmountDetails
          title={walletTransactions.total}
          satsAmount={
            transferType === TransferType.WALLET_TO_VAULT
              ? addNumbers(getBalance(sourceWalletAmount), getBalance(sendMaxFee)).toFixed(
                  satsEnabled ? 2 : 8
                )
              : addNumbers(
                  getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount),
                  getBalance(amount)
                ).toFixed(satsEnabled ? 2 : 8)
          }
          fontSize={17}
          fontWeight="400"
        />
      </ScrollView>
      {transferType === TransferType.VAULT_TO_VAULT ? (
        <Note title={common.note} subtitle={vault.signingOldVault} />
      ) : null}
      <Buttons
        primaryText={common.confirmProceed}
        secondaryText={common.cancel}
        secondaryCallback={() => {
          navigation.goBack();
        }}
        primaryCallback={() => setConfirmPassVisible(true)}
        primaryLoading={inProgress}
      />
      <KeeperModal
        visible={visibleModal}
        close={viewDetails}
        title={walletTransactions.SendSuccess}
        subTitle={walletTransactions.transactionBroadcasted}
        buttonText={walletTransactions.ViewWallets}
        buttonCallback={viewDetails}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => (
          <SendSuccessfulContent
            transactionPriority={transactionPriority}
            amount={amount || sourceWalletAmount}
            sender={sender || sourceWallet}
            recipient={recipient || defaultVault}
            getSatUnit={getSatUnit}
          />
        )}
      />
      <KeeperModal
        visible={visibleTransVaultModal}
        close={() => setVisibleTransVaultModal(false)}
        title={walletTransactions.approveTransVault}
        subTitle={walletTransactions.approveTransVaultSubtitle}
        textColor={`${colorMode}.greenText`}
        Content={() => (
          <ApproveTransVaultContent
            setVisibleTransVaultModal={setVisibleTransVaultModal}
            onTransferNow={onTransferNow}
          />
        )}
      />
      <KeeperModal
        visible={confirmPassVisible}
        close={() => setConfirmPassVisible(false)}
        title={walletTransactions.confirmPassTitle}
        subTitleWidth={wp(240)}
        subTitle=""
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onProceed}
          />
        )}
      />
      {/* Transaction Priority Modal */}
      <KeeperModal
        visible={transPriorityModalVisible}
        close={() => setTransPriorityModalVisible(false)}
        showCloseIcon={false}
        title={walletTransactions.transactionPriority}
        subTitleWidth={wp(240)}
        subTitle={walletTransactions.transactionPrioritySubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={common.confirm}
        buttonCallback={() => {
          setTransPriorityModalVisible(false), setTransactionPriority;
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setTransPriorityModalVisible(false)}
        Content={() => (
          <SendingPriority
            txFeeInfo={txFeeInfo}
            transactionPriority={transactionPriority}
            setTransactionPriority={setTransactionPriority}
            availableTransactionPriorities={availableTransactionPriorities}
            getBalance={getBalance}
            getSatUnit={getSatUnit}
            setVisibleCustomPriorityModal={() => {
              setTransPriorityModalVisible(false);
              dispatch(customPrioritySendPhaseOneReset());
              setVisibleCustomPriorityModal(true);
            }}
          />
        )}
      />
      {/* High fee alert Modal */}
      <KeeperModal
        visible={highFeeAlertVisible}
        close={() => setHighFeeAlertVisible(false)}
        showCloseIcon={false}
        title={walletTransactions.highFeeAlert}
        subTitleWidth={wp(240)}
        subTitle={'Network fee is higher than 10% of the amount being sent'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={common.proceed}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setHighFeeAlertVisible(false)}
        buttonCallback={() => {
          setHighFeeAlertVisible(false);
        }}
        Content={() => (
          <HighFeeAlert
            transactionPriority={transactionPriority}
            txFeeInfo={txFeeInfo}
            amountToSend={amount}
            getBalance={getBalance}
          />
        )}
      />
      {visibleCustomPriorityModal && (
        <CustomPriorityModal
          visible={visibleCustomPriorityModal}
          close={() => setVisibleCustomPriorityModal(false)}
          title={vault.CustomPriority}
          secondaryButtonText={common.cancel}
          secondaryCallback={() => setVisibleCustomPriorityModal(false)}
          subTitle="Enter amount in sats"
          network={sender?.networkType || sourceWallet?.networkType}
          recipients={[{ address, amount }]} // TODO: rewire for Batch Send
          sender={sender || sourceWallet}
          selectedUTXOs={selectedUTXOs}
          buttonCallback={(setCustomTxPriority) => {
            setVisibleCustomPriorityModal(false);
            if (setCustomTxPriority) setTransactionPriority(TxPriority.CUSTOM);
          }}
        />
      )}
    </ScreenWrapper>
  );
}
export default Sentry.withErrorBoundary(SendConfirmation, errorBourndaryOptions);

const styles = StyleSheet.create({
  priorityRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: windowHeight > 570 ? 3 : 1,
  },
  customPriorityRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  priorityWrapper: {
    gap: 10,
  },
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(14),
    flex: 1,
  },
  priorityTableText: {
    fontSize: 16,
    color: '#24312E',
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
    marginTop: hp(20),
  },
  customPriority: {
    fontStyle: 'italic',
  },
  transPriorityWrapper: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: windowHeight * 0.019,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transTitleWrapper: {
    marginVertical: 10,
  },
  transTitleText: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  transLabelText: {
    fontSize: 12,
  },
  transSatsFeeText: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  transSatsFeeWrapper: {
    width: '60%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addTransPriority: {
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: hp(30),
    borderWidth: 0.8,
  },
  addPriorityText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.6,
  },
  amountDetailsWrapper: {
    flexDirection: 'row',
    marginTop: 20,
  },
  amtDetailsTitleWrapper: {
    width: '30%',
    justifyContent: 'flex-start',
  },
  amtFiatSatsTitleWrapper: {
    width: '35%',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  amtDetailsText: {
    fontSize: 12,
    letterSpacing: 0.55,
  },
  horizontalLineStyle: {
    borderBottomWidth: 0.3,
    marginTop: hp(20),
    opacity: 0.5,
  },
  highFeeTitle: {
    fontSize: 14,
    letterSpacing: 0.55,
  },
  highFeeDetailsWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  highFeeDetailsContainer: {
    width: windowWidth * 0.8,
    padding: 10,
    marginVertical: 10,
  },
  highAlertFiatFee: {
    fontSize: 16,
    fontWeight: '700',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  currentTypeSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },
  cardTitle: {
    fontSize: 14,
    letterSpacing: 0.14,
  },
  cardSubtitle: {
    fontSize: 12,
    letterSpacing: 0.72,
  },
  currencyIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendingFromText: {
    fontSize: 14,
    letterSpacing: 1.12,
    marginY: windowHeight > 570 ? windowHeight * 0.011 : 1,
  },
});
