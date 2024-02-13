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
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import BTC from 'src/assets/images/btc_grey.svg';
import BitcoinUnit from 'src/models/enums/BitcoinUnit';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import RadioButton from 'src/components/RadioButton';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import { EntityKind, TxPriority, VaultType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/icon_wallet.svg';
import VaultIcon from 'src/assets/images/icon_vault2.svg';
import moment from 'moment';
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
import { whirlPoolWalletTypes } from 'src/core/wallets/factories/WalletFactory';
import useVault from 'src/hooks/useVault';
import Fonts from 'src/constants/Fonts';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import AddIcon from 'src/assets/images/add.svg';
import AddIconWhite from 'src/assets/images/icon_add_white.svg';
import { UTXO } from 'src/core/wallets/interfaces';
import CustomPriorityModal from './CustomPriorityModal';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';

const customFeeOptionTransfers = [
  TransferType.VAULT_TO_ADDRESS,
  TransferType.VAULT_TO_WALLET,
  TransferType.WALLET_TO_WALLET,
  TransferType.WALLET_TO_ADDRESS,
];

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
          color={`${colorMode}.greenText2`}
          fontSize={14}
          letterSpacing={1.12}
          numberOfLines={showFullAddress ? 2 : 1}
          maxWidth={200}
        >
          {title}
        </Text>
        {!showFullAddress && <Box flexDirection="row">{subTitle}</Box>}
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
      <Text
        color={`${colorMode}.primaryText`}
        fontSize={14}
        letterSpacing={1.12}
        marginY={windowHeight > 570 ? windowHeight * 0.011 : 1}
      >
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

function TextValue({ amt, getValueIcon }) {
  return (
    <Text
      style={{
        ...styles.priorityTableText,
        flex: 1,
        textAlign: 'right',
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
  const { translations } = useContext(LocalizationContext);
  const { settings, wallet: walletTranslation } = translations;
  const { colorMode } = useColorMode();
  return (
    <Box>
      {/* <Transaction txFeeInfo={txFeeInfo} transactionPriority={transactionPriority} /> */}
      <Box flexDirection="row" justifyContent="space-between" width="90%">
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 10,
            marginHorizontal: 20,
            width: '100%',
          }}
        >
          <Text style={styles.headingLabelText}>Priority</Text>
          <Text style={styles.headingLabelText}>Arrival Time</Text>
          <Text style={styles.headingLabelText}>Fees</Text>
        </Box>
      </Box>

      <Box mt={hp(1)} width="100%">
        {availableTransactionPriorities?.map((priority) => {
          if (txFeeInfo[priority?.toLowerCase()].estimatedBlocksBeforeConfirmation !== 0) {
            return (
              <TouchableOpacity
                key={priority}
                onPress={() => {
                  setTransactionPriority(priority);
                }}
              >
                <Box
                  style={styles.priorityRowContainer}
                  opacity={transactionPriority === priority ? 1 : 0.5}
                  backgroundColor={`${colorMode}.seashellWhite`}
                >
                  <Box style={styles.priorityBox}>
                    <RadioButton
                      size={20}
                      isChecked={transactionPriority === priority}
                      borderColor="#74837F"
                      onpress={() => {
                        setTransactionPriority(priority);
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
                    ~{txFeeInfo[priority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation * 10}{' '}
                    mins
                  </Text>
                  <TextValue
                    amt={getBalance(txFeeInfo[priority?.toLowerCase()]?.amount)}
                    getValueIcon={getSatUnit}
                  />
                </Box>
              </TouchableOpacity>
            );
          }
        })}
      </Box>
      <TouchableOpacity onPress={setVisibleCustomPriorityModal}>
        <Box
          backgroundColor={`${colorMode}.lightAccent`}
          borderColor={`${colorMode}.coffeeBackground`}
          style={styles.addTransPriority}
        >
          {colorMode === 'light' ? <AddIcon /> : <AddIconWhite />}
          <Text style={[styles.addPriorityText, { paddingLeft: colorMode === 'light' ? 10 : 0 }]}>
            {walletTranslation.addCustomPriority}
          </Text>
        </Box>
      </TouchableOpacity>
    </Box>
  );
}

// function FeeInfo({ txFeeInfo, transactionPriority, transferType, sendMaxFee }) {
//   return (
//     <HStack width={windowWidth * 0.75} justifyContent="space-between" alignItems="center">
//       <VStack>
//         <Text
//           color="light.primaryText"
//           fontSize={14}
//           letterSpacing={1.12}
//           marginTop={windowHeight * 0.011}
//         >
//           Fees
//         </Text>
//         <Text color="light.primaryText" fontSize={12} letterSpacing={1.12} light>
//           ~ 10 - 30 mins
//         </Text>
//       </VStack>
//       <Text
//         color="light.primaryText"
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

function SendSuccessfulContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;
  return (
    <View>
      <Box alignSelf="center">
        <SuccessIcon />
      </Box>
      <Text color={`${colorMode}.greenText`} fontSize={13} padding={2}>
        {walletTransactions.sendTransSuccessMsg}
      </Text>
    </View>
  );
}

function ApproveTransVaultContent({ setVisibleTransVaultModal, onTransferNow }) {
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
function TransactionPriorityDetails({ transactionPriority, txFeeInfo, getBalance, getSatUnit }) {
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
        <Box>
          <Text style={styles.transLabelText}>{walletTransactions.PRIORITY}</Text>
          <Text style={styles.transLabelText}>{walletTransactions.ARRIVALTIME}</Text>
          <Text style={styles.transLabelText}>{walletTransactions.FEE}</Text>
        </Box>
        <Box>
          <Text style={styles.transLabelText}>{transactionPriority.toUpperCase()}</Text>
          <Text style={styles.transLabelText}>
            ~{' '}
            {txFeeInfo[transactionPriority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation * 10}{' '}
            mins
          </Text>
          <Box>
            <Box style={styles.transSatsFeeWrapper}>
              {getSatUnit() === 'sats' ? <BTC /> : <Text style={{ fontSize: 8 }}>$</Text>}
              &nbsp;
              <Text style={styles.transSatsFeeText}>
                {getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount)}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box style={{ width: '5%' }}>
          <Text style={{ fontSize: 20 }}>...</Text>
        </Box>
      </Box>
    </Box>
  );
}
function AmountDetails(props) {
  return (
    <Box style={styles.amountDetailsWrapper}>
      <Box style={styles.amtDetailsTitleWrapper}>
        <Text
          style={[
            styles.amtDetailsText,
            { fontSize: props.fontSize, fontWeight: props.fontWeight },
          ]}
        >
          {props.title}
        </Text>
      </Box>
      <Box style={styles.amtFiatSatsTitleWrapper}>
        <Text
          style={[
            styles.amtDetailsText,
            { fontSize: props.fontSize, fontWeight: props.fontWeight },
          ]}
        >
          {props.fiatAmount}
        </Text>
      </Box>
      <Box style={styles.amtFiatSatsTitleWrapper}>
        <Text style={styles.amtDetailsText}>{props.satsAmount}</Text>
      </Box>
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
        <Box style={styles.highFeeDetailsWrapper}>
          <Text style={styles.highAlertFiatFee}>{selectedFee}&nbsp;&nbsp;</Text>
          <Text style={styles.highAlertSatsFee}>{getBalance(selectedFee)}</Text>
        </Box>
      </Box>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text style={styles.highFeeTitle}>{walletTransactions.amtBeingSent}</Text>
        <Box style={styles.highFeeDetailsWrapper}>
          <Text style={styles.highAlertFiatFee}>{amountToSend}&nbsp;&nbsp;</Text>
          <Text style={styles.highAlertSatsFee}>{getBalance(amountToSend)}</Text>
        </Box>
      </Box>
    </>
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
  const { activeVault: defaultVault } = useVault({ includeArchived: false, getFirst: true });
  const availableTransactionPriorities = useAvailableTransactionPriorities();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions, common, vault } = translations;

  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { getSatUnit, getBalance } = useBalance();

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
  const navigation = useNavigation();
  const collaborativeWalletId =
    sender?.entityKind === EntityKind.VAULT && sender.type === VaultType.COLLABORATIVE
      ? sender.collaborativeWalletId
      : '';

  useEffect(() => {
    if (serializedPSBTEnvelops && serializedPSBTEnvelops.length) {
      setProgress(false);
      navigation.dispatch(
        CommonActions.navigate('SignTransactionScreen', {
          note,
          label,
          collaborativeWalletId,
          vaultId: sender.id,
        })
      );
    }
  }, [serializedPSBTEnvelops]);

  const viewDetails = () => {
    setVisibleModal(false);
    if (vaultTransfers.includes(transferType) && collaborativeWalletId) {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: {
              autoRefresh: true,
              collaborativeWalletId,
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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={'Send Confirmation'}
        subtitle={subTitle}
        rightComponent={<CurrencyTypeSwitch />}
      />
      <ScrollView marginX={7} flex={1} showsVerticalScrollIndicator={false}>
        <SendingCard
          isSend
          currentCurrency={currentCurrency}
          currencyCode={currencyCode}
          sender={sender}
          recipient={recipient}
          address={address}
          amount={amount}
          transferType={transferType}
          getBalance={getBalance}
          getSatUnit={getSatUnit}
          sourceWallet={sourceWallet}
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
          sourceWallet={sourceWallet}
        />
        <TouchableOpacity onPress={() => setTransPriorityModalVisible(true)}>
          <TransactionPriorityDetails
            transactionPriority={transactionPriority}
            txFeeInfo={txFeeInfo}
            getBalance={getBalance}
            getSatUnit={getSatUnit}
          />
        </TouchableOpacity>
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
          fontWeight="400"
        />
        {/* <Box>
          {customFeeOptionTransfers.includes(transferType) ? (
            <SendingPriority
              txFeeInfo={txFeeInfo}
              transactionPriority={transactionPriority}
              setTransactionPriority={setTransactionPriority}
              availableTransactionPriorities={availableTransactionPriorities}
            />
          ) : (
            <FeeInfo
              txFeeInfo={txFeeInfo}
              transactionPriority={transactionPriority}
              transferType={transferType}
              sendMaxFee={sendMaxFee}
            />
          )}
        </Box> */}
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
        buttonText={walletTransactions.ViewDetails}
        buttonCallback={viewDetails}
        textcolor={`${colorMode}.greenText`}
        buttonTextColor={`${colorMode}.white`}
        Content={SendSuccessfulContent}
      />
      <KeeperModal
        visible={visibleTransVaultModal}
        close={() => setVisibleTransVaultModal(false)}
        title={walletTransactions.approveTransVault}
        subTitle={walletTransactions.approveTransVaultSubtitle}
        textcolor={`${colorMode}.greenText`}
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
        subTitle=""
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
        subTitle={`Network fee is greater than ${feePercentage}% of the amount being sent`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={common.proceed}
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
          subTitle="Enter sats to pay per vbyte"
          network={sender.networkType}
          recipients={[{ address, amount }]} // TODO: rewire for Batch Send
          sender={sender}
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
export default SendConfirmation;

const styles = StyleSheet.create({
  headingLabelText: {
    fontSize: 11,
    fontFamily: Fonts.FiraSansCondensedMedium,
    textAlign: 'center',
    color: '#656565',
  },
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
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(14),
    flex: 1,
  },
  priorityTableText: {
    fontSize: 10,
    textAlign: 'center',
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
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  transFiatFeeText: {
    fontSize: 16,
    fontWeight: '300',
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
  transSatsFeeText: {
    fontSize: 12,
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
    width: '100%',
    marginTop: 20,
  },
  amtDetailsTitleWrapper: {
    width: '30%',
    justifyContent: 'flex-start',
  },
  amtFiatSatsTitleWrapper: {
    width: '35%',
    alignItems: 'flex-end',
  },
  amtDetailsText: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
    letterSpacing: 0.55,
  },
  horizontalLineStyle: {
    borderBottomWidth: 0.3,
    marginTop: hp(20),
    opacity: 0.5,
  },
  highFeeTitle: {
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedRegular,
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
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  highAlertSatsFee: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedRegular,
  },
  currentTypeSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },
});
