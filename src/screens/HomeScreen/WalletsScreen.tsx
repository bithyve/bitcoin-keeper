import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Box, useColorMode } from 'native-base';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { EntityKind, VaultType, VisibilityType, WalletType } from 'src/core/wallets/enums';
import GradientIcon from 'src/screens/WalletDetails/components/GradientIcon';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletDark from 'src/assets/images/walletDark.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import AddWallet from 'src/assets/images/addWallet.svg';
import ImportWallet from 'src/assets/images/importWallet.svg';
import AddCollaborativeWalletIcon from 'src/assets/images/icon_collab.svg';
import WhirlpoolWhiteIcon from 'src/assets/images/white_icon_whirlpool.svg';
import WhirlpoolDarkIcon from 'src/assets/images/icon_whirlpool_dark.svg';
import AddNewWalletIllustration from 'src/assets/images/addNewWalletIllustration.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import AddSCardIcon from 'src/assets/images/icon_add_white.svg';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
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
import CollaborativeWalletIcon from 'src/assets/images/icon_collaborative_home.svg';
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
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';

const ITEM_SIZE = hp(220);

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

function AddNewWalletTile({ wallet, setAddImportVisible }) {
  return (
    <TouchableOpacity
      style={styles.addWalletContainer}
      onPress={() => setAddImportVisible()}
      testID="btn_add_wallet"
    >
      <AddSCardIcon />
      <Text color="light.white" style={styles.addWalletText}>
        {wallet.AddImportNewWallet}
      </Text>
    </TouchableOpacity>
  );
}

function WalletItem({
  item,
  walletIndex,
  navigation,
  translations,
  hideAmounts,
  setAddImportVisible,
}: {
  item: Wallet | Vault;
  walletIndex: number;
  navigation;
  translations;
  hideAmounts: boolean;
  setAddImportVisible: any;
}) {
  const { colorMode } = useColorMode();
  const { wallet } = translations;
  if (!item) {
    return null;
  }

  if (item.key && item.key === 'add-wallet') {
    return (
      <Box backgroundColor={`${colorMode}.pantoneGreen`} style={[styles.walletContainer]}>
        <AddNewWalletTile wallet={wallet} setAddImportVisible={setAddImportVisible} />
      </Box>
    );
  }
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);
  const isCollaborativeWallet =
    item.entityKind === EntityKind.VAULT && item.type === VaultType.COLLABORATIVE;

  return (
    <TouchableWithoutFeedback
      testID={`view_wallet_${walletIndex}`}
      onPress={() => {
        isCollaborativeWallet
          ? navigation.navigate('VaultDetails', {
              collaborativeWalletId: item.collaborativeWalletId,
            })
          : navigation.navigate('WalletDetails', { walletId: item.id, walletIndex });
      }}
    >
      <Box backgroundColor={`${colorMode}.pantoneGreen`} style={[styles.walletContainer]}>
        <WalletTile
          isWhirlpoolWallet={isWhirlpoolWallet}
          isCollaborativeWallet={isCollaborativeWallet}
          wallet={item}
          balances={item?.specs?.balances}
          hideAmounts={hideAmounts}
        />
      </Box>
    </TouchableWithoutFeedback>
  );
}

function WalletList({
  walletIndex,
  setWalletIndex,
  wallets,
  hideAmounts,
  setAddImportVisible,
  navigation,
}: any) {
  const { translations } = useContext(LocalizationContext);
  const items = [{ key: 'spacer-start' }, ...wallets, { key: 'add-wallet' }, { key: 'spacer-end' }];
  const scrollX = React.useRef(new Animated.Value(0)).current;

  return (
    <Box>
      <Animated.FlatList
        testID="list_wallets"
        keyExtractor={(item) => item.id || item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        disableIntervalMomentum
        decelerationRate={'fast'}
        bounces={false}
        snapToInterval={ITEM_SIZE}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
          listener: (event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / ITEM_SIZE);
            if (walletIndex !== index) {
              setWalletIndex(index);
            }
          },
        })}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 2) * ITEM_SIZE, (index - 1) * ITEM_SIZE, index * ITEM_SIZE];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8] });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6] });
          if (item.key && item.key.includes('spacer')) {
            return <View style={{ width: (windowWidth - ITEM_SIZE) / 2 }} />;
          }
          return (
            <Animated.View style={{ transform: [{ scale }], opacity, width: ITEM_SIZE }}>
              <WalletItem
                hideAmounts={hideAmounts}
                item={item}
                walletIndex={walletIndex}
                navigation={navigation}
                translations={translations}
                setAddImportVisible={setAddImportVisible}
              />
            </Animated.View>
          );
        }}
      />
    </Box>
  );
}

function WalletTile({ wallet, balances, isWhirlpoolWallet, hideAmounts, isCollaborativeWallet }) {
  const { colorMode } = useColorMode();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;
  return (
    <Box>
      <Box style={styles.walletCard}>
        <Box style={styles.walletInnerView}>
          {isWhirlpoolWallet ? (
            <GradientIcon Icon={WhirlpoolAccountIcon} height={35} />
          ) : isCollaborativeWallet ? (
            <CollaborativeWalletIcon />
          ) : (
            <Box style={styles.walletIconWrapper}>
              {colorMode === 'light' ? <WalletActiveIcon /> : <WalletDark />}
            </Box>
          )}

          <Box style={styles.walletDetailsWrapper}>
            {wallet?.type === 'IMPORTED' ? (
              <Text color={`${colorMode}.white`} style={styles.walletType}>
                {importWallet.importedWalletTitle}
              </Text>
            ) : null}
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

const addNewDefaultWallet = (walletsCount, dispatch) => {
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

function AddImportWallet({
  wallets,
  collaborativeWallets,
  setAddImportVisible,
  setDefaultWalletCreation,
  navigation,
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

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
      addNewDefaultWallet(wallets.length, dispatch);
    }
  };

  return (
    <Box>
      <MenuItemButton
        onPress={() => {
          setAddImportVisible(false);
          navigation.navigate('EnterWalletDetail', {
            name: `Wallet ${wallets.length + 1}`,
            description: 'Single-sig Wallet',
            type: WalletType.DEFAULT,
          });
        }}
        icon={<AddWallet />}
        title={wallet.addWallet}
        subTitle={wallet.addWalletSubTitle}
        height={80}
      />
      <MenuItemButton
        onPress={() => {
          setAddImportVisible(false);
          navigation.navigate('ImportWallet');
        }}
        icon={<ImportWallet />}
        title={wallet.importWalletTitle}
        subTitle={wallet.manageWalletSubTitle}
        height={80}
      />
      <MenuItemButton
        onPress={addCollaborativeWallet}
        icon={<AddCollaborativeWalletIcon />}
        title={wallet.addCollabWalletTitle}
        subTitle={wallet.addCollabWalletSubTitle}
        height={80}
      />
      <Box>
        <Text color={`${colorMode}.greenText`} style={styles.addImportParaContent}>
          {wallet.addCollabWalletParagraph}
        </Text>
      </Box>
    </Box>
  );
}

function ElectrumErrorContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <Box width={wp(320)}>
      <Box margin={hp(5)}>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      </Box>
      <Box>
        <Text color={`${colorMode}.greenText`} fontSize={13} padding={1} letterSpacing={0.65}>
          {common.changeNetwork}
        </Text>
      </Box>
    </Box>
  );
}

async function downgradeToPleb(dispatch, app) {
  try {
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

function DowngradeModalContent({ navigation, app }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  // const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  return (
    <Box>
      {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
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
            {common.viewSubscription}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            downgradeToPleb(dispatch, app);
          }}
        >
          <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
            <Box style={[styles.createBtn]} backgroundColor={`${colorMode}.greenButtonBackground`}>
              <Text numberOfLines={1} style={styles.btnText} color="light.white" bold>
                {common.continuePleb}
              </Text>
            </Box>
          </Shadow>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

const WalletsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, choosePlan, importWallet, common } = translations;
  const { wallets } = useWallets({ getAll: true });
  const { collaborativeWallets } = useCollaborativeWallet();
  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets = nonHiddenWallets.concat(collaborativeWallets);
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceCollaborativeWallets = calculateBalancesForVaults(collaborativeWallets);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const currentWallet = allWallets[walletIndex];
  const [addImportVisible, setAddImportVisible] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [defaultWalletCreation, setDefaultWalletCreation] = useState(false);

  const { showToast } = useToastMessage();
  const { recepitVerificationFailed } = useAppSelector((state) => state.login);

  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );
  const hideAmounts = false;

  useEffect(() => {
    if (electrumClientConnectionStatus.success) {
      showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
      if (electrumErrorVisible) setElectrumErrorVisible(false);
    } else if (electrumClientConnectionStatus.failed) {
      showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
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

  return (
    <HomeScreenWrapper>
      <ActivityIndicatorView visible={defaultWalletCreation} />
      <Box style={styles.titleWrapper}>
        <Box style={styles.titleInfoView}>
          <Text style={styles.titleText} color={`${colorMode}.primaryText`} testID="text_HotWallet">
            {nonHiddenWallets?.length + collaborativeWallets?.length} Wallet
            {nonHiddenWallets?.length + collaborativeWallets?.length > 1 && 's'}
          </Text>
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
        walletIndex={walletIndex}
        setWalletIndex={setWalletIndex}
        wallets={allWallets}
        walletsCount={wallets.length}
        setAddImportVisible={() => setAddImportVisible(true)}
        navigation={navigation}
      />
      <Box style={styles.listItemsWrapper}>
        <Box style={styles.whirlpoolListItemWrapper} testID="view_WhirlpoolUTXOs">
          {!currentWallet ? (
            <Box style={styles.AddNewWalletIllustrationWrapper}>
              <Box style={styles.addNewWallIconWrapper}>
                <AddNewWalletIllustration />
              </Box>
              <Box style={styles.addNewWallTextWrapper}>
                {
                  //TESTING
                }
                <TouchableOpacity onPress={() => navigation.navigate('AddWallet')}>
                  <Text color="light.secondaryText" style={styles.addNewWallText}>
                    Add a new wallet, import it, or create a collaborative wallet.
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={() => navigation.navigate('AddSigner')}>
                  <Text color="light.secondaryText" style={styles.addNewWallText}>
                    Add a new wallet, import it, or create a collaborative wallet.
                  </Text>
                </TouchableOpacity> */}
              </Box>
            </Box>
          ) : currentWallet.entityKind === EntityKind.VAULT ? null : (
            <ListItemView
              icon={colorMode === 'light' ? <WhirlpoolWhiteIcon /> : <WhirlpoolDarkIcon />}
              title={wallet.whirlpoolUtxoTitle}
              subTitle={wallet.whirlpoolUtxoSubTitle}
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
          )}
        </Box>
      </Box>
      <KeeperModal
        dismissible={false}
        close={() => {}}
        visible={recepitVerificationFailed}
        title={choosePlan.validateSubscriptionTitle}
        subTitle={choosePlan.validateSubscriptionSubTitle}
        Content={() => <DowngradeModalContent app={app} navigation={navigation} />}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        subTitleWidth={wp(210)}
        showButtons
        showCloseIcon={false}
      />
      <KeeperModal
        visible={addImportVisible}
        close={() => setAddImportVisible(false)}
        title={importWallet.AddImportModalTitle}
        subTitle={importWallet.AddImportModalSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => (
          <AddImportWallet
            wallets={wallets}
            collaborativeWallets={collaborativeWallets}
            setAddImportVisible={setAddImportVisible}
            setDefaultWalletCreation={setDefaultWalletCreation}
            walletIndex={walletIndex}
            navigation={navigation}
          />
        )}
      />
      <KeeperModal
        visible={electrumErrorVisible}
        close={() => setElectrumErrorVisible(false)}
        title={common.connectionError}
        subTitle={common.electrumErrorSubTitle}
        buttonText={common.continue}
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
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginVertical: hp(20),
    justifyContent: 'space-between',
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
  walletContainer: {
    borderRadius: hp(10),
    height: hp(210),
    padding: '10%',
    justifyContent: 'flex-end',
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
    fontSize: 14,
    fontWeight: '400',
  },
  walletType: {
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
  walletDetailsWrapper: {
    marginTop: 5,
    width: '68%',
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
    alignItems: 'flex-end',
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
    width: '50%',
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
    marginVertical: hp(5),
  },
});
