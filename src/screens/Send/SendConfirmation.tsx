import { Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, View, useColorMode, HStack, Pressable } from 'native-base';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  calculateSendMaxFee,
  crossTransfer,
  sendPhaseTwo,
} from 'src/store/sagaActions/send_and_receive';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import {
  EntityKind,
  MultisigScriptType,
  NetworkType,
  TxPriority,
  VaultType,
} from 'src/services/wallets/enums';
import { Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import VaultIcon from 'src/assets/images/wallet_vault.svg';
import AddressIcon from 'src/components/AddressIcon';
import BTC from 'src/assets/images/btc_grey.svg';
import LabelImg from 'src/assets/images/labels.svg';
import {
  customPrioritySendPhaseOneReset,
  sendPhaseTwoReset,
} from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import useAvailableTransactionPriorities from 'src/store/hooks/sending-utils/UseAvailableTransactionPriorities';
import { useDispatch } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { TransferType } from 'src/models/enums/TransferType';
import useToastMessage from 'src/hooks/useToastMessage';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useWallets from 'src/hooks/useWallets';
import { whirlPoolWalletTypes } from 'src/services/wallets/factories/WalletFactory';
import useVault from 'src/hooks/useVault';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { InputUTXOs, UTXO } from 'src/services/wallets/interfaces';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import AddCard from 'src/components/AddCard';
import FeeInsights from 'src/screens/FeeInsights/FeeInsightsContent';
import FeerateStatement from 'src/screens/FeeInsights/FeerateStatement';
import useOneDayInsight from 'src/hooks/useOneDayInsight';
import LoginMethod from 'src/models/enums/LoginMethod';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import Fonts from 'src/constants/Fonts';
import SendIcon from 'src/assets/images/icon_sent_footer.svg';
import InfoIcon from 'src/assets/images/info-icon.svg';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { RealmSchema } from 'src/storage/realm/enum';
import HexagonIcon from 'src/components/HexagonIcon';
import WalletsIcon from 'src/assets/images/daily_wallet.svg';
import { resetVaultMigration } from 'src/store/reducers/vaults';
import { MANAGEWALLETS, VAULTSETTINGS, WALLETSETTINGS } from 'src/navigation/contants';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import KeeperFooter from 'src/components/KeeperFooter';
import idx from 'idx';
import { cachedTxSnapshot, dropTransactionSnapshot } from 'src/store/reducers/cachedTxn';
import useSignerMap from 'src/hooks/useSignerMap';
import { getAvailableMiniscriptSigners } from 'src/services/wallets/factories/VaultFactory';
import KeyDropdown from './KeyDropown';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import CustomPriorityModal from './CustomPriorityModal';
import SignerCard from '../AddSigner/SignerCard';

const customFeeOptionTransfers = [
  TransferType.VAULT_TO_ADDRESS,
  TransferType.VAULT_TO_WALLET,
  TransferType.WALLET_TO_WALLET,
  TransferType.WALLET_TO_ADDRESS,
];

const vaultTransfers = [TransferType.WALLET_TO_VAULT];
const walletTransfers = [TransferType.VAULT_TO_WALLET, TransferType.WALLET_TO_WALLET];
const internalTransfers = [TransferType.VAULT_TO_VAULT];

function Card({
  title,
  subTitle = '',
  isVault = false,
  showFullAddress = false,
  isAddress = false,
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.cardContainer}>
      {isVault ? (
        <VaultIcon />
      ) : isAddress ? (
        <HexagonIcon
          width={44}
          height={38}
          backgroundColor={Colors.pantoneGreen}
          icon={<AddressIcon />}
        />
      ) : (
        <HexagonIcon
          width={44}
          height={38}
          backgroundColor={Colors.pantoneGreen}
          icon={<WalletsIcon />}
        />
      )}
      <Box style={styles.ml10}>
        <Text
          numberOfLines={showFullAddress ? 2 : 1}
          style={styles.cardTitle}
          ellipsizeMode="middle"
        >
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
  isAddress,
}) {
  const { colorMode } = useColorMode();
  const getCurrencyIcon = () => {
    if (currentCurrency === CurrencyKind.BITCOIN) {
      return '₿';
    }
    return currencyCode;
  };

  const getCardDetails = () => {
    const availableBalance =
      sender.networkType === NetworkType.MAINNET
        ? sender.specs.balances.confirmed
        : sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;

    switch (transferType) {
      case TransferType.VAULT_TO_VAULT:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available: ${getCurrencyIcon()} ${getBalance(
              availableBalance
            )} ${getSatUnit()}`}
            isVault
          />
        ) : (
          <Card
            title={recipient?.presentationData?.name || address}
            subTitle={`Transferring: ${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
            isVault
          />
        );
      case TransferType.VAULT_TO_WALLET:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available: ${getCurrencyIcon()} ${getBalance(
              availableBalance
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
            title={sender?.presentationData?.name || address}
            subTitle={`Available: ${getCurrencyIcon()} ${getBalance(
              availableBalance || 0
            )} ${getSatUnit()}`}
            isVault
          />
        ) : (
          <Card
            title={address}
            subTitle={`${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
            showFullAddress={true}
            isAddress={isAddress}
          />
        );
      case TransferType.WALLET_TO_WALLET:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available: ${getCurrencyIcon()} ${getBalance(
              availableBalance || 0
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
              availableBalance || 0
            )} ${getSatUnit()}`}
          />
        ) : (
          <Card
            title={recipient?.presentationData?.name || address}
            subTitle={`Transferring: ${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
            isVault
          />
        );
      case TransferType.WALLET_TO_ADDRESS:
        return isSend ? (
          <Card
            title={sender?.presentationData?.name || address}
            subTitle={`Available balance: ${getCurrencyIcon()} ${getBalance(
              availableBalance || 0
            )} ${getSatUnit()}`}
          />
        ) : (
          <Card
            title={address}
            subTitle={`Transferring: ${getCurrencyIcon()} ${getBalance(amount)} ${getSatUnit()}`}
            showFullAddress={true}
            isAddress={isAddress}
          />
        );
    }
  };
  return (
    <Box style={styles.sendingCardContainer}>
      <Text color={`${colorMode}.primaryText`} style={styles.sendingFromText}>
        {isSend ? 'Sending From' : 'Sending To'}
      </Text>
      {getCardDetails()}
    </Box>
  );
}

function TransferCard({
  transferFrom = false,
  preTitle = '',
  title,
  subTitle = '',
  isVault = false,
  currentCurrency,
  currencyCode,
}) {
  const getCurrencyIcon = () => {
    if (currentCurrency === CurrencyKind.BITCOIN) {
      return '₿';
    }
    return currencyCode;
  };
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.sendingCardContainer}>
      <Text color={`${colorMode}.primaryText`} style={styles.sendingFromText}>
        {transferFrom ? 'Transfer From' : 'Transfer To'}
      </Text>
      <Card
        title={preTitle}
        subTitle={`${title} ${getCurrencyIcon()} ${subTitle}`}
        isVault={isVault}
      />
    </Box>
  );
}

function Footer({ setConfirmPassVisible }: { setConfirmPassVisible: (value: boolean) => void }) {
  const footerItems = [
    {
      Icon: SendIcon,
      text: 'Send',
      onPress: () => {
        setConfirmPassVisible(true);
      },
    },
  ];
  return <KeeperFooter items={footerItems} wrappedScreen={true} />;
}

function TextValue({ amt, getValueIcon, inverted = false }) {
  return (
    <Text
      style={{
        ...styles.priorityTableText,
      }}
    >
      {getValueIcon() === 'sats' ? `${amt} sats` : `$ ${amt}`}
    </Text>
  );
}

function SendingPriority({
  txFeeInfo,
  averageTxFees,
  transactionPriority,
  isCachedTransaction,
  setTransactionPriority,
  availableTransactionPriorities,
  customFeePerByte,
  setVisibleCustomPriorityModal,
  getBalance,
  getSatUnit,
  networkType,
}) {
  const { colorMode } = useColorMode();
  const reorderedPriorities = [
    ...availableTransactionPriorities.filter((priority) => priority === TxPriority.CUSTOM),
    ...availableTransactionPriorities.filter((priority) => priority !== TxPriority.CUSTOM),
  ];

  return (
    <Box>
      <Text style={styles.sendingPriorityText}>Select an option</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fdRow}>
        {reorderedPriorities?.map((priority) => {
          if (isCachedTransaction) if (priority !== transactionPriority) return; // cached tx has priority locked in(the one set during creation of the cached tx)

          if (txFeeInfo[priority?.toLowerCase()].estimatedBlocksBeforeConfirmation !== 0) {
            if (!isCachedTransaction) {
              // for fresh transactions: chip out higher priorities w/ similar fee(reason: insufficient funds to support high sats/vByte)
              // for cached transactions: only one priority exists(lock-in), hence we don't need to chip out anything
              if (priority === TxPriority.HIGH) {
                if (
                  txFeeInfo[TxPriority.HIGH.toLowerCase()].amount ===
                  txFeeInfo[TxPriority.MEDIUM.toLowerCase()].amount
                ) {
                  return;
                }
              } else if (priority === TxPriority.MEDIUM) {
                if (
                  txFeeInfo[TxPriority.MEDIUM.toLowerCase()].amount ===
                  txFeeInfo[TxPriority.LOW.toLowerCase()].amount
                ) {
                  return;
                }
              }
            }

            const satvByte =
              priority === TxPriority.CUSTOM
                ? customFeePerByte
                : averageTxFees[networkType]?.[priority]?.feePerByte;

            return (
              <TouchableOpacity
                key={priority}
                onPress={() => {
                  setTransactionPriority(priority);
                }}
              >
                <SignerCard
                  isFeePriority
                  titleComp={
                    <TextValue
                      amt={getBalance(txFeeInfo[priority?.toLowerCase()]?.amount)}
                      getValueIcon={getSatUnit}
                    />
                  }
                  icon={{}}
                  isSelected={transactionPriority === priority}
                  key={priority}
                  name={String(priority)}
                  subtitle={`${satvByte} sats/vbyte`}
                  description={`≈${
                    txFeeInfo[priority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation * 10
                  } mins`}
                  boldDesc
                  numberOfLines={2}
                  onCardSelect={() => setTransactionPriority(priority)}
                  customStyle={{
                    width: wp(96.5),
                    opacity: transactionPriority === priority ? 1 : 0.5,
                    height: getSatUnit() === 'sats' ? 150 : 135,
                  }}
                  colorMode={colorMode}
                />
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
      {isCachedTransaction ? null : (
        <Box style={styles.customPriorityCardContainer}>
          <Text style={styles.customPriorityText}>or choose custom fee</Text>
          <AddCard
            cardStyles={styles.customPriorityCard}
            name="Custom Priority"
            callback={setVisibleCustomPriorityModal}
          />
        </Box>
      )}
    </Box>
  );
}

function SendSuccessfulContent({
  transactionPriority,
  amount,
  sender,
  recipient,
  getSatUnit,
  address,
  isAddress,
}) {
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

  const availableBalance =
    sender.networkType === NetworkType.MAINNET
      ? sender.specs.balances.confirmed
      : sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;

  return (
    <View>
      <Box style={styles.fdRow}>
        <Box style={styles.sentToContainer}>
          <Text>Sent To</Text>
          <Card
            isVault={
              recipient?.entityKind === RealmSchema.Wallet.toUpperCase() ? false : !isAddress
            }
            title={isAddress ? address : recipient?.presentationData?.name}
            isAddress={isAddress}
            showFullAddress={true}
          />
        </Box>
        <Box style={styles.sentFromContainer}>
          <Text>Sent From</Text>
          <Card
            isVault={sender?.entityKind !== RealmSchema.Wallet.toUpperCase()}
            title={sender?.presentationData?.name}
            subTitle={`${getCurrencyIcon()} ${getBalance(availableBalance)} ${getSatUnit()}`}
          />
        </Box>
      </Box>
      <AmountDetails
        title={walletTransactions.totalAmount}
        satsAmount={`${getBalance(amount)} ${getSatUnit()}`}
      />
      <AmountDetails
        title={walletTransactions.totalFees}
        satsAmount={`${getBalance(
          txFeeInfo[transactionPriority?.toLowerCase()]?.amount
        )} ${getSatUnit()}`}
      />
      <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
      <AmountDetails
        title={walletTransactions.total}
        satsAmount={`${getBalance(
          amount + txFeeInfo[transactionPriority?.toLowerCase()]?.amount
        )} ${getSatUnit()}`}
        fontSize={17}
        fontWeight="400"
      />
      {/* TODO For Lableling */}
      {/* <AddLabel /> */}

      <Box style={styles.sendSuccessfullNote}>
        <Text color={`${colorMode}.greenText`} fontSize={13}>
          {walletTransactions.sendTransSuccessMsg}
        </Text>
      </Box>
    </View>
  );
}

function ApproveTransVaultContent({ setVisibleTransVaultModal, onTransferNow }) {
  const { colorMode } = useColorMode();
  return (
    <>
      <View style={styles.approveTransContainer}>
        <Text color={`${colorMode}.greenText`} fontSize={13} style={styles.pv10}>
          Once approved, bitcoin will be transferred from the wallets to the vault for safekeeping
        </Text>
        <Text color={`${colorMode}.greenText`} fontSize={13} style={styles.pv10}>
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
  getSatUnit,
  isAutoTransfer,
  sendMaxFee,
  sendMaxFeeEstimatedBlocks,
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
              {(isAutoTransfer
                ? sendMaxFeeEstimatedBlocks
                : txFeeInfo[transactionPriority?.toLowerCase()]
                    ?.estimatedBlocksBeforeConfirmation) * 10}{' '}
              mins
            </Text>
            <Box>
              <Box style={styles.transSatsFeeWrapper}>
                {getCurrencyIcon(BTC, 'dark')}
                &nbsp;
                <Text color={`${colorMode}.secondaryText`} style={styles.transSatsFeeText}>
                  {isAutoTransfer
                    ? sendMaxFee
                    : `${getBalance(
                        txFeeInfo[transactionPriority?.toLowerCase()]?.amount
                      )} ${getSatUnit()}`}
                </Text>
              </Box>
            </Box>
          </Box>
        </HStack>
        <Box>
          <Text style={styles.dots}>...</Text>
        </Box>
      </Box>
    </Box>
  );
}

function AmountDetails({ title, fontSize, fontWeight, fiatAmount, satsAmount }) {
  const { getCurrencyIcon } = useBalance();

  return (
    <Box style={styles.amountDetailsWrapper}>
      <Box style={styles.amtDetailsTitleWrapper}>
        <Text style={[styles.amtDetailsText, { fontSize, fontWeight }]}>{title}</Text>
      </Box>
      <Box style={styles.amtFiatSatsTitleWrapper}>
        <Box>
          <Text style={[styles.amtDetailsText, { fontSize, fontWeight }]}>{fiatAmount}</Text>
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

function HighFeeAlert({
  transactionPriority,
  txFeeInfo,
  amountToSend,
  showFeesInsightModal,
  OneDayHistoricalFee,
  isFeeHigh,
  isUsualFeeHigh,
  setTopText,
}) {
  const { colorMode } = useColorMode();
  const {
    translations: { wallet: walletTransactions },
  } = useContext(LocalizationContext);

  const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()]?.amount;
  const [bottomText, setBottomText] = useState('');

  useEffect(() => {
    const topText = isFeeHigh ? walletTransactions.highCustom : walletTransactions.highWait;
    const bottomText = isFeeHigh
      ? isUsualFeeHigh
        ? walletTransactions.highWait
        : walletTransactions.highUsual
      : walletTransactions.lowFee;

    setTopText(topText);
    setBottomText(bottomText);
  }, [isFeeHigh, isUsualFeeHigh, setTopText]);

  const renderFeeDetails = () => (
    <View style={styles.boxWrapper}>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text style={styles.highFeeTitle}>{walletTransactions.networkFee}</Text>
        <CurrencyInfo
          amount={selectedFee}
          hideAmounts={false}
          fontSize={16}
          bold
          color={colorMode === 'light' ? Colors.RichBlack : Colors.White}
          variation={colorMode === 'light' ? 'dark' : 'light'}
        />
      </Box>
      <View style={styles.divider} />
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text style={styles.highFeeTitle}>{walletTransactions.amtBeingSent}</Text>
        <CurrencyInfo
          amount={amountToSend}
          hideAmounts={false}
          fontSize={16}
          bold
          color={colorMode === 'light' ? Colors.RichBlack : Colors.White}
          variation={colorMode === 'light' ? 'dark' : 'light'}
        />
      </Box>
    </View>
  );

  const renderFeeStats = () => (
    <>
      <Text style={styles.statsTitle}>Fee Stats</Text>
      {OneDayHistoricalFee.length > 0 && (
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.feeStatementContainer}>
          <FeerateStatement
            showFeesInsightModal={showFeesInsightModal}
            feeInsightData={OneDayHistoricalFee}
          />
        </Box>
      )}
    </>
  );

  return (
    <>
      {isFeeHigh && isUsualFeeHigh ? (
        <>
          {renderFeeDetails()}
          {renderFeeStats()}
          <Box width="70%">
            <Text style={styles.highFeeNote}>{bottomText}</Text>
          </Box>
        </>
      ) : isFeeHigh ? (
        <>
          {renderFeeDetails()}
          {renderFeeStats()}
          <Box width="70%">
            <Text style={styles.highFeeNote}>{bottomText}</Text>
          </Box>
        </>
      ) : (
        isUsualFeeHigh && (
          <>
            <Box style={styles.marginBottom}>{renderFeeStats()}</Box>
            {renderFeeDetails()}
            <Box width="70%">
              <Text style={styles.highFeeNote}>{bottomText}</Text>
            </Box>
          </>
        )
      )}
    </>
  );
}
function AddLabel() {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      backgroundColor={Colors.MintWhisper}
      padding={3}
      borderWidth={1}
      borderStyle="dashed"
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

export enum ASSISTED_VAULT_ENTITIES {
  UK = 'UK',
  AK1 = 'AK1',
  AK2 = 'AK2',
}

const enum SigningPath {
  UK_PLUS_AK1 = 1,
  UK_PLUS_AK2 = 2,
  UK_ONLY = 3,
  AK_ONLY = 4,
}

const getSigningPathInfoText = (signingPath: SigningPath) => {
  if (signingPath === SigningPath.UK_PLUS_AK1 || signingPath === SigningPath.UK_PLUS_AK2) {
    return 'Both Assisted Keys and User Key can sign.';
  } else if (signingPath === SigningPath.UK_ONLY) return 'User Key can sign.';
  else if (signingPath === SigningPath.AK_ONLY) return 'Both Assisted Keys can sign.';
  else return 'Invalid signing path.';
};

const getSigningPath = (availableSigners) => {
  let signingPath;
  if (availableSigners[ASSISTED_VAULT_ENTITIES.UK]) {
    signingPath = SigningPath.UK_ONLY;
    if (
      availableSigners[ASSISTED_VAULT_ENTITIES.AK1] &&
      availableSigners[ASSISTED_VAULT_ENTITIES.AK2]
    ) {
      signingPath = SigningPath.UK_PLUS_AK1; // singing default w/ AK1
    }
  } else {
    if (
      availableSigners[ASSISTED_VAULT_ENTITIES.AK1] &&
      availableSigners[ASSISTED_VAULT_ENTITIES.AK2]
    ) {
      signingPath = SigningPath.AK_ONLY;
    }
  }

  return signingPath;
};

function SigningInfo({ onPress, availableSigners }) {
  const { colorMode } = useColorMode();

  const signingPath = getSigningPath(availableSigners);
  const disableSelection =
    signingPath === SigningPath.UK_ONLY || signingPath === SigningPath.AK_ONLY;
  return (
    <Pressable disabled={disableSelection} onPress={onPress} style={styles.signingInfoWrapper}>
      <Box style={styles.signingInfoContainer} background={`${colorMode}.seashellWhite`}>
        <HexagonIcon
          width={37}
          height={31}
          icon={<InfoIcon />}
          backgroundColor={Colors.pantoneGreen}
        />
        <Text style={styles.infoText}>{getSigningPathInfoText(signingPath)}</Text>
        <RightArrowIcon style={styles.arrowIcon} />
      </Box>
    </Pressable>
  );
}

export interface SendConfirmationRouteParams {
  sender: Wallet | Vault;
  recipient: Wallet | Vault;
  address: string;
  amount: number;
  walletId: string;
  uiMetaData: any;
  transferType: TransferType;
  uaiSetActionFalse: any;
  note: string;
  isAutoTransfer: boolean;
  label: {
    name: string;
    isSystem: boolean;
  }[];
  selectedUTXOs: UTXO[];
  date: Date;
  parentScreen: string;
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
    isAutoTransfer,
    parentScreen,
    currentBlockHeight,
  }: SendConfirmationRouteParams = route.params;

  const isAddress =
    transferType === TransferType.VAULT_TO_ADDRESS ||
    transferType === TransferType.WALLET_TO_ADDRESS;
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendMaxFeeEstimatedBlocks = useAppSelector(
    (state) => state.sendAndReceive.setSendMaxFeeEstimatedBlocks
  );
  const averageTxFees = useAppSelector((state) => state.network.averageTxFees);
  const { isSuccessful: crossTransferSuccess } = useAppSelector(
    (state) => state.sendAndReceive.crossTransfer
  );
  const [customFeePerByte, setCustomFeePerByte] = useState('');
  const { wallets } = useWallets({ getAll: true });
  const sourceWallet = wallets.find((item) => item?.id === walletId);
  const sourceWalletAmount = sourceWallet?.specs.balances.confirmed - sendMaxFee;

  const { activeVault: defaultVault } = useVault({ includeArchived: false, getFirst: true });
  const availableTransactionPriorities = useAvailableTransactionPriorities();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions, common, vault } = translations;

  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  const isAutoTransferFlow = isAutoTransfer || false;
  const [visibleModal, setVisibleModal] = useState(false);
  const [externalKeySelectionModal, setExternalKeySelectionModal] = useState(false);
  const [visibleTransVaultModal, setVisibleTransVaultModal] = useState(false);
  const [title, setTitle] = useState('Sending to address');
  const [subTitle, setSubTitle] = useState('Review the transaction setup');
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transPriorityModalVisible, setTransPriorityModalVisible] = useState(false);
  const [highFeeAlertVisible, setHighFeeAlertVisible] = useState(false);
  const [feeInsightVisible, setFeeInsightVisible] = useState(false);
  const [visibleCustomPriorityModal, setVisibleCustomPriorityModal] = useState(false);
  const [feePercentage, setFeePercentage] = useState(0);
  const OneDayHistoricalFee = useOneDayInsight();
  const [selectedExternalSigner, setSelectedExternalSigner] = useState<VaultSigner | null>(null);
  const [availablePaths, setAvailablePaths] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedPaths, setSelectedPaths] = useState(null);
  const [availableSigners, setAvailableSigners] = useState({});
  const [externalSigners, setExternalSigners] = useState([]);
  const { signerMap } = useSignerMap();

  const initialiseAvailableSignersForAssistedVault = () => {
    // specifically initialises signers for the Assisted Vault(to be generalised w/ the UI)
    if (!currentBlockHeight) {
      showToast('Failed to sync current block height');
      navigation.goBack();
      return;
    }

    const { phases: availablePhases, signers: availableSigners } = getAvailableMiniscriptSigners(
      sender as Vault,
      currentBlockHeight
    ); // provides available phases/signers(generic)

    // upon generalisation of the UI we should be able to show/set paths
    // in the available phases as the options which are available for the user to choose from

    // currently for Advisor Vault only the latest phase and path are considered and the signers from
    // the latest phase are only available for signing
    const latestPhase = availablePhases[availablePhases.length - 1];
    const latestSigners = {};

    const pathsAvailable = [];
    latestPhase.paths.forEach((path) => {
      pathsAvailable.push(path);
      path.keys.forEach((key) => {
        latestSigners[key.identifier] = availableSigners[key.identifier];
      });
    });

    const latestExtSigners = [];
    for (const key in latestSigners) {
      if (key === ASSISTED_VAULT_ENTITIES.AK1 || key === ASSISTED_VAULT_ENTITIES.AK2) {
        latestExtSigners.push(signerMap[availableSigners[key].masterFingerprint]);
      }
    }
    if (latestExtSigners.length === 2) {
      // case: UK + AK1/AK2
      // set: AK1 as default option
      if (!selectedExternalSigner) setSelectedExternalSigner(latestExtSigners[0]);
    }

    setSelectedPhase(latestPhase.id);
    setAvailablePaths(pathsAvailable);
    setAvailableSigners(latestSigners);
    setExternalSigners(latestExtSigners);
  };

  useEffect(() => {
    if (
      sender.entityKind === EntityKind.VAULT &&
      (sender as Vault).scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG
    ) {
      // to be generalised once the generic UI is available
      initialiseAvailableSignersForAssistedVault();
    }
  }, []);

  useEffect(() => {
    // Assisted Vault: remapping selected path based on selected signer
    // upon generalising the UI, user should be able to directly select the path from available paths
    // and the additional steps of mapping the available paths to external signers and
    // then remapping the selected signer to the available paths in order to get the selected path can be avoided

    if (!availablePaths) return;

    if (!selectedExternalSigner) {
      if (availablePaths.length === 1) {
        // case: UK only or AK1 + AK2 only
        setSelectedPaths([availablePaths[0].id]);
      } else setSelectedPaths(null); // error case: path is not selected b/w 1.UK + AK1 and 2.UK + AK2
    } else {
      // case: UK + AK1/AK2
      const pathSelected = [];
      availablePaths.forEach((path) => {
        path.keys.forEach((key) => {
          if (
            availableSigners[key.identifier].masterFingerprint ===
            selectedExternalSigner.masterFingerprint
          ) {
            pathSelected.push(path.id);
          }
        });
      });
      setSelectedPaths(pathSelected);
    }
  }, [selectedExternalSigner, availablePaths]);

  const isMoveAllFunds =
    parentScreen === MANAGEWALLETS ||
    parentScreen === VAULTSETTINGS ||
    parentScreen === WALLETSETTINGS;
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );

  const {
    txid: walletSendSuccessful,
    hasFailed: sendPhaseTwoFailed,
    cachedTxid, // generated for new transactions as well(in case they get cached)
    cachedTxPriority,
  } = useAppSelector((state) => state.sendAndReceive.sendPhaseTwo);
  const cachedTxn = useAppSelector((state) => state.cachedTxn);
  const snapshot: cachedTxSnapshot = cachedTxn.snapshots[cachedTxid];
  const isCachedTransaction = !!snapshot;
  const cachedTxPrerequisites = idx(snapshot, (_) => _.state.sendPhaseOne.outputs.txPrerequisites);
  const [transactionPriority, setTransactionPriority] = useState(
    isCachedTransaction ? cachedTxPriority || TxPriority.LOW : TxPriority.LOW
  );
  const [usualFee, setUsualFee] = useState(0);
  const [topText, setTopText] = useState('');
  const [isFeeHigh, setIsFeeHigh] = useState(false);
  const [isUsualFeeHigh, setIsUsualFeeHigh] = useState(false);

  const navigation = useNavigation();
  const { satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } = useAppSelector(
    (state) => state.settings
  );

  function checkUsualFee(data: any[]) {
    if (data.length === 0) {
      return;
    }

    const total = data.reduce((sum, record) => sum + record.avgFee_75, 0);
    const historicalAverage = total / data.length;
    const recentFee = data[data.length - 1].avgFee_75;

    const difference = recentFee - historicalAverage;
    const percentageDifference = (difference / historicalAverage) * 100;
    setUsualFee(Math.abs(Number(percentageDifference.toFixed(2))));
    setIsUsualFeeHigh(usualFee > 10);
  }

  useEffect(() => {
    if (OneDayHistoricalFee.length > 0) {
      checkUsualFee(OneDayHistoricalFee);
    }
  }, [OneDayHistoricalFee]);

  useEffect(() => {
    if (isAutoTransfer) {
      setSubTitle('Review auto-transfer transaction details');
    } else if (vaultTransfers.includes(transferType)) {
      setTitle('Sending to vault');
    } else if (walletTransfers.includes(transferType)) {
      setTitle('Sending to wallet');
    } else if (internalTransfers.includes(transferType)) {
      setTitle('Transfer Funds to the new vault');
      setSubTitle('On-chain transaction incurs fees');
    }
  }, []);

  useEffect(() => {
    if (isAutoTransferFlow) {
      dispatch(calculateSendMaxFee({ numberOfRecipients: 1, wallet: sourceWallet }));
    }
  }, []);

  useEffect(() => {
    let hasHighFee = false;
    const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()].amount;
    if (selectedFee > amount / 10) hasHighFee = true; // if fee is greater than 10% of the amount being sent

    setFeePercentage(Math.trunc((selectedFee / amount) * 100));

    if (hasHighFee) {
      setIsFeeHigh(true);
      setHighFeeAlertVisible(true);
    } else setHighFeeAlertVisible(false);
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

  const onProceed = () => {
    if (isAutoTransferFlow) {
      if (defaultVault) {
        setVisibleTransVaultModal(true);
      }
    } else {
      setProgress(true);
    }
  };

  const handleOptionSelect = useCallback(
    (option: VaultSigner) => {
      if (
        selectedExternalSigner &&
        selectedExternalSigner.masterFingerprint !== option.masterFingerprint
      ) {
        if (serializedPSBTEnvelops) dispatch(sendPhaseTwoReset()); // reset, existing send phase two vars, upon change of signer
      }
      setSelectedExternalSigner(option);
      setExternalKeySelectionModal(false);
    },
    [selectedExternalSigner, serializedPSBTEnvelops]
  );

  // useEffect(
  //   () => () => {
  //     dispatch(sendPhaseTwoReset());
  //     dispatch(crossTransferReset());
  //   },
  //   []
  // );

  useEffect(() => {
    if (isCachedTransaction) {
      // case: cached transaction; do not reset sendPhase as we already have phase two set via cache
    } else {
      // case: new transaction
      if (
        sender.entityKind === EntityKind.VAULT &&
        (sender as Vault).scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG
      ) {
        if (!selectedPhase || !selectedPaths) {
          showToast('Invalid phase/path selection');
          return;
        }
      }

      if (inProgress) {
        setTimeout(() => {
          dispatch(sendPhaseTwoReset());
          dispatch(
            sendPhaseTwo({
              wallet: sender,
              txnPriority: transactionPriority,
              miniscriptTxElements: {
                selectedPhase,
                selectedPaths,
              },
              note,
              label,
              transferType,
            })
          );
        }, 200);
      }
    }
  }, [inProgress, selectedPhase, selectedPaths]);

  const { activeVault: currentSender } = useVault({ vaultId: sender?.id }); // current state of vault

  const validateUTXOsForCachedTxn = () => {
    // perform UTXO validation for cached transaction

    if (!cachedTxPrerequisites) return false;

    const cachedInputUTXOs: InputUTXOs[] = idx(
      cachedTxPrerequisites,
      (_) => _[transactionPriority].inputs
    );
    if (!cachedInputUTXOs) return false;

    const confirmedUTXOs: InputUTXOs[] = idx(currentSender, (_) => _.specs.confirmedUTXOs) || [];
    const unconfirmedUTXOs: InputUTXOs[] =
      idx(currentSender, (_) => _.specs.unconfirmedUTXOs) || [];

    const currentUTXOSet =
      currentSender.networkType === NetworkType.MAINNET
        ? confirmedUTXOs
        : [...confirmedUTXOs, ...unconfirmedUTXOs];

    for (const cachedUTXO of cachedInputUTXOs) {
      let found = false;
      for (const currentUTXO of currentUTXOSet) {
        if (cachedUTXO.txId === currentUTXO.txId && cachedUTXO.vout === currentUTXO.vout) {
          found = true;
          break;
        }
      }

      if (!found) return false;
    }

    return true;
  };

  const discardCachedTransaction = () => {
    dispatch(dropTransactionSnapshot({ cachedTxid }));
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'VaultDetails', params: { vaultId: sender?.id } }],
      })
    );
  };

  useEffect(() => {
    if (serializedPSBTEnvelops && serializedPSBTEnvelops.length && inProgress) {
      if (isCachedTransaction) {
        // perform UTXO validation for cached transaction
        const isValid = validateUTXOsForCachedTxn();
        if (!isValid) {
          // block and show discard alert
          Alert.alert(
            'Invalid UTXO set',
            'Please discard this transaction',
            [
              {
                text: 'Discard',
                onPress: discardCachedTransaction,
                style: 'destructive',
              },
              {
                text: 'Cancel',
                onPress: () => {
                  setProgress(false);
                },
                style: 'cancel',
              },
            ],
            { cancelable: true }
          );
          return;
        }
      }

      navigation.dispatch(
        CommonActions.navigate('SignTransactionScreen', {
          isMoveAllFunds,
          note,
          label,
          vaultId: sender?.id,
          sender,
          sendConfirmationRouteParams: route.params,
          miniscriptTxElements: {
            selectedPhase,
            selectedPaths,
          },
        })
      );
      setProgress(false);
    }
  }, [serializedPSBTEnvelops, selectedPhase, selectedPaths, inProgress]);

  useEffect(
    () => () => {
      dispatch(resetVaultMigration());
    },
    []
  );

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
              vaultId: isAutoTransferFlow ? defaultVault?.id : recipient.id,
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
          { name: 'WalletDetails', params: { autoRefresh: true, walletId: sender?.id } },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    }
  };

  const viewManageWallets = () => {
    new Promise((resolve, reject) => {
      try {
        const result = dispatch(refreshWallets([sender], { hardRefresh: true }));
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })
      .then(() => {
        setVisibleModal(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Home' },
              {
                name: 'ManageWallets',
              },
            ],
          })
        );
      })
      .catch((error) => {
        console.error('Error refreshing wallets:', error);
      });
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

  const toogleFeesInsightModal = () => {
    if (highFeeAlertVisible) {
      setHighFeeAlertVisible(false);
      // To give smooth transcation of modal,
      // After closing highfee modal.
      setTimeout(() => {
        setFeeInsightVisible(true);
      }, 300);
    } else {
      setFeeInsightVisible(!feeInsightVisible);
    }
  };
  const addNumbers = (str1, str2) => {
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!isAutoTransferFlow ? (
          <>
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
              isAddress={isAddress}
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
              isAddress={isAddress}
            />
          </>
        ) : (
          <>
            <TransferCard
              transferFrom
              preTitle={sourceWallet?.presentationData?.name}
              title="Available:"
              subTitle={`${getBalance(sourceWallet?.specs?.balances?.confirmed)} ${getSatUnit()}`}
              currentCurrency={currentCurrency}
              currencyCode={currencyCode}
            />
            <TransferCard
              isVault
              preTitle={defaultVault?.presentationData?.name}
              title="Balance:"
              subTitle={`${getBalance(defaultVault?.specs?.balances?.confirmed)} ${getSatUnit()}`}
              currentCurrency={currentCurrency}
              currencyCode={currencyCode}
            />
          </>
        )}
        {/* Custom priority diabled for auto transfer  */}

        <TouchableOpacity
          testID="btn_transactionPriority"
          onPress={() => setTransPriorityModalVisible(true)}
          disabled={isAutoTransfer} // disable change priority for AutoTransfers
        >
          <TransactionPriorityDetails
            isAutoTransfer={isAutoTransfer}
            sendMaxFee={`${getBalance(sendMaxFee)} ${getSatUnit()}`}
            sendMaxFeeEstimatedBlocks={sendMaxFeeEstimatedBlocks}
            transactionPriority={transactionPriority}
            txFeeInfo={txFeeInfo}
            getBalance={getBalance}
            getCurrencyIcon={getCurrencyIcon}
            getSatUnit={getSatUnit}
          />
        </TouchableOpacity>

        {OneDayHistoricalFee.length > 0 && (
          <Box style={styles.feeStatContainer}>
            <Text style={styles.feeStatText}>Fee stats</Text>
            <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.feeStatementWrapper}>
              <FeerateStatement
                showFeesInsightModal={toogleFeesInsightModal}
                feeInsightData={OneDayHistoricalFee}
              />
            </Box>
          </Box>
        )}
        <AmountDetails
          title={walletTransactions.totalAmount}
          satsAmount={
            isAutoTransferFlow
              ? `${getBalance(sourceWalletAmount)} ${getSatUnit()}`
              : ` ${getBalance(amount)} ${getSatUnit()}`
          }
        />
        <AmountDetails
          title={walletTransactions.totalFees}
          satsAmount={
            isAutoTransferFlow
              ? `${getBalance(sendMaxFee)} ${getSatUnit()}`
              : `${getBalance(
                  txFeeInfo[transactionPriority?.toLowerCase()]?.amount
                )} ${getSatUnit()}`
          }
        />
        <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
        <AmountDetails
          title={walletTransactions.total}
          satsAmount={
            isAutoTransferFlow
              ? `${addNumbers(getBalance(sourceWalletAmount), getBalance(sendMaxFee)).toFixed(
                  satsEnabled ? 2 : 8
                )} ${getSatUnit()}`
              : `${addNumbers(
                  getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount),
                  getBalance(amount)
                ).toFixed(satsEnabled ? 2 : 8)} ${getSatUnit()}`
          }
          fontSize={17}
          fontWeight="400"
        />
      </ScrollView>
      {sender.entityKind === EntityKind.VAULT &&
        (sender as Vault).scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG && (
          <Box>
            <Text medium style={styles.signingInfoText} color={`${colorMode}.primaryText`}>
              Signing Info
            </Text>
            <SigningInfo
              availableSigners={availableSigners}
              onPress={() => setExternalKeySelectionModal(true)}
            />
          </Box>
        )}
      {!isAutoTransferFlow ? (
        <Buttons
          primaryText={common.confirmProceed}
          secondaryText={isCachedTransaction ? 'Discard' : common.cancel}
          secondaryCallback={() => {
            if (isCachedTransaction) discardCachedTransaction();
            else navigation.goBack();
          }}
          primaryCallback={() => setConfirmPassVisible(true)}
          primaryLoading={inProgress}
        />
      ) : (
        <Buttons
          primaryText={common.confirmProceed}
          secondaryText={common.cancel}
          secondaryCallback={() => navigation.goBack()}
          primaryCallback={() => setConfirmPassVisible(true)}
          primaryLoading={inProgress}
        />
      )}
      <KeeperModal
        visible={visibleModal}
        close={!isMoveAllFunds ? viewDetails : viewManageWallets}
        title={walletTransactions.SendSuccess}
        subTitle={walletTransactions.transactionBroadcasted}
        buttonText={
          !isMoveAllFunds ? walletTransactions.ViewWallets : walletTransactions.ManageWallets
        }
        buttonCallback={!isMoveAllFunds ? viewDetails : viewManageWallets}
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
            isAddress={isAddress}
            address={address}
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
        visible={externalKeySelectionModal}
        close={() => setExternalKeySelectionModal(false)}
        title="External Key Selection"
        subTitle="Whose key should be used to sign the transaction along with yours?"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        showCloseIcon={false}
        buttonText={common.confirm}
        secondaryButtonText={common.cancel}
        Content={() => (
          <Box style={styles.externalKeyModal}>
            <KeyDropdown
              label="Choose External key"
              options={externalSigners}
              selectedOption={selectedExternalSigner}
              onOptionSelect={handleOptionSelect}
            />
          </Box>
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
            averageTxFees={averageTxFees}
            networkType={sender?.networkType || sourceWallet?.networkType}
            transactionPriority={transactionPriority}
            isCachedTransaction={isCachedTransaction}
            setTransactionPriority={setTransactionPriority}
            availableTransactionPriorities={availableTransactionPriorities}
            getBalance={getBalance}
            getSatUnit={getSatUnit}
            customFeePerByte={customFeePerByte}
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
        subTitle={topText}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        secButtonTextColor={`${colorMode}.greenText`}
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
            showFeesInsightModal={toogleFeesInsightModal}
            OneDayHistoricalFee={OneDayHistoricalFee}
            isFeeHigh={isFeeHigh}
            isUsualFeeHigh={isUsualFeeHigh}
            setTopText={setTopText}
          />
        )}
      />
      {/* Fee insight Modal */}
      <KeeperModal
        visible={feeInsightVisible}
        close={toogleFeesInsightModal}
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonText={common.proceed}
        buttonCallback={toogleFeesInsightModal}
        Content={() => <FeeInsights />}
      />
      {visibleCustomPriorityModal && (
        <CustomPriorityModal
          visible={visibleCustomPriorityModal}
          close={() => setVisibleCustomPriorityModal(false)}
          title={vault.CustomPriority}
          secondaryButtonText={common.cancel}
          secondaryCallback={() => setVisibleCustomPriorityModal(false)}
          subTitle="Enter amount in sats/vbyte"
          network={sender?.networkType || sourceWallet?.networkType}
          recipients={[{ address, amount }]} // TODO: rewire for Batch Send
          sender={sender || sourceWallet}
          selectedUTXOs={selectedUTXOs}
          buttonCallback={(setCustomTxPriority, customFeePerByte) => {
            setVisibleCustomPriorityModal(false);
            if (setCustomTxPriority) {
              setTransactionPriority(TxPriority.CUSTOM);
              setCustomFeePerByte(customFeePerByte);
            }
          }}
        />
      )}
    </ScreenWrapper>
  );
}
export default Sentry.withErrorBoundary(SendConfirmation, errorBourndaryOptions);

const styles = StyleSheet.create({
  priorityWrapper: {
    gap: 10,
  },
  priorityTableText: {
    fontSize: 16,
    color: '#24312E',
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
    fontWeight: '500',
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
  amountDetailsWrapper: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
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
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 12,
    fontFamily: Fonts.FiraSansCondensedMedium,
    letterSpacing: 0.55,
    marginLeft: 5,
  },
  boxWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
  },
  divider: {
    width: 5,
    height: '100%',
  },
  highFeeDetailsContainer: {
    padding: 10,
    flex: 1,
    borderRadius: 10,
  },
  feeStatementContainer: {
    width: windowWidth * 0.8,
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  feeStatContainer: {
    marginTop: 10,
  },
  feeStatText: {
    fontWeight: '500',
  },
  feeStatementWrapper: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  highFeeNote: {
    fontSize: 13,
    letterSpacing: 0.13,
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
    width: wp(90),
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
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingLeft: 10,
    minHeight: hp(70),
  },
  ml10: {
    marginLeft: 10,
  },
  sendingCardContainer: {
    marginVertical: windowHeight > 570 ? windowHeight * 0.01 : 0,
  },
  fdRow: {
    flexDirection: 'row',
  },
  customPriorityCardContainer: {
    marginTop: hp(50),
    marginBottom: hp(20),
  },
  customPriorityCard: {
    width: windowWidth / 3.4 - windowWidth * 0.05,
    marginTop: 5,
  },
  customPriorityText: {
    fontSize: 15,
    marginBottom: hp(5),
  },
  sentToContainer: {
    width: '50%',
    marginRight: 10,
  },
  sentFromContainer: {
    width: '50%',
  },
  approveTransContainer: {
    marginVertical: 25,
  },
  pv10: {
    paddingVertical: 10,
  },
  dots: {
    fontSize: 20,
  },
  w70P: {
    width: '70%',
  },
  container: {
    flex: 1,
    marginHorizontal: wp(25),
  },
  contentContainer: {
    paddingBottom: hp(30),
  },
  sendSuccessfullNote: {
    marginTop: hp(5),
  },
  TransferCardPreTitle: {
    marginLeft: wp(5),
    fontSize: 14,
    letterSpacing: 0.14,
  },
  transferCardTitle: {
    fontSize: 11,
    letterSpacing: 0.14,
  },
  transferCardSubtitle: {
    fontSize: 14,
    letterSpacing: 0.72,
  },
  transferCardContainer: {
    alignItems: 'center',
    borderRadius: 10,

    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: hp(70),
  },
  preTitleContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  transferText: {
    fontWeight: 500,
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 3,
    marginTop: 15,
  },
  cardTransferPreTitle: {
    marginLeft: wp(5),
    fontSize: 14,
    letterSpacing: 0.14,
  },
  subTitleContainer: {
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    marginLeft: 10,
  },
  sendingPriorityText: {
    fontSize: 15,
    letterSpacing: 0.15,
    marginBottom: hp(5),
  },
  satsStyle: {
    height: hp(500),
  },
  dollarsStyle: {},
  marginBottom: {
    marginBottom: hp(20),
  },
  externalKeyModal: {
    width: '100%',
  },
  signingInfoWrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
  },
  signingInfoContainer: {
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: hp(20),
    paddingHorizontal: wp(18),
    marginTop: hp(5),
    marginBottom: hp(20),
  },
  infoText: {
    width: '68%',
    fontSize: 14,
  },
  arrowIcon: {
    marginRight: wp(10),
  },
  signingInfoText: {
    marginTop: hp(5),
    paddingHorizontal: wp(25),
  },
});
