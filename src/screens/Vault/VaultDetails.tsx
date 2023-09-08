/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View, useColorMode, Pressable, StatusBar } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, Linking, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AddIcon from 'src/assets/images/icon_add_plus.svg';
import BackIcon from 'src/assets/images/back_white.svg';
import Buy from 'src/assets/images/icon_buy.svg';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import { RealmSchema } from 'src/storage/realm/enum';
import Recieve from 'src/assets/images/receive.svg';
import { ScrollView } from 'react-native-gesture-handler';
import Send from 'src/assets/images/send.svg';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import Success from 'src/assets/images/Success.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import CollaborativeIcon from 'src/assets/images/icon_collaborative.svg';
import { SignerType, VaultMigrationType, VaultType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSignerNameFromType, isSignerAMF, UNVERIFYING_SIGNERS } from 'src/hardware';
import usePlan from 'src/hooks/usePlan';
import useToastMessage from 'src/hooks/useToastMessage';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import AddPhoneEmailIcon from 'src/assets/images/AddPhoneEmail.svg';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useVault from 'src/hooks/useVault';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';
import WalletOperations from 'src/core/wallets/operations';
import useFeatureMap from 'src/hooks/useFeatureMap';
import openLink from 'src/utils/OpenLink';
import { SDIcons } from './SigningDeviceIcons';
import TierUpgradeModal from '../ChoosePlanScreen/TierUpgradeModal';
import CurrencyInfo from '../HomeScreen/components/CurrencyInfo';
import { useQuery } from '@realm/react';

function Footer({
  vault,
  onPressBuy,
  isCollaborativeWallet,
}: {
  vault: Vault;
  onPressBuy: Function;
  isCollaborativeWallet: boolean;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const featureMap = useFeatureMap({ scheme: vault.scheme, isCollaborativeWallet });

  const styles = getStyles(0);
  return (
    <Box>
      <Box
        borderWidth={0.5}
        borderColor={`${colorMode}.GreyText`}
        borderRadius={20}
        opacity={0.2}
      />
      <Box flexDirection="row" justifyContent="space-between" marginX={10} marginTop={3}>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          }}
        >
          <Send />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            featureMap.vaultRecieve
              ? navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }))
              : showToast('Please Upgrade', <ToastErrorIcon />);
          }}
        >
          <Recieve />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Receive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            featureMap.vaultBuy ? onPressBuy() : showToast('Please Upgrade');
          }}
        >
          <Buy />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate(
                isCollaborativeWallet ? 'CollaborativeWalletSettings' : 'VaultSettings',
                { wallet: isCollaborativeWallet ? vault : vault }
              )
            );
          }}
        >
          <IconSettings />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Settings
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function Header() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const styles = getStyles(0);
  return (
    <Box flexDirection="row" width="100%" px="2%">
      <StatusBar barStyle="light-content" />
      <Box width="50%">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box width="50%">
        <TouchableOpacity onPress={() => dispatch(setIntroModal(true))}>
          <Box style={styles.knowMore} backgroundColor="rgba(0,0,0,.2)">
            <Text color="light.white" style={styles.footerText} light>
              Learn More
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function VaultInfo({
  vault,
  isCollaborativeWallet,
}: {
  vault: Vault;
  isCollaborativeWallet: boolean;
}) {
  const { colorMode } = useColorMode();
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;

  const styles = getStyles(0);
  return (
    <VStack paddingY={10}>
      <HStack alignItems="center">
        <Box paddingRight={3}>{isCollaborativeWallet ? <CollaborativeIcon /> : <VaultIcon />}</Box>
        <VStack>
          <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={16}>
            {name}
          </Text>
          <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={12}>
            {description}
          </Text>
        </VStack>
      </HStack>
      <HStack justifyContent="space-between" top={isCollaborativeWallet ? '16' : '0'}>
        <VStack paddingTop="6">
          <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={11}>
            Unconfirmed
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
          <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={11}>
            Available Balance
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
  isCollaborativeWallet,
}) {
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
      <VStack style={{ paddingTop: windowHeight * (isCollaborativeWallet ? 0.03 : 0.13) }}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text color={`${colorMode}.black`} marginLeft={wp(3)} fontSize={16} letterSpacing={1.28}>
            Transactions
          </Text>
          {transactions ? (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('VaultTransactions', {
                    title: 'Vault Transactions',
                    subtitle: 'All incoming and outgoing transactions',
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
                >
                  View All
                </Text>
                <IconArrowBlack />
              </HStack>
            </TouchableOpacity>
          ) : null}
        </HStack>
      </VStack>
      <FlatList
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={NoVaultTransactionIcon}
            title="Security Tip"
            subTitle="Recreate the multisig on more coordinators. Receive a small amount and send a part of it. Check the balances are appropriately reflected across all the coordinators after each step."
          />
        }
      />
    </>
  );
}

function SignerList({ upgradeStatus, vault }: { upgradeStatus: VaultMigrationType; vault: Vault }) {
  const { colorMode } = useColorMode();
  const { signers: Signers, isMultiSig } = vault;
  const styles = getStyles(0);
  const navigation = useNavigation();

  const AddSigner = useCallback(() => {
    if (upgradeStatus === VaultMigrationType.UPGRADE) {
      return (
        <Box style={[styles.signerCard]} backgroundColor={`${colorMode}.coffeeBackground`}>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
            }}
          >
            <Box
              margin="1"
              marginBottom="3"
              width="12"
              height="12"
              borderRadius={30}
              justifyContent="center"
              alignItems="center"
              marginX={1}
              alignSelf="center"
            >
              <AddIcon />
            </Box>
            <VStack pb={2}>
              <Text
                color={`${colorMode}.white`}
                fontSize={10}
                bold
                letterSpacing={0.6}
                textAlign="center"
              >
                Add signing device to upgrade
              </Text>
            </VStack>
          </TouchableOpacity>
        </Box>
      );
    }
    return null;
  }, [upgradeStatus]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', top: `${70 - Signers.length}%` }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {Signers.map((signer) => {
        const indicate =
          !signer.registered && isMultiSig && !UNVERIFYING_SIGNERS.includes(signer.type);

        return (
          <Box
            style={styles.signerCard}
            marginRight="3"
            key={signer.signerId}
            backgroundColor={`${colorMode}.seashellWhite`}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('SigningDeviceDetails', {
                    SignerIcon: <SignerIcon />,
                    signerId: signer.signerId,
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
                {indicate ? 'Not registered' : ' '}
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
      <AddSigner />
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
  const [buyAddress, setBuyAddress] = useState('');
  const styles = getStyles(0);

  useEffect(() => {
    const receivingAddress = WalletOperations.getNextFreeAddress(vault);
    setBuyAddress(receivingAddress);
  }, []);

  return (
    <Box style={styles.rampBuyContentWrapper}>
      <Text style={styles.byProceedingContent}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>
      <Box style={styles.cardWrapper}>
        <VaultIcon />
        <Box mx={4}>
          <Text style={{ fontSize: 12 }} color="#5F6965">
            Bitcoin will be transferred to
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
            Address for ramp transactions
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
  const route = useRoute() as {
    params: {
      vaultTransferSuccessful: boolean;
      autoRefresh: boolean;
      collaborativeWalletId: string;
    };
  };

  const {
    vaultTransferSuccessful = false,
    autoRefresh = false,
    collaborativeWalletId = '',
  } = route.params || {};

  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { top } = useSafeAreaInsets();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { activeVault: vault } = useVault(collaborativeWalletId);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [pullRefresh, setPullRefresh] = useState(false);
  const [vaultCreated, setVaultCreated] = useState(introModal ? false : vaultTransferSuccessful);
  const inheritanceSigner = vault.signers.filter(
    (signer) => signer.type === SignerType.INHERITANCEKEY
  )[0];
  const [tireChangeModal, setTireChangeModal] = useState(false);
  const { subscriptionScheme } = usePlan();
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);

  const onPressModalBtn = () => {
    setTireChangeModal(false);
    navigation.navigate('AddSigningDevice');
  };

  const transactions = vault?.specs?.transactions || [];
  const hasPlanChanged = (): VaultMigrationType => {
    const currentScheme = vault.scheme;
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  };

  useEffect(() => {
    if (autoRefresh) syncVault();
  }, [autoRefresh]);

  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  useEffect(() => {
    if (hasPlanChanged() !== VaultMigrationType.CHANGE) {
      setTireChangeModal(true);
    }
  }, []);

  const styles = getStyles(top);

  const VaultContent = useCallback(
    () => (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          Keeper supports all the popular bitcoin signing devices (Hardware Wallets) that a user can
          select
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          There are also some additional options if you do not have hardware signing devices
        </Text>
      </View>
    ),
    []
  );

  const NewVaultContent = useCallback(
    () => (
      <Box>
        <Text fontSize={13} letterSpacing={0.65} color={`${colorMode}.greenText`} marginTop={3}>
          For sending out of the Vault you will need the signing devices. This means no one can
          steal your bitcoin in the Vault unless they also have the signing devices
        </Text>
        <Box alignItems="center">
          <Success />
        </Box>
        {inheritanceSigner && (
          <Pressable
            style={styles.addPhoneEmailWrapper}
            backgroundColor={`${colorMode}.primaryBackground`}
            onPress={() => {
              navigation.navigate('IKSAddEmailPhone');
              setVaultCreated(false);
            }}
          >
            <Box style={styles.iconWrapper}>
              <AddPhoneEmailIcon />
            </Box>
            <Box style={styles.titleWrapper}>
              <Text style={styles.addPhoneEmailTitle} color={`${colorMode}.primaryText`}>
                Add Email
              </Text>
              <Text style={styles.addPhoneEmailSubTitle} color={`${colorMode}.secondaryText`}>
                Additionally you can provide an email which will be used to notify you when someone
                tries to access the Inheritance Key
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

  const subtitle =
    subscriptionScheme.n > 1
      ? `Vault with a ${vault.scheme.m} of ${vault.scheme.n} setup is created`
      : `Vault with ${vault.scheme.m} of ${vault.scheme.n} setup is created`;

  return (
    <Box
      style={styles.container}
      backgroundColor={
        collaborativeWalletId ? `${colorMode}.greenText2` : `${colorMode}.learnMoreBorder`
      }
    >
      <VStack zIndex={1}>
        <VStack mx="8%" mt={5}>
          <Header />
          <VaultInfo vault={vault} isCollaborativeWallet={!!collaborativeWalletId} />
        </VStack>
        {collaborativeWalletId ? null : (
          <SignerList upgradeStatus={hasPlanChanged()} vault={vault} />
        )}
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
          isCollaborativeWallet={!!collaborativeWalletId}
        />
        <Footer
          onPressBuy={() => setShowBuyRampModal(true)}
          vault={vault}
          isCollaborativeWallet={!!collaborativeWalletId}
        />
      </VStack>
      <TierUpgradeModal
        visible={tireChangeModal && vault.type !== VaultType.COLLABORATIVE}
        close={() => {
          if (hasPlanChanged() === VaultMigrationType.DOWNGRADE) {
            setTireChangeModal(false);
            return;
          }
          setTireChangeModal(false);
        }}
        onPress={onPressModalBtn}
        isUpgrade={hasPlanChanged() === VaultMigrationType.UPGRADE}
        plan={keeper.subscription.name}
        closeOnOverlayClick={hasPlanChanged() !== VaultMigrationType.DOWNGRADE}
      />
      <KeeperModal
        visible={vaultCreated}
        title="New Vault Created"
        subTitle={subtitle}
        buttonText="View Vault"
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
        title="Keeper Vault"
        subTitle={`Depending on your tier - ${SubscriptionTier.L1}, ${SubscriptionTier.L2} or ${SubscriptionTier.L3}, you need to add signing devices to the Vault`}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={VaultContent}
        buttonTextColor={colorMode === 'light' ? `${colorMode}.greenText2` : `${colorMode}.white`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonText="Continue"
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      />

      <KeeperModal
        visible={showBuyRampModal}
        close={() => {
          setShowBuyRampModal(false);
        }}
        title="Buy bitcoin with Ramp"
        subTitle="Ramp enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available payment methods available may vary based on your country"
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

const getStyles = (top) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(top, 35),
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
      marginLeft: wp(3),
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
