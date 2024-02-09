/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View, useColorMode, Pressable, StatusBar } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import CoinIcon from 'src/assets/images/coins.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import KeeperModal from 'src/components/KeeperModal';
import SendIcon from 'src/assets/images/icon_sent_footer.svg';
import RecieveIcon from 'src/assets/images/icon_received_footer.svg';
import SettingIcon from 'src/assets/images/settings_footer.svg';
import Success from 'src/assets/images/Success.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Signer, Vault } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import CollaborativeIcon from 'src/assets/images/icon_collaborative.svg';
import { SignerType, VaultType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import AddPhoneEmailIcon from 'src/assets/images/phoneemail.svg';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useVault from 'src/hooks/useVault';
import openLink from 'src/utils/OpenLink';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import KeeperFooter from 'src/components/KeeperFooter';
import { KEEPER_KNOWLEDGEBASE } from 'src/core/config';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';
import CardPill from 'src/components/CardPill';
import ActionCard from 'src/components/ActionCard';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';

function Footer({
  vault,
  isCollaborativeWallet,
  identifySigner,
  setIdentifySignerModal,
}: {
  vault: Vault;
  isCollaborativeWallet: boolean;
  identifySigner: Signer;
  setIdentifySignerModal: any;
}) {
  const navigation = useNavigation();
  const footerItems = [
    {
      Icon: SendIcon,
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
      Icon: RecieveIcon,
      text: 'Receive',
      onPress: () => {
        navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
      },
    },
    {
      Icon: SettingIcon,
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

function VaultInfo({ vault }: { vault: Vault }) {
  const { colorMode } = useColorMode();
  const {
    specs: { balances: { confirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;

  return (
    <HStack style={styles.vaultInfoContainer}>
      <HStack style={styles.pillsContainer}>
        <CardPill
          heading={`${vault.scheme.m} of ${vault.scheme.n}`}
          backgroundColor={`${colorMode}.PaleTurquoise`}
        />
        <CardPill
          heading={`${vault.type === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`}
        />
      </HStack>
      <CurrencyInfo
        hideAmounts={false}
        amount={confirmed}
        fontSize={24}
        color={`${colorMode}.white`}
        variation={colorMode === 'light' ? 'light' : 'dark'}
      />
    </HStack>
  );
}

function TransactionList({
  transactions,
  pullDownRefresh,
  pullRefresh,
  vault,
  isCollaborativeWallet,
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
      <VStack style={{ paddingTop: windowHeight * (isCollaborativeWallet ? 0.03 : 0.1) }}>
        <Text
          color={`${colorMode}.black`}
          style={styles.transactionHeading}
          testID="text_Transaction"
        >
          {common.transactions}
        </Text>
      </VStack>
      <FlatList
        testID="view_TransactionList"
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView IllustartionImage={NoTransactionIcon} title={common.noTransYet} />
        }
      />
    </>
  );
}

type ScreenProps = NativeStackScreenProps<AppStackParams, 'VaultDetails'>;

const VaultDetails = ({ navigation, route }: ScreenProps) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common } = translations;

  const { vaultTransferSuccessful = false, autoRefresh = false, vaultId = '' } = route.params || {};

  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { activeVault: vault } = useVault({ vaultId });
  const [pullRefresh, setPullRefresh] = useState(false);
  const [identifySignerModal, setIdentifySignerModal] = useState(true);
  const [vaultCreated, setVaultCreated] = useState(introModal ? false : vaultTransferSuccessful);
  const { vaultSigners: keys } = useSigners(vault.id);
  const inheritanceSigner = keys.filter((signer) => signer?.type === SignerType.INHERITANCEKEY)[0];
  const transactions = vault?.specs?.transactions || [];
  const isCollaborativeWallet = vault.type === VaultType.COLLABORATIVE;

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
      <View style={styles.vaultModalContainer}>
        <Box style={styles.alignSelf}>
          <VaultSetupIcon />
        </Box>
        <Text color="white" style={styles.modalContent}>
          {isCollaborativeWallet
            ? vaultTranslation.walletSetupDetails
            : vaultTranslation.keeperSupportSigningDevice}
        </Text>
        {!isCollaborativeWallet ? (
          <Text color="white" style={styles.descText}>
            {vaultTranslation.additionalOptionForSignDevice}
          </Text>
        ) : null}
      </View>
    ),
    [isCollaborativeWallet]
  );

  const NewVaultContent = useCallback(
    () => (
      <Box>
        <Text style={[styles.descText, styles.mt3]} color={`${colorMode}.greenText`}>
          Your 3-of-6 vault has been setup successfully. You can start receiving/transfering bitcoin
        </Text>
        <Text style={[styles.descText, styles.mt3]} color={`${colorMode}.greenText`}>
          For sending bitcoin out of the vault you will need the signers{' '}
        </Text>
        <Text style={[styles.descText, styles.mt3]} color={`${colorMode}.greenText`}>
          This means no one can steal your sats from the vault unless they also have access to your
          signers{' '}
        </Text>
        <Box style={styles.alignItems}>
          {' '}
          <Success />
        </Box>
        {inheritanceSigner && (
          <Pressable
            padding={5}
            backgroundColor={`${colorMode}.pantoneGreenLight`}
            borderColor={`${colorMode}.pantoneGreen`}
            style={[styles.addPhoneEmailWrapper]}
            onPress={() => {
              navigation.navigate('IKSAddEmailPhone', { vaultId });
              setVaultCreated(false);
            }}
          >
            <Box style={styles.iconWrapper}>
              <AddPhoneEmailIcon />
            </Box>
            <Box style={styles.titleWrapper}>
              <Text style={styles.addPhoneEmailTitle} color={`${colorMode}.pantoneGreen`}>
                {vaultTranslation.addEmailPhone}
              </Text>
              <Text style={styles.addPhoneEmailSubTitle} color={`${colorMode}.primaryText`}>
                {vaultTranslation.addEmailVaultDetail}
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>
    ),
    []
  );

  const subtitle = `Vault with a ${vault.scheme.m} of ${vault.scheme.n} setup is created`;

  const identifySigner = keys.find((signer) => signer.type === SignerType.OTHER_SD);

  return (
    <Box
      style={styles.container}
      backgroundColor={
        isCollaborativeWallet ? `${colorMode}.greenText2` : `${colorMode}.pantoneGreen`
      }
    >
      <StatusBar barStyle="light-content" />
      <VStack zIndex={1}>
        <VStack style={styles.topSection}>
          <KeeperHeader
            title={vault.presentationData?.name}
            titleColor={`${colorMode}.seashellWhite`}
            subTitleColor={`${colorMode}.seashellWhite`}
            //TODO: Add collaborativeWalletIcon
            icon={
              !!isCollaborativeWallet ? (
                <CollaborativeIcon />
              ) : (
                <HexagonIcon
                  width={58}
                  height={50}
                  backgroundColor={Colors.deepTeal}
                  icon={<VaultIcon />}
                />
              )
            }
            subtitle={vault.presentationData?.description}
            learnMore
            learnTextColor="light.white"
            learnBackgroundColor="rgba(0,0,0,.2)"
            learnMorePressed={() => dispatch(setIntroModal(true))}
            contrastScreen={true}
          />
          <VaultInfo vault={vault} />
        </VStack>
      </VStack>
      <HStack style={styles.actionCardContainer}>
        <ActionCard
          cardName="View All Coins"
          description="Manage UTXO"
          callback={() =>
            navigation.navigate('UTXOManagement', {
              data: vault,
              routeName: 'Vault',
              vaultId,
            })
          }
          icon={<CoinIcon />}
        />
        <ActionCard
          cardName="Manage Signers"
          description="For this vault"
          callback={() =>
            navigation.dispatch(
              CommonActions.navigate({
                name: 'ManageSigners',
                params: { vaultId, vaultKeys: vault.signers },
              })
            )
          }
          icon={<SignerIcon />}
        />
      </HStack>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.bottomSection}>
        <TransactionList
          transactions={transactions}
          pullDownRefresh={syncVault}
          pullRefresh={pullRefresh}
          vault={vault}
          isCollaborativeWallet={isCollaborativeWallet}
        />
        <Footer
          vault={vault}
          isCollaborativeWallet={isCollaborativeWallet}
          identifySigner={identifySigner}
          setIdentifySignerModal={setIdentifySignerModal}
        />
      </VStack>
      <KeeperModal
        visible={vaultCreated}
        title={vaultTranslation.newVaultCreated}
        subTitle={subtitle}
        buttonText={'Confirm'}
        DarkCloseIcon={colorMode === 'dark'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        buttonCallback={() => {
          setVaultCreated(false);
        }}
        secondaryButtonText={'Cancel'}
        secondaryCallback={() => setVaultCreated(false)}
        close={() => setVaultCreated(false)}
        Content={NewVaultContent}
      />
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title={
          isCollaborativeWallet
            ? vaultTranslation.collaborativeWallet
            : vaultTranslation.keeperVault
        }
        subTitle={
          isCollaborativeWallet
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
            isCollaborativeWallet
              ? `${KEEPER_KNOWLEDGEBASE}knowledge-base/what-is-wallet/`
              : `${KEEPER_KNOWLEDGEBASE}knowledge-base/what-is-vault/`
          )
        }
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: '10%',
    justifyContent: 'space-between',
    flex: 1,
  },
  vaultInfoContainer: {
    paddingLeft: '10%',
    marginVertical: 20,
    justifyContent: 'space-between',
  },
  pillsContainer: {
    gap: 2,
  },
  actionCardContainer: {
    marginTop: 20,
    marginBottom: -50,
    zIndex: 10,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  bottomSection: {
    paddingHorizontal: wp(30),
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  transactionHeading: {
    fontSize: 16,
    letterSpacing: 1.28,
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
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iconWrapper: {
    width: '15%',
  },
  titleWrapper: {
    width: '75%',
  },
  addPhoneEmailTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  addPhoneEmailSubTitle: {
    fontSize: 12,
  },
  rightIconWrapper: {
    width: '10%',
    marginLeft: 5,
  },
  vaultModalContainer: {
    marginVertical: 5,
    gap: 4,
  },
  alignSelf: {
    alignSelf: 'center',
  },
  modalContent: {
    marginTop: hp(20),
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
  descText: {
    fontSize: 13,
    letterSpacing: 0.65,
  },
  mt3: {
    marginTop: 3,
  },
  alignItems: {
    alignItems: 'center',
  },
});
export default VaultDetails;
