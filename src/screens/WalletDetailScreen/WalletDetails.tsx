/* eslint-disable react/prop-types */
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Box, Pressable, Text, View } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getAmount, getUnit } from 'src/common/constants/Bitcoin';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

// icons and images
import AddSCardIcon from 'src/assets/images/svgs/card_add.svg';
import AddWalletIcon from 'src/assets/images/svgs/addWallet_illustration.svg';
import Arrow from 'src/assets/images/svgs/arrow_brown.svg';
import BTC from 'src/assets/images/svgs/btc_wallet.svg';
import BackIcon from 'src/assets/images/svgs/back.svg';
import BtcWallet from 'src/assets/images/svgs/btc_walletCard.svg';
import Carousel from 'react-native-snap-carousel';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import IconSettings from 'src/assets/images/svgs/icon_settings.svg';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'react-native-linear-gradient';
// data
import { LocalizationContext } from 'src/common/content/LocContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Recieve from 'src/assets/images/svgs/receive.svg';
import Send from 'src/assets/images/svgs/send.svg';
import { Shadow } from 'react-native-shadow-2';
import StatusBarComponent from 'src/components/StatusBarComponent';
// components and interfaces and hooks
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultSetupIcon from 'src/assets/icons/vault_setup.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/svgs/Wallet_inside_green.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import openLink from 'src/utils/OpenLink';
import { TransferType } from 'src/common/data/enums/TransferType';

function WalletDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const carasualRef = useRef<Carousel<FlatList>>(null);
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const vaults: Vault[] = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject);
  const vaultExsist = Boolean(vaults.length);

  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const introModal = useAppSelector((state) => state.wallet.introModal);

  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [pullRefresh, setPullRefresh] = useState(false);
  const currentWallet = wallets[walletIndex];
  const transections = wallets[walletIndex]?.specs?.transactions || [];
  const { autoRefresh } = route?.params || {};

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh, route]);

  const _onSnapToItem = (index: number) => {
    setWalletIndex(index);
  };

  function _renderItem({ item, index }: { item; index }) {
    const walletName = item?.presentationData?.name;
    const walletDescription = item?.presentationData?.description;
    const balances = item?.specs?.balances;
    const walletBalance = balances?.confirmed + balances?.unconfirmed;
    const isActive = index === walletIndex;

    return (
      <Shadow
        distance={9}
        startColor="#e4e4e4"
        offset={[0, 14]}
        viewStyle={{
          height: hp(150),
        }}
      >
        <LinearGradient
          colors={isActive ? ['#00836A', '#073E39'] : ['#06423C', '#06423C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletContainer}
        >
          {!(item?.presentationData && item?.specs) ? (
            <TouchableOpacity
              style={styles.addWalletContainer}
              onPress={() => navigation.navigate('EnterWalletDetail', wallets.length)}
            >
              <GradientIcon
                Icon={AddSCardIcon}
                height={40}
                gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
              />

              <Text color="light.white" style={styles.addWalletText}>
                {wallet.AddNewWallet}
              </Text>
            </TouchableOpacity>
          ) : (
            <Box style={styles.walletCard}>
              <GradientIcon
                Icon={WalletInsideGreen}
                height={40}
                gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
              />
              <Box>
                <Text color="light.white" style={styles.walletDescription}>
                  {walletDescription}
                </Text>
                <Text color="light.white" style={styles.walletName}>
                  {walletName}
                </Text>
              </Box>
              <Box style={styles.walletBalance}>
                <Box
                  style={{
                    marginRight: 3,
                  }}
                >
                  <BtcWallet />
                </Box>
                <Text
                  color="light.white"
                  fontSize={hp(24)}
                  style={{
                    letterSpacing: 1.2,
                  }}
                >
                  {getAmount(walletBalance)}
                  <Text color="light.sats" style={styles.balanceUnit}>
                    {getUnit()}
                  </Text>
                </Text>
              </Box>
            </Box>
          )}
        </LinearGradient>
      </Shadow>
    );
  }

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

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

  function GradientIcon({ height, Icon, gradient = ['#9BB4AF', '#9BB4AF'] }) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          ...styles.center,
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }
  function LinkedWalletContent() {
    return (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} p={1}>
          You can use the individual wallet’s Recovery Phrases to connect other bitcoin apps to
          Keeper
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} p={1}>
          When the funds in a wallet cross a threshold, a transfer to the vault is triggered. This
          ensures you don’t have more sats in hot wallets than you need.
        </Text>
      </View>
    );
  }
  return (
    <Box backgroundColor="light.lightYellow" style={styles.container}>
      <StatusBarComponent padding={50} />
      <Pressable onPress={() => navigation.goBack()} style={styles.backIcon}>
        <BackIcon />
      </Pressable>

      <Box style={styles.headerContainer}>
        <Text color="light.textWallet" style={styles.headerTitle}>
          {wallets?.length} Linked Wallets
        </Text>

        <Box style={styles.headerBalanceContainer}>
          <Box style={styles.headerBTCIcon}>
            <BTC />
          </Box>
          <Text color="light.textWallet" fontSize={hp(30)} style={styles.headerBalance}>
            {getAmount(netBalance)}
            <Text color="light.satsDark" style={styles.balanceUnit}>
              {getUnit()}
            </Text>
          </Text>
        </Box>
      </Box>

      <Box style={styles.walletsContainer}>
        <Carousel
          onSnapToItem={_onSnapToItem}
          ref={carasualRef}
          data={[...wallets, { isEnd: true }]}
          renderItem={_renderItem}
          sliderWidth={windowWidth}
          itemWidth={wp(170)}
          itemHeight={hp(180)}
          layout="default"
          activeSlideAlignment="start"
          inactiveSlideOpacity={1}
        />
      </Box>

      {walletIndex !== wallets.length ? (
        <>
          {/* {Transfer pollicy} */}
          <Box style={styles.transferPolicyContainer}>
            <Box backgroundColor="light.transactionPolicyCard" style={styles.transferPolicyCard}>
              <Box
                style={{
                  paddingLeft: wp(10),
                }}
              >
                <Text
                  color="light.brownborder"
                  fontSize={RFValue(12)}
                  style={{
                    letterSpacing: 0.6,
                  }}
                >
                  Available to spend
                  <Text
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    {' '}
                    {'\n'}฿ {wallets[walletIndex].specs.balances.confirmed}sats
                  </Text>
                </Text>
              </Box>
            </Box>
            <Pressable
              backgroundColor="light.transactionPolicyCard"
              style={styles.transferPolicyCard}
              onPress={() => {
                if (vaultExsist) {
                  navigation.navigate('SendConfirmation', {
                    transferType: TransferType.WALLET_TO_VAULT,
                    walletId: wallets[walletIndex].id,
                  });
                } else Alert.alert('Vault is not created');
              }}
            >
              <Box style={{ paddingLeft: wp(10) }}>
                <Text
                  color="light.brownborder"
                  fontSize={RFValue(12)}
                  style={{
                    letterSpacing: 0.6,
                  }}
                >
                  Transfer Policy is set at{'  '}
                  <Text
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    ฿ {wallets[walletIndex].specs.transferPolicy}sats
                  </Text>
                </Text>
              </Box>
            </Pressable>
          </Box>

          <Box style={styles.transactions}>
            <Text color="light.textBlack" style={styles.transactionText}>
              Transactions
            </Text>
            {/* Screen not implemented yet  */}
            {/* <Box style={styles.viewAllContainer}>
              <Text color="light.light" style={styles.viewAllText}>
                View All
              </Text>
              <IconArrowBlack />
            </Box> */}
          </Box>

          <Box style={styles.transactionsListContainer}>
            <FlatList
              refreshControl={
                <RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />
              }
              data={transections}
              renderItem={renderTransactionElement}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </Box>
          <Box backgroundColor="light.lightYellow" style={styles.footerContainer}>
            <Box style={styles.border} borderColor="light.GreyText" />
            <Box style={styles.footerItemContainer}>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Send', { sender: currentWallet });
                }}
              >
                <Send />
                <Text color="light.lightBlack" style={styles.footerItemText}>
                  Send
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Receive', { wallet: currentWallet });
                }}
              >
                <Recieve />
                <Text color="light.lightBlack" style={styles.footerItemText}>
                  Receive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('WalletSettings', { wallet: currentWallet });
                }}
              >
                <IconSettings />
                <Text color="light.lightBlack" style={styles.footerItemText}>
                  Settings
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </>
      ) : (
        <Box style={styles.addNewWalletContainer}>
          <AddWalletIcon />
          <Text color="light.lightBlack" noOfLines={2} style={styles.addNewWalletText}>
            Add a new wallet or import one
          </Text>
        </Box>
      )}
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title="Bip-85 Wallets"
        subTitle="Create as many (hot) wallets as you want, and backup with a single Recovery Phrase"
        modalBackground={['#00836A', '#073E39']}
        textColor="#FFF"
        Content={LinkedWalletContent}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: wp(28),
    paddingRight: wp(27),
    paddingTop: hp(30),
  },
  backIcon: {
    zIndex: 999,
    width: 5,
    padding: 2,
    alignItems: 'center',
  },
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  transferPolicyCard: {
    paddingHorizontal: wp(10),
    height: hp(50),
    width: '48%',
    borderRadius: hp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    letterSpacing: 0.96,
    fontSize: RFValue(16),
    marginTop: hp(10),
  },
  headerContainer: {
    alignItems: 'center',
  },
  headerBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(35),
  },
  headerBTCIcon: {
    marginRight: 3,
    marginBottom: -hp(10),
  },
  headerBalance: {
    letterSpacing: 1.5,
  },
  balanceUnit: {
    letterSpacing: 0.6,
    fontSize: 12,
  },
  walletsContainer: {
    marginTop: 18,
    height: hp(180),
    width: '100%',
  },
  walletContainer: {
    borderRadius: hp(10),
    width: wp(170),
    height: hp(Platform.OS === 'android' ? 170 : 165),
    position: 'relative',
    marginLeft: 0,
  },
  addWalletText: {
    fontSize: 14,
    marginTop: hp(10),
  },
  walletCard: {
    marginTop: hp(20),
    marginLeft: wp(20),
  },
  walletName: {
    letterSpacing: 0.24,
    fontSize: RFValue(12),
  },
  walletDescription: {
    letterSpacing: 0.2,
    fontSize: RFValue(10),
    fontWeight: '400',
    marginTop: hp(16),
  },
  walletBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transferPolicyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(24),
    width: '100%',
  },
  transactionText: {
    marginLeft: wp(10),
    fontSize: 16,
    letterSpacing: 1.28,
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(2),
  },
  viewAllText: {
    letterSpacing: 0.6,
    marginRight: 5,
    fontSize: 11,
    fontWeight: 'bold',
  },
  transactionsListContainer: {
    marginTop: hp(10),
    height: hp(250),
    position: 'relative',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(375),
    paddingHorizontal: 5,
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },
  footerItemContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: hp(10),
    justifyContent: 'space-evenly',
    marginHorizontal: 16,
  },
  footerItemText: {
    fontSize: 12,
    letterSpacing: 0.84,
    marginVertical: 5,
  },
  addNewWalletText: {
    fontSize: 12,
    letterSpacing: 0.6,
    marginVertical: 5,
    marginHorizontal: 16,
    opacity: 0.85,
    fontWeight: '300',
  },
  addNewWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
export default WalletDetails;
