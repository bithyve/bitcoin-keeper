/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/function-component-definition */
import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import useBalance from 'src/hooks/useBalance';
import { Box, FlatList, useColorMode } from 'native-base';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { EntityKind, VaultType, WalletType } from 'src/core/wallets/enums';
import GradientIcon from 'src/screens/WalletDetails/components/GradientIcon';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletDark from 'src/assets/images/walletDark.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import AddWallet from 'src/assets/images/addWallet.svg';
import ImportWallet from 'src/assets/images/importWallet.svg';
import AddCollaborativeWalletIcon from 'src/assets/images/icon_collab.svg';
import WhirlpoolWhiteIcon from 'src/assets/images/white_icon_whirlpool.svg';
import AddNewWalletIllustration from 'src/assets/images/addNewWalletIllustration.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import AddSCardIcon from 'src/assets/images/icon_add_white.svg';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import useToastMessage from 'src/hooks/useToastMessage';
import idx from 'idx';
import { Shadow } from 'react-native-shadow-2';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import dbManager from 'src/storage/realm/dbManager';
import { SubscriptionTier, AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import SubScription from 'src/models/interfaces/Subscription';
import Relay from 'src/services/operations/Relay';
import { RealmSchema } from 'src/storage/realm/enum';
import { useDispatch } from 'react-redux';
import MenuItemButton from 'src/components/CustomButton/MenuItemButton';
import {
  resetElectrumNotConnectedErr,
  setRecepitVerificationFailed,
} from 'src/store/reducers/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Fonts from 'src/constants/Fonts';
import { Vault } from 'src/core/wallets/interfaces/vault';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import { v4 as uuidv4 } from 'uuid';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import ListItemView from './components/ListItemView';
import HomeScreenWrapper from './components/HomeScreenWrapper';
import CurrencyInfo from './components/CurrencyInfo';
import RampModal from '../WalletDetails/components/RampModal';

const TILE_MARGIN = wp(10);
const TILE_WIDTH = hp(180);
const VIEW_WIDTH = TILE_WIDTH + TILE_MARGIN;

const calculateBalancesForVaults = (vaults) => {
  let totalUnconfirmedBalance = 0;
  let totalConfirmedBalance = 0;

  vaults.forEach((vault) => {
    const unconfirmedBalance = idx(vault, (_) => _.specs.balances.unconfirmed) || 0;
    const confirmedBalance = idx(vault, (_) => _.specs.balances.confirmed) || 0;

    totalUnconfirmedBalance += unconfirmedBalance;
    totalConfirmedBalance += confirmedBalance;
  });
  return totalUnconfirmedBalance + totalConfirmedBalance;
};

function AddNewWalletTile({ walletIndex, isActive, wallet, navigation, setAddImportVisible }) {
  return (
    // <View style={styles.addWalletContent}>
    <TouchableOpacity style={styles.addWalletContainer} onPress={() => setAddImportVisible()}>
      <AddSCardIcon />
      <Text color="light.white" style={styles.addWalletText}>
        {wallet.AddImportNewWallet}
      </Text>
    </TouchableOpacity>
    // </View>
  );
}

function WalletItem({
  item,
  index,
  walletIndex,
  navigation,
  translations,
  hideAmounts,
  setAddImportVisible,
}: {
  currentIndex: number;
  item: Wallet | Vault;
  index: number;
  walletIndex: number;
  navigation;
  translations;
  hideAmounts: boolean;
  setAddImportVisible: any;
}) {
  const { colorMode } = useColorMode();
  if (!item) {
    return null;
  }
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);
  const isCollaborativeWallet =
    item.entityKind === EntityKind.VAULT && item.type === VaultType.COLLABORATIVE;
  const isActive = index === walletIndex;
  const { wallet } = translations;
  const opacity = isActive ? 1 : 0.5;
  return (
    <TouchableOpacity
      onPress={
        isCollaborativeWallet
          ? () =>
            navigation.navigate('VaultDetails', {
              collaborativeWalletId: item.collaborativeWalletId,
            })
          : () => navigation.navigate('WalletDetails', { walletId: item.id, walletIndex })
      }
    >
      <Box
        backgroundColor={`${colorMode}.pantoneGreen`}
        style={[
          styles.walletContainer,
          {
            width: !(item?.presentationData && item?.specs) ? 120 : TILE_WIDTH,
            opacity,
            justifyContent: 'flex-end',
          },
        ]}
      >
        {!(item?.presentationData && item?.specs) ? (
          <AddNewWalletTile
            walletIndex={walletIndex}
            isActive={isActive}
            wallet={wallet}
            navigation={navigation}
            setAddImportVisible={setAddImportVisible}
          />
        ) : (
          <WalletTile
            isWhirlpoolWallet={isWhirlpoolWallet}
            isCollaborativeWallet={isCollaborativeWallet}
            isActive={isActive}
            wallet={item}
            balances={item?.specs?.balances}
            hideAmounts={hideAmounts}
          />
        )}
      </Box>
    </TouchableOpacity>
  );
}

function WalletList({
  walletIndex,
  onViewRef,
  viewConfigRef,
  wallets,
  collaborativeWallets,
  hideAmounts,
  setAddImportVisible,
}: any) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const items = [...wallets, ...collaborativeWallets];
  return (
    <Box style={styles.walletsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items.concat({ isEnd: true })}
        disableIntervalMomentum
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: VIEW_WIDTH / 2 }}
        snapToInterval={VIEW_WIDTH}
        snapToAlignment="start"
        renderItem={({ item, index }) => (
          <WalletItem
            hideAmounts={hideAmounts}
            item={item}
            index={index}
            walletIndex={walletIndex}
            navigation={navigation}
            translations={translations}
            setAddImportVisible={setAddImportVisible}
          />
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
    </Box>
  );
}

function WalletTile({
  isActive,
  wallet,
  balances,
  isWhirlpoolWallet,
  hideAmounts,
  isCollaborativeWallet,
}) {
  const { colorMode } = useColorMode();
  const { getBalance, getCurrencyIcon, getSatUnit } = useBalance();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  return (
    <Box>
      <Box style={styles.walletCard}>
        <Box style={styles.walletInnerView}>
          {isWhirlpoolWallet ? (
            <GradientIcon
              Icon={WhirlpoolAccountIcon}
              height={35}
              gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
            />
          ) : (
            <Box style={styles.walletIconWrapper}>
              {colorMode === 'light' ? <WalletActiveIcon /> : <WalletDark />}
            </Box>
          )}

          <Box style={styles.walletDetailsWrapper}>
            <Text color={`${colorMode}.white`} style={styles.walletName}>
              {wallet?.presentationData?.name}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box style={styles.walletBalance}>
        <CurrencyInfo
          hideAmounts={hideAmounts}
          amount={balances?.confirmed + balances?.unconfirmed}
          fontSize={satsEnabled ? 17 : 20}
          color={`${colorMode}.white`}
          variation={colorMode === 'light' ? 'light' : 'dark'}
        />
      </Box>
    </Box>
  );
}

const WalletsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colorMode } = useColorMode();
  const { wallets } = useWallets();
  const { collaborativeWallets } = useCollaborativeWallet();
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceCollaborativeWallets = calculateBalancesForVaults(collaborativeWallets);
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(false);
  const currentWallet = wallets[walletIndex];
  const flatListRef = useRef(null);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [addImportVisible, setAddImportVisible] = useState(false);
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const [defaultWalletCreation, setDefaultWalletCreation] = useState(false);

  const { showToast } = useToastMessage();
  const onViewRef = useRef((viewableItems) => {
    const index =
      viewableItems.changed.find((item) => item.isViewable === true) ||
      viewableItems.viewableItems.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      setWalletIndex(index?.index);
    }
  });
  const { recepitVerificationError, recepitVerificationFailed } = useAppSelector(
    (state) => state.login
  );

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 40 });

  const receivingAddress = idx(currentWallet, (_) => _.specs.receivingAddress) || '';
  const balance = idx(currentWallet, (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(currentWallet, (_) => _.presentationData.name) || '';
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );

  useEffect(() => {
    if (electrumClientConnectionStatus.success) {
      showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
      if (electrumErrorVisible) setElectrumErrorVisible(false);
    } else if (electrumClientConnectionStatus.failed) {
      // showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
      setElectrumErrorVisible(true);
    }
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {
    if (electrumClientConnectionStatus.setElectrumNotConnectedErr) {
      showToast(`${electrumClientConnectionStatus.setElectrumNotConnectedErr}`, <ToastErrorIcon />);
      dispatch(resetElectrumNotConnectedErr());
    }
  }, [electrumClientConnectionStatus.setElectrumNotConnectedErr]);

  useEffect(() => {
    if (relayWalletUpdate) {
      if (defaultWalletCreation && wallets[collaborativeWallets.length]) {
        navigation.navigate('SetupCollaborativeWallet', {
          coSigner: wallets[collaborativeWallets.length],
          walletId: wallets[collaborativeWallets.length].id,
          collaborativeWalletsCount: collaborativeWallets.length,
        });
        dispatch(resetRealyWalletState());
        setDefaultWalletCreation(false);
      }
    }
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || 'Something went wrong - Wallet creation failed',
        <ToastErrorIcon />
      );
      setDefaultWalletCreation(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  async function downgradeToPleb() {
    try {
      const app: KeeperApp = dbManager.getCollection(RealmSchema.KeeperApp)[0];
      const updatedSubscription: SubScription = {
        receipt: '',
        productId: SubscriptionTier.L1,
        name: SubscriptionTier.L1,
        level: AppSubscriptionLevel.L1,
        icon: 'assets/ic_pleb.svg',
      };
      dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
        subscription: updatedSubscription,
      });
      dispatch(setRecepitVerificationFailed(false));
      const response = await Relay.updateSubscription(app.id, app.publicId, {
        productId: SubscriptionTier.L1.toLowerCase(),
      });
    } catch (error) {
      //
    }
  }

  const addNewDefaultWallet = (walletsCount) => {
    const newWallet: NewWalletInfo = {
      walletType: WalletType.DEFAULT,
      walletDetails: {
        name: `Wallet ${walletsCount + 1} `,
        description: `Single-sig Wallet`,
        transferPolicy: {
          id: uuidv4(),
          threshold: defaultTransferPolicyThreshold,
        },
      },
    };
    dispatch(addNewWallets([newWallet]));
  };

  function AddImportWallet({ wallets, collaborativeWallets }) {
    const addCollaborativeWallet = () => {
      setAddImportVisible(false);
      const collaborativeWalletsCount = collaborativeWallets.length;
      const walletsCount = wallets.length;
      if (collaborativeWalletsCount < walletsCount) {
        navigation.navigate('SetupCollaborativeWallet', {
          coSigner: wallets[collaborativeWalletsCount],
          walletId: wallets[collaborativeWalletsCount].id,
          collaborativeWalletsCount,
        });
      } else {
        setDefaultWalletCreation(true);
        addNewDefaultWallet(wallets.length);
      }
    };

    return (
      <Box>
        <MenuItemButton
          onPress={() => {
            setAddImportVisible(false);
            navigation.navigate('EnterWalletDetail', {
              name: `Wallet ${walletIndex + 1}`,
              description: 'Single-sig Wallet',
              type: WalletType.DEFAULT,
            });
          }}
          icon={<AddWallet />}
          title="Add Wallet"
          subTitle="Separate wallets for different purposes"
          height={80}
        />
        <MenuItemButton
          onPress={() => {
            setAddImportVisible(false);
            navigation.navigate('ImportWallet');
          }}
          icon={<ImportWallet />}
          title="Import Wallet"
          subTitle="Manage wallets in other apps"
          height={80}
        />
        <MenuItemButton
          onPress={addCollaborativeWallet}
          icon={<AddCollaborativeWalletIcon />}
          title="Add Collaborative Wallet"
          subTitle="Create, sign and view collaborative wallet"
          height={80}
        />
        <Box>
          <Text color={`${colorMode}.greenText`} style={styles.addImportParaContent}>
            Please ensure that Keeper is properly backed up to ensure your bitcoin's security
          </Text>
        </Box>
      </Box>
    );
  }

  function ElectrumErrorContent() {
    return (
      <Box width={wp(320)}>
        <Box margin={hp(5)}>
          {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
        </Box>
        <Box>
          <Text color={`${colorMode}.greenText`} fontSize={13} padding={1} letterSpacing={0.65}>
            Please change the network and try again later
          </Text>
        </Box>
      </Box>
    );
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function DowngradeModalContent() {
    return (
      <Box>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
        {/* <Text numberOfLines={1} style={[styles.btnText, { marginBottom: 30, marginTop: 20 }]}>You may choose to downgrade to Pleb</Text> */}
        <Box alignItems="center" flexDirection="row">
          <TouchableOpacity
            style={[styles.cancelBtn]}
            onPress={() => {
              navigation.navigate('ChoosePlan');
              dispatch(setRecepitVerificationFailed(false));
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
              View Subscription
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              downgradeToPleb();
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box
                style={[styles.createBtn]}
                backgroundColor={`${colorMode}.greenButtonBackground`}
              >
                <Text numberOfLines={1} style={styles.btnText} color="light.white" bold>
                  Continue as Pleb
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  return (
    <HomeScreenWrapper>
      {/* <BalanceToggle hideAmounts={hideAmounts} setHideAmounts={setHideAmounts} /> */}
      <ActivityIndicatorView visible={defaultWalletCreation} />
      <Box style={styles.titleWrapper}>
        <Box style={styles.titleInfoView}>
          <Text style={styles.titleText} color={`${colorMode}.primaryText`} testID="text_HotWallet">
            {wallets?.length + collaborativeWallets?.length} Wallet
            {wallets?.length + collaborativeWallets?.length > 1 && 's'}
          </Text>
          {/* <Text style={styles.subTitleText} color="light.secondaryText">
            Keys on this app
          </Text> */}
        </Box>
        <Box style={styles.netBalanceView} testID="view_netBalance">
          <CurrencyInfo
            hideAmounts={hideAmounts}
            amount={netBalanceWallets + netBalanceCollaborativeWallets}
            fontSize={20}
            color={`${colorMode}.primaryText`}
            variation={colorMode === 'light' ? 'dark' : 'light'}
          />
        </Box>
      </Box>
      <WalletList
        hideAmounts={hideAmounts}
        flatListRef={flatListRef}
        walletIndex={walletIndex}
        onViewRef={onViewRef}
        viewConfigRef={viewConfigRef}
        wallets={wallets}
        collaborativeWallets={collaborativeWallets}
        setAddImportVisible={() => setAddImportVisible(true)}
      />
      <Box style={styles.listItemsWrapper}>
        <Box style={styles.whirlpoolListItemWrapper} testID="view_WhirlpoolUTXOs">
          {presentationName.length > 0 ? (
            <ListItemView
              icon={<WhirlpoolWhiteIcon />}
              title="Whirlpool & UTXOs"
              subTitle="Manage wallet UTXOs and use Whirlpool"
              iconBackColor={`${colorMode}.pantoneGreen`}
              onPress={() => {
                if (currentWallet)
                  navigation.navigate('UTXOManagement', {
                    data: currentWallet,
                    routeName: 'Wallet',
                    accountType: WalletType.DEFAULT,
                  });
              }}
            />
          ) : (
            <Box style={styles.AddNewWalletIllustrationWrapper}>
              <Box style={styles.addNewWallIconWrapper}>
                <AddNewWalletIllustration />
              </Box>
              <Box style={styles.addNewWallTextWrapper}>
                <Text color="light.secondaryText" style={styles.addNewWallText}>
                  Add a new Wallet or Import one
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <KeeperModal
        visible={transferPolicyVisible}
        close={() => {
          setTransferPolicyVisible(false);
        }}
        title="Edit Transfer Policy"
        subTitle="Threshold amount at which transfer is triggered"
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <TransferPolicy
            wallet={currentWallet}
            close={() => {
              showToast('Transfer Policy Changed', <TickIcon />);
              setTransferPolicyVisible(false);
            }}
            secondaryBtnPress={() => {
              setTransferPolicyVisible(false);
            }}
          />
        )}
      />
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        balance={balance}
        name={presentationName}
      />

      <KeeperModal
        dismissible={false}
        close={() => { }}
        visible={recepitVerificationFailed}
        title="Failed to validate your subscription"
        subTitle="Do you want to downgrade to Pleb and continue?"
        Content={DowngradeModalContent}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        subTitleWidth={wp(210)}
        closeOnOverlayClick={() => { }}
        showButtons
        showCloseIcon={false}
      />
      <KeeperModal
        visible={addImportVisible}
        close={() => setAddImportVisible(false)}
        title="Add or Import Wallet"
        subTitle="Create purpose specific wallets having dedicated UTXOs. Manage other app wallets by importing them"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => (
          <AddImportWallet wallets={wallets} collaborativeWallets={collaborativeWallets} />
        )}
      />
      <KeeperModal
        visible={electrumErrorVisible}
        close={() => setElectrumErrorVisible(false)}
        title="Connection error"
        subTitle="Unable to connect to public electrum servers"
        buttonText="Continue"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor="light.white"
        DarkCloseIcon={colorMode === 'dark'}
        buttonCallback={() => setElectrumErrorVisible(false)}
        Content={ElectrumErrorContent}
      />
    </HomeScreenWrapper>
  );
};

export default WalletsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  titleWrapper: {
    marginVertical: windowHeight > 680 ? hp(5) : 0,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: hp(20),
  },
  titleText: {
    fontSize: 16,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
  subTitleText: {
    fontSize: 12,
  },
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceUnit: {
    letterSpacing: 0.6,
    fontSize: 12,
  },
  walletsContainer: {
    marginTop: 18,
    height: hp(210),
    width: '100%',
  },
  walletContainer: {
    borderRadius: hp(10),
    width: wp(TILE_WIDTH),
    marginHorizontal: TILE_MARGIN / 2,
    height: hp(210),
    padding: wp(15),
    alignContent: 'space-between',
  },
  addWalletText: {
    fontSize: 14,
    textAlign: 'center',
  },
  walletCard: {
    paddingTop: windowHeight > 680 ? hp(20) : 0,
  },
  walletInnerView: {
    width: wp(170),
  },
  walletDescription: {
    letterSpacing: 0.2,
    fontSize: 13,
  },
  walletName: {
    letterSpacing: 0.2,
    fontSize: 11,
    fontWeight: '400',
  },
  walletBalance: {
    marginTop: hp(12),
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },

  unconfirmedText: {
    fontSize: 11,
    letterSpacing: 0.72,
    textAlign: 'right',
  },
  unconfirmedBalance: {
    fontSize: 17,
    letterSpacing: 0.6,
    alignSelf: 'flex-end',
  },
  availableBalance: {
    fontSize: hp(24),
    letterSpacing: 1.2,
    lineHeight: hp(30),
  },
  atViewWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  walletDetailsWrapper: {
    marginTop: 5,
    width: '68%',
  },
  listViewWrapper: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'space-around',
  },
  tranferPolicyWrapper: {
    width: '48%',
    marginRight: wp(10),
  },
  buyWrapper: {
    width: '51%',
  },
  listItemsWrapper: {
    marginTop: hp(20),
    width: '99%',
  },
  whirlpoolListItemWrapper: {
    width: '99%',
  },
  titleInfoView: {
    width: '60%',
  },
  netBalanceView: {
    width: '40%',
    alignItems: 'center',
  },
  addWalletContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  AddNewWalletIllustrationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(30),
    marginTop: hp(20),
    width: '100%',
  },
  addNewWallIconWrapper: {
    marginRight: wp(10),
    alignItems: 'flex-start',
  },
  addNewWallTextWrapper: {
    width: '30%',
    justifyContent: 'center',
  },
  addNewWallText: {
    fontSize: 14,
  },
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  addImportParaContent: {
    fontSize: 13,
    padding: 2,
    marginTop: hp(20),
  },
  walletIconWrapper: {
    marginVertical: hp(5)
  }
});
