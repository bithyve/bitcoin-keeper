import { Box, HStack, Text, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
// components, hooks and functions
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';

// asserts
import AddIcon from 'src/assets/images/svgs/icon_add_plus.svg';
import BTC from 'src/assets/images/btc_white.svg';
import BackIcon from 'src/assets/images/svgs/back_white.svg';
import Buy from 'src/assets/images/svgs/icon_buy.svg';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import IconSettings from 'src/assets/images/svgs/icon_settings.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'react-native-linear-gradient';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Recieve from 'src/assets/images/svgs/receive.svg';
import { SUBSCRIPTION_SCHEME_MAP } from 'src/common/constants';
import { ScrollView } from 'react-native-gesture-handler';
import Send from 'src/assets/images/svgs/send.svg';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import Success from 'src/assets/images/Success.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import { VaultMigrationType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/icons/vault_setup.svg';
import { getAmount } from 'src/common/constants/Bitcoin';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSignerNameFromType } from 'src/hardware';
import { WalletMap } from '../Vault/WalletMap';
import TierUpgradeModal from '../ChoosePlanScreen/TierUpgradeModal';

function Footer({ vault }: { vault: Vault }) {
  const navigation = useNavigation();
  const styles = getStyles(0);
  return (
    <Box>
      <Box borderWidth={0.5} borderColor="light.GreyText" borderRadius={20} opacity={0.2} />
      <Box flexDirection="row" justifyContent="space-between" marginX={10} marginTop={3}>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          }}
        >
          <Send />
          <Text color="light.lightBlack" fontSize={12} letterSpacing={0.84} marginY={2.5}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
          }}
        >
          <Recieve />
          <Text color="light.lightBlack" fontSize={12} letterSpacing={0.84} marginY={2.5}>
            Recieve
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.IconText}>
          <Buy />
          <Text color="light.lightBlack" fontSize={12} letterSpacing={0.84} marginY={2.5}>
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.IconText}>
          <IconSettings />
          <Text color="light.lightBlack" fontSize={12} letterSpacing={0.84} marginY={2.5}>
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
    <Box flexDirection="row" justifyContent="space-between" px="2%">
      <StatusBar barStyle="light-content" />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.knowMore} onPress={() => dispatch(setIntroModal(true))}>
        <Text color="light.white1" fontSize={12} letterSpacing={0.84} fontWeight={100}>
          Know More
        </Text>
      </TouchableOpacity>
    </Box>
  );
}

function VaultInfo({ vault }: { vault: Vault }) {
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;
  return (
    <VStack paddingY={12}>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack>
          <Box paddingRight={3}>
            <VaultIcon />
          </Box>
          <VStack>
            <Text
              color="light.white1"
              marginLeft={wp(3)}
              fontSize={16}
              fontWeight={200}
              letterSpacing={1.28}
            >
              {name}
            </Text>
            <Text
              color="light.white1"
              marginLeft={wp(3)}
              fontSize={12}
              fontWeight={200}
              letterSpacing={1.28}
            >
              {description}
            </Text>
          </VStack>
        </HStack>
        <HStack alignItems="center">
          <BTC />
          <Text
            color="light.white1"
            marginLeft={wp(3)}
            fontSize={30}
            fontWeight={200}
            letterSpacing={1.28}
          >
            {getAmount(confirmed + unconfirmed)}
          </Text>
        </HStack>
      </HStack>
      <HStack justifyContent="space-between" paddingBottom={10} paddingTop={6}>
        <Text
          color="light.white1"
          marginLeft={wp(3)}
          fontSize={10}
          fontWeight={300}
          letterSpacing={1.28}
        >
          Available to spend
        </Text>
        <HStack alignItems="center">
          <BTC />
          <Text
            color="light.white1"
            marginLeft={wp(3)}
            fontSize={14}
            fontWeight={300}
            letterSpacing={1.28}
          >
            {confirmed}
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );
}

function TransactionList({ transactions, pullDownRefresh, pullRefresh, vault }) {
  const navigation = useNavigation();

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
          })
        );
      }}
    />
  );
  return (
    <>
      <VStack style={{ paddingTop: windowHeight * 0.12 }}>
        <HStack justifyContent="space-between">
          <Text
            color="light.textBlack"
            marginLeft={wp(3)}
            fontSize={16}
            fontWeight={200}
            letterSpacing={1.28}
          >
            Transactions
          </Text>
          <TouchableOpacity>
            <HStack alignItems="center">
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
                <Text
                  color="light.light"
                  marginRight={1}
                  fontSize={11}
                  fontWeight={300}
                  letterSpacing={0.6}
                >
                  View All
                </Text>
              </TouchableOpacity>
              <IconArrowBlack />
            </HStack>
          </TouchableOpacity>
        </HStack>
      </VStack>
      <FlatList
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

function SignerList({ upgradeStatus, vault }: { upgradeStatus: VaultMigrationType; vault: Vault }) {
  const Signers = vault.signers;
  const styles = getStyles(0);
  const navigation = useNavigation();

  function AddSigner() {
    if (upgradeStatus === VaultMigrationType.UPGRADE) {
      return (
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#B17F44', '#6E4A35']}
          style={[styles.signerCard]}
        >
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
                color="light.white"
                fontSize={11}
                fontWeight={300}
                letterSpacing={0.6}
                textAlign="center"
              >
                Add signing device to upgrade
              </Text>
            </VStack>
          </TouchableOpacity>
        </LinearGradient>
      );
    }
    return null;
  }
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', bottom: '80%', zIndex: 1 }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {Signers.map((signer) => (
        <Box style={styles.signerCard} marginRight="3">
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate('SigningDeviceDetails', {
                  SignerIcon: <SignerIcon />,
                  signer,
                  vaultId: vault.id,
                })
              );
            }}
          >
            <Box
              margin="1"
              marginBottom="3"
              width="12"
              height="12"
              borderRadius={30}
              bg="#725436"
              justifyContent="center"
              alignItems="center"
              alignSelf="center"
            >
              {WalletMap(signer.type, true).Icon}
            </Box>
            <VStack pb={2}>
              <Text
                color="light.textBlack"
                fontSize={11}
                fontWeight={200}
                letterSpacing={0.6}
                textAlign="center"
                noOfLines={1}
              >
                {getSignerNameFromType(signer.type)}
              </Text>
              <Text
                color="light.textBlack"
                fontSize={8}
                fontWeight={200}
                letterSpacing={0.6}
                textAlign="center"
              >
                {`Added ${moment(signer.addedOn).fromNow().toLowerCase()}`}
              </Text>
            </VStack>
          </TouchableOpacity>
        </Box>
      ))}
      <AddSigner />
    </ScrollView>
  );
}

function VaultDetails({ route, navigation }) {
  const { vaultTransferSuccessful = false } = route.params || {};
  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { useQuery } = useContext(RealmWrapperContext);
  const { top } = useSafeAreaInsets();
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [pullRefresh, setPullRefresh] = useState(false);
  const [vaultCreated, setVaultCreated] = useState(vaultTransferSuccessful);
  const [tireChangeModal, setTireChangeModal] = useState(false);

  const onPressModalBtn = () => {
    setTireChangeModal(false);
    navigation.navigate('AddSigningDevice');
  };

  const transactions = vault?.specs?.transactions || [];
  const hasPlanChanged = (): VaultMigrationType => {
    const currentScheme = vault.scheme;
    const subscriptionScheme = SUBSCRIPTION_SCHEME_MAP[keeper.subscription.name.toUpperCase()];
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  };

  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const closeVaultCreatedDialog = () => {
    setVaultCreated(false);
  };

  useEffect(() => {
    if (hasPlanChanged() !== VaultMigrationType.CHANGE) {
      setTireChangeModal(true);
    }
  }, []);

  const styles = getStyles(top);

  function VaultContent() {
    return (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text
          marginTop={hp(20)}
          color="white"
          fontSize={13}
          letterSpacing={0.65}
          fontFamily="body"
          fontWeight="200"
          p={1}
        >
          Keeper supports all the popular bitcoin signing devices (Hardware Wallets) that a user can
          select
        </Text>
        <Text
          color="white"
          fontSize={13}
          letterSpacing={0.65}
          fontFamily="body"
          fontWeight="200"
          p={1}
        >
          There are also some additional options if you do not have hardware signing devices
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#B17F44', '#6E4A35']}
      style={styles.container}
      start={{ x: -0.5, y: 1 }}
      end={{ x: 1, y: 1 }}
    >
      <VStack mx="8%">
        <Header />
        <VaultInfo vault={vault} />
      </VStack>
      <VStack
        backgroundColor="light.lightYellow"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
      >
        <SignerList upgradeStatus={hasPlanChanged()} vault={vault} />
        <TransactionList
          transactions={transactions}
          pullDownRefresh={syncVault}
          pullRefresh={pullRefresh}
          vault={vault}
        />
        <Footer vault={vault} />
      </VStack>
      <TierUpgradeModal
        visible={tireChangeModal}
        close={() => setTireChangeModal(false)}
        onPress={onPressModalBtn}
        isUpgrade={hasPlanChanged() === VaultMigrationType.UPGRADE}
        plan={keeper.subscription.name}
      />
      <KeeperModal
        visible={vaultCreated}
        title="New Vault Created"
        subTitle={`Your vault with ${vault.scheme.m} of ${vault.scheme.n} has been successfully setup. You can start receiving bitcoin in it`}
        buttonText="View Vault"
        subTitleColor="light.lightBlack2"
        buttonCallback={closeVaultCreatedDialog}
        close={closeVaultCreatedDialog}
        Content={() => (
          <View>
            <Success />
            <Text
              fontWeight={200}
              fontSize={13}
              letterSpacing={0.65}
              color="light.modalText"
              marginTop={3}
            >
              For sending out of the vault you will need the signing devices. This means no one can
              steal your bitcoin in the vault unless they also have the signing devices
            </Text>
          </View>
        )}
      />
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title="Keeper Vault"
        subTitle="Depending on your tier - Pleb, Hodler or Diamond Hands, you need to add signing devices to the vault"
        modalBackground={['#00836A', '#073E39']}
        textColor="#FFF"
        Content={VaultContent}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText="Continue"
        buttonTextColor="#073E39"
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
      />
    </LinearGradient>
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
      backgroundColor: '#FDF7F0',
    },
    scrollContainer: {
      padding: '8%',
      width: Platform.select({ android: null, ios: '100%' }),
    },
    knowMore: {
      backgroundColor: '#725436',
      paddingHorizontal: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FAFCFC',
    },
  });
export default VaultDetails;
