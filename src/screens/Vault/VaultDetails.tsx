/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View, useColorMode, Pressable, StatusBar } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, Linking, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Buy from 'src/assets/images/icon_buy.svg';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import KeeperModal from 'src/components/KeeperModal';
import Recieve from 'src/assets/images/receive.svg';
import { ScrollView } from 'react-native-gesture-handler';
import Send from 'src/assets/images/send.svg';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import Success from 'src/assets/images/Success.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Signer, Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/icon_vault_new.svg';
import CollaborativeIcon from 'src/assets/images/icon_collaborative.svg';
import { EntityKind, SignerType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import moment from 'moment';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { getSignerNameFromType, isSignerAMF, UNVERIFYING_SIGNERS } from 'src/hardware';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import AddPhoneEmailIcon from 'src/assets/images/AddPhoneEmail.svg';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useVault from 'src/hooks/useVault';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';
import WalletOperations from 'src/core/wallets/operations';
import openLink from 'src/utils/OpenLink';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import KeeperFooter from 'src/components/KeeperFooter';
import { KEEPER_KNOWLEDGEBASE } from 'src/core/config';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';
import useSignerMap from 'src/hooks/useSignerMap';
import CurrencyInfo from '../HomeScreen/components/CurrencyInfo';
import { SDIcons } from './SigningDeviceIcons';

function Footer({
  vault,
  onPressBuy,
  isCollaborativeWallet,
  identifySigner,
  setIdentifySignerModal,
}: {
  vault: Vault;
  onPressBuy: Function;
  isCollaborativeWallet: boolean;
  identifySigner: Signer;
  setIdentifySignerModal: any;
}) {
  const navigation = useNavigation();
  const footerItems = [
    {
      Icon: Send,
      text: 'Send',
      onPress: () => {
        if (identifySigner) {
          setIdentifySignerModal(true);
        } else {
          navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
        }
      },
    },
    {
      Icon: Recieve,
      text: 'Receive',
      onPress: () => {
        navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
      },
    },
    {
      Icon: Buy,
      text: 'Buy',
      onPress: onPressBuy,
    },
    {
      Icon: IconSettings,
      text: 'Settings',
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate(
            isCollaborativeWallet ? 'CollaborativeWalletSettings' : 'VaultSettings',
            { vaultId: vault.id }
          )
        );
      },
    },
  ];
  return <KeeperFooter items={footerItems} wrappedScreen={false} />;
}

function VaultInfo({
  vault,
  isCollaborativeWallet,
}: {
  vault: Vault;
  isCollaborativeWallet: boolean;
}) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { colorMode } = useColorMode();
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;

  return (
    <VStack paddingBottom={10} paddingLeft={5}>
      <HStack alignItems="center">
        <Box paddingRight={3}>{isCollaborativeWallet ? <CollaborativeIcon /> : <VaultIcon />}</Box>
        <VStack>
          <Text
            color={`${colorMode}.white`}
            style={styles.vaultInfoText}
            fontSize={16}
            testID="text_vaultName"
          >
            {name}
          </Text>
          <Text
            color={`${colorMode}.white`}
            style={styles.vaultInfoText}
            fontSize={12}
            testID="text_vaultDescription"
          >
            {description}
          </Text>
        </VStack>
      </HStack>
      <HStack justifyContent="space-between" top={isCollaborativeWallet ? '16' : '0'}>
        <VStack paddingTop="6">
          <Text
            color={`${colorMode}.white`}
            style={styles.vaultInfoText}
            fontSize={11}
            testID="text_unconfirmed"
          >
            {common.unconfirmed}
          </Text>
          <CurrencyInfo
            hideAmounts={false}
            amount={unconfirmed}
            fontSize={14}
            color={`${colorMode}.white`}
            variation={colorMode === 'light' ? 'light' : 'dark'}
          />
        </VStack>
        <VStack paddingBottom="16" paddingTop="6">
          <Text
            color={`${colorMode}.white`}
            style={styles.vaultInfoText}
            fontSize={11}
            testID="text_availableBalance"
          >
            {common.availableBalance}
          </Text>
          <CurrencyInfo
            hideAmounts={false}
            amount={confirmed}
            fontSize={20}
            color={`${colorMode}.white`}
            variation={colorMode === 'light' ? 'light' : 'dark'}
          />
        </VStack>
      </HStack>
    </VStack>
  );
}

function TransactionList({
  transactions,
  pullDownRefresh,
  pullRefresh,
  vault,
  collaborativeWalletId,
}) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
            wallet: vault,
          })
        );
      }}
    />
  );
  return (
    <>
      <VStack style={{ paddingTop: windowHeight * (collaborativeWalletId ? 0.03 : 0.1) }}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text
            color={`${colorMode}.black`}
            marginLeft={wp(3)}
            fontSize={16}
            letterSpacing={1.28}
            testID="text_Transaction"
          >
            {common.transactions}
          </Text>
          {transactions ? (
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('AllTransactions', {
                    title: collaborativeWalletId ? 'Wallet Transactions' : 'Vault Transactions',
                    subtitle: 'All incoming and outgoing transactions',
                    collaborativeWalletId,
                    entityKind: EntityKind.VAULT,
                  })
                );
              }}
            >
              <HStack alignItems="center">
                <Text
                  color={`${colorMode}.primaryGreen`}
                  marginRight={2}
                  fontSize={11}
                  bold
                  letterSpacing={0.6}
                  testID="text_viewAll"
                >
                  {common.viewAll}
                </Text>
                <IconArrowBlack />
              </HStack>
            </TouchableOpacity>
          ) : null}
        </HStack>
      </VStack>
      <FlatList
        testID="view_TransactionList"
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          collaborativeWalletId ? (
            <EmptyStateView
              IllustartionImage={NoTransactionIcon}
              title={common.noTransYet}
              subTitle={common.pullDownRefresh}
            />
          ) : (
            <EmptyStateView
              IllustartionImage={NoVaultTransactionIcon}
              title={common.securityTips}
              subTitle={common.emptyStateModalSubtitle}
            />
          )
        }
      />
    </>
  );
}

function SignerList({ vault }: { vault: Vault }) {
  const { colorMode } = useColorMode();
  const { signers: vaultKeys, isMultiSig } = vault;
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const [unkonwnSignerHcModal, setUnkonwnSignerHcModal] = useState(false);

  //TO-DO
  const signerPressHandler = (signer: VaultSigner) => {
    if (signerMap[signer.masterFingerprint].type !== SignerType.UNKOWN_SIGNER) {
      navigation.dispatch(
        CommonActions.navigate('SigningDeviceDetails', {
          SignerIcon: <SignerIcon />,
          signerId: signer.xfp,
          vaultId: vault.id,
        })
      );
    } else {
      setUnkonwnSignerHcModal(true);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', top: `${70 - vaultKeys.length}%` }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {vaultKeys.map((vaultKey) => {
        const signer = signerMap[vaultKey.masterFingerprint];
        const indicate =
          !vaultKey?.registeredVaults?.find(
            (info) => info.vaultId === vault.id && info.registered
          ) &&
          isMultiSig &&
          !UNVERIFYING_SIGNERS.includes(signer.type) &&
          !isSignerAMF(signer);

        return (
          <Box
            style={styles.signerCard}
            marginRight="3"
            key={vaultKey.xfp}
            backgroundColor={`${colorMode}.seashellWhite`}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('SigningDeviceDetails', {
                    signer,
                    vaultKey,
                    vaultId: vault.id,
                  })
                );
              }}
            >
              {indicate ? <Box style={styles.indicator} /> : null}
              <Box
                margin="1"
                width="12"
                height="12"
                borderRadius={30}
                backgroundColor={`${colorMode}.coffeeBackground`}
                justifyContent="center"
                alignItems="center"
                alignSelf="center"
              >
                {SDIcons(signer.type, true).Icon}
              </Box>
              <Text bold style={styles.unregistered} numberOfLines={1}>
                {signer.type === SignerType.UNKOWN_SIGNER
                  ? 'Health Check'
                  : indicate
                  ? 'Not registered'
                  : ' '}
              </Text>
              <VStack pb={2}>
                <Text
                  color={`${colorMode}.black`}
                  fontSize={11}
                  letterSpacing={0.6}
                  textAlign="center"
                  numberOfLines={1}
                >
                  {getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer))}
                </Text>
                <Text
                  color={`${colorMode}.black`}
                  fontSize={8}
                  letterSpacing={0.6}
                  textAlign="center"
                  numberOfLines={2}
                >
                  {signer.signerDescription
                    ? signer.signerDescription
                    : `Added ${moment(signer.addedOn).fromNow().toLowerCase()}`}
                </Text>
              </VStack>
            </TouchableOpacity>
          </Box>
        );
      })}
      <KeeperModal
        visible={unkonwnSignerHcModal}
        close={() => setUnkonwnSignerHcModal(false)}
        title="Identify Unkown Signing Device"
        buttonText="Continue"
        buttonCallback={() => {
          setUnkonwnSignerHcModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'AssignSignerType',
              params: {
                vault,
              },
            })
          );
        }}
        secondaryButtonText="Skip"
        secondaryCallback={() => setUnkonwnSignerHcModal(false)}
      />
    </ScrollView>
  );
}

function RampBuyContent({
  buyWithRamp,
  vault,
  setShowBuyRampModal,
}: {
  buyWithRamp: boolean;
  vault: Vault;
  setShowBuyRampModal: any;
}) {
  const { translations } = useContext(LocalizationContext);
  const { ramp } = translations;
  const [buyAddress, setBuyAddress] = useState('');

  useEffect(() => {
    const receivingAddress = WalletOperations.getNextFreeAddress(vault);
    setBuyAddress(receivingAddress);
  }, []);

  return (
    <Box style={styles.rampBuyContentWrapper}>
      <Text style={styles.byProceedingContent}>{ramp.byProceedRampParagraph}</Text>
      <Box style={styles.cardWrapper}>
        <VaultIcon />
        <Box mx={4}>
          <Text style={{ fontSize: 12 }} color="#5F6965">
            {ramp.bitcoinTransfer}
          </Text>
          <Text style={{ fontSize: 19, letterSpacing: 1.28 }} color="#041513">
            {vault.presentationData.name}
          </Text>
          <Text
            style={{ fontSize: 12, fontStyle: 'italic' }}
            color="#00836A"
          >{`Balance: ${vault.specs.balances.confirmed} sats`}</Text>
        </Box>
      </Box>

      <Box style={styles.cardWrapper}>
        <Box style={styles.atIconWrapper}>
          <Text style={{ fontSize: 12 }}>@</Text>
        </Box>
        <Box mx={4}>
          <Text style={{ fontSize: 12 }} color="#5F6965">
            {ramp.addressForRamp}
          </Text>
          <Text style={styles.buyAddressText} ellipsizeMode="middle" numberOfLines={1}>
            {buyAddress}
          </Text>
        </Box>
      </Box>
      <Buttons
        secondaryText="Cancel"
        secondaryCallback={() => {
          setShowBuyRampModal(false);
        }}
        primaryText="Buy Bitcoin"
        primaryCallback={() => buyWithRamp(buyAddress)}
      />
    </Box>
  );
}

function VaultDetails({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, ramp, common } = translations;
  const route = useRoute() as {
    params: {
      vaultId: string;
      vaultTransferSuccessful: boolean;
      autoRefresh: boolean;
      collaborativeWalletId: string;
    };
  };

  const {
    vaultTransferSuccessful = false,
    autoRefresh = false,
    collaborativeWalletId = '',
    vaultId = '',
  } = route.params || {};

  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { activeVault: vault } = useVault({ collaborativeWalletId, vaultId });
  const [pullRefresh, setPullRefresh] = useState(false);
  const [identifySignerModal, setIdentifySignerModal] = useState(true);
  const [vaultCreated, setVaultCreated] = useState(introModal ? false : vaultTransferSuccessful);
  const { vaultSigners: keys } = useSigners(vault.id);
  const inheritanceSigner = keys.filter((signer) => signer.type === SignerType.INHERITANCEKEY)[0];
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const transactions = vault?.specs?.transactions || [];

  useEffect(() => {
    if (autoRefresh) syncVault();
  }, [autoRefresh]);

  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const VaultContent = useCallback(
    () => (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          {collaborativeWalletId
            ? vaultTranslation.walletSetupDetails
            : vaultTranslation.keeperSupportSigningDevice}
        </Text>
        {!collaborativeWalletId ? (
          <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
            {vaultTranslation.additionalOptionForSignDevice}
          </Text>
        ) : null}
      </View>
    ),
    [collaborativeWalletId]
  );

  const NewVaultContent = useCallback(
    () => (
      <Box>
        <Text fontSize={13} letterSpacing={0.65} color={`${colorMode}.greenText`} marginTop={3}>
          {vaultTranslation.sendVaultSignDevices}
        </Text>
        <Box alignItems="center">
          <Success />
        </Box>
        {inheritanceSigner && (
          <Pressable
            style={styles.addPhoneEmailWrapper}
            backgroundColor={`${colorMode}.primaryBackground`}
            onPress={() => {
              navigation.navigate('IKSAddEmailPhone', { vaultId });
              setVaultCreated(false);
            }}
          >
            <Box style={styles.iconWrapper}>
              <AddPhoneEmailIcon />
            </Box>
            <Box style={styles.titleWrapper}>
              <Text style={styles.addPhoneEmailTitle} color={`${colorMode}.primaryText`}>
                {vaultTranslation.addEmail}
              </Text>
              <Text style={styles.addPhoneEmailSubTitle} color={`${colorMode}.secondaryText`}>
                {vaultTranslation.addEmailDetails}
              </Text>
            </Box>
            <Box style={styles.rightIconWrapper}>
              <RightArrowIcon />
            </Box>
          </Pressable>
        )}
      </Box>
    ),
    []
  );

  const buyWithRamp = (address: string) => {
    try {
      setShowBuyRampModal(false);
      Linking.openURL(fetchRampReservation({ receiveAddress: address }));
    } catch (error) {
      console.log(error);
    }
  };

  const subtitle = `Vault with a ${vault.scheme.m} of ${vault.scheme.n} setup is created`;

  const identifySigner = keys.find((signer) => signer.type === SignerType.OTHER_SD);

  return (
    <Box
      style={styles.container}
      backgroundColor={
        collaborativeWalletId ? `${colorMode}.greenText2` : `${colorMode}.learnMoreBorder`
      }
    >
      <StatusBar barStyle="light-content" />
      <VStack zIndex={1}>
        <VStack style={{ paddingHorizontal: 20, paddingTop: 15 }}>
          <KeeperHeader
            learnMore
            learnTextColor="light.white"
            learnBackgroundColor="rgba(0,0,0,.2)"
            learnMorePressed={() => dispatch(setIntroModal(true))}
            contrastScreen={true}
          />
          <VaultInfo vault={vault} isCollaborativeWallet={!!collaborativeWalletId} />
        </VStack>
        {collaborativeWalletId ? null : <SignerList vault={vault} />}
      </VStack>
      <VStack
        backgroundColor={`${colorMode}.primaryBackground`}
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
        paddingBottom={windowHeight > 800 ? 5 : 0}
      >
        <TransactionList
          transactions={transactions}
          pullDownRefresh={syncVault}
          pullRefresh={pullRefresh}
          vault={vault}
          collaborativeWalletId={collaborativeWalletId}
        />
        <Footer
          onPressBuy={() => setShowBuyRampModal(true)}
          vault={vault}
          isCollaborativeWallet={!!collaborativeWalletId}
          identifySigner={identifySigner}
          setIdentifySignerModal={setIdentifySignerModal}
        />
      </VStack>
      <KeeperModal
        visible={vaultCreated}
        title={vaultTranslation.newVaultCreated}
        subTitle={subtitle}
        buttonText={vaultTranslation.ViewVault}
        DarkCloseIcon={colorMode === 'dark'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        buttonCallback={() => {
          setVaultCreated(false);
        }}
        close={() => setVaultCreated(false)}
        Content={NewVaultContent}
      />
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title={
          collaborativeWalletId
            ? vaultTranslation.collaborativeWallet
            : vaultTranslation.keeperVault
        }
        subTitle={
          collaborativeWalletId
            ? vaultTranslation.collaborativeWalletMultipleUsers
            : `Depending on your tier - ${SubscriptionTier.L1}, ${SubscriptionTier.L2} or ${SubscriptionTier.L3}, you need to add signers to the vault`
        }
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={VaultContent}
        buttonTextColor={colorMode === 'light' ? `${colorMode}.greenText2` : `${colorMode}.white`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonText={common.continue}
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() =>
          openLink(
            collaborativeWalletId
              ? `${KEEPER_KNOWLEDGEBASE}knowledge-base/what-is-wallet/`
              : `${KEEPER_KNOWLEDGEBASE}knowledge-base/what-is-vault/`
          )
        }
      />
      <KeeperModal
        visible={showBuyRampModal}
        close={() => {
          setShowBuyRampModal(false);
        }}
        title={ramp.buyBitcoinRamp}
        subTitle={ramp.buyBitcoinRampSubTitle}
        subTitleColor="#5F6965"
        textColor="light.primaryText"
        Content={() => (
          <RampBuyContent
            buyWithRamp={buyWithRamp}
            setShowBuyRampModal={setShowBuyRampModal}
            vault={vault}
          />
        )}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: '10%',
    justifyContent: 'space-between',
    flex: 1,
  },
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  signerCard: {
    elevation: 4,
    shadowRadius: 4,
    shadowOpacity: 0.3,
    shadowOffset: { height: 2, width: 0 },
    height: 130,
    width: 70,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
  },
  scrollContainer: {
    padding: '8%',
    minWidth: windowWidth,
  },
  knowMore: {
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FAFCFC',
    alignSelf: 'flex-end',
  },
  footerText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  vaultInfoText: {
    letterSpacing: 1.28,
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 10,
    position: 'absolute',
    zIndex: 2,
    right: '10%',
    top: '5%',
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#F86B50',
  },
  unregistered: {
    color: '#6E563B',
    fontSize: 8,
    letterSpacing: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
  rampBuyContentWrapper: {
    padding: 1,
  },
  byProceedingContent: {
    color: '#073B36',
    fontSize: 13,
    letterSpacing: 0.65,
    marginVertical: 1,
  },
  cardWrapper: {
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  atIconWrapper: {
    backgroundColor: '#FAC48B',
    borderRadius: 20,
    height: 35,
    width: 35,
    justifyItems: 'center',
    alignItems: 'center',
  },
  buyAddressText: {
    fontSize: 19,
    letterSpacing: 1.28,
    color: '#041513',
    width: wp(200),
  },
  addPhoneEmailWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(20),
    paddingVertical: hp(10),
    borderRadius: 10,
  },
  iconWrapper: {
    width: '15%',
  },
  titleWrapper: {
    width: '75%',
  },
  addPhoneEmailTitle: {
    fontSize: 14,
  },
  addPhoneEmailSubTitle: {
    fontSize: 12,
  },
  rightIconWrapper: {
    width: '10%',
  },
});
export default VaultDetails;
