import { Box, useColorMode, View } from 'native-base';
import React, { useContext, useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import DashedCta from 'src/components/DashedCta';
import WalletCard from './WalletCard';
import Colors from 'src/theme/Colors';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

import useWalletAsset from 'src/hooks/useWalletAsset';
import { EntityKind, VisibilityType, WalletType } from 'src/services/wallets/enums';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';

import NewWalletIcon from 'src/assets/images/wallet-white-small.svg';
import ImportWalletIcon from 'src/assets/images/import.svg';
import CollaborativeWalletIcon from 'src/assets/images/collaborative_vault_white.svg';

import { useAppSelector } from 'src/store/hooks';
import { resetCollaborativeSession } from 'src/store/reducers/vaults';
import { useDispatch } from 'react-redux';
import { autoSyncWallets, refreshWallets } from 'src/store/sagaActions/wallets';
import { RefreshControl } from 'react-native';
import { ELECTRUM_CLIENT } from 'src/services/electrum/client';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitCoinWalletLogo from 'src/assets/images/bitcoin-wallet-logo.svg';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import {
  getAvailableBalanceUSDTWallet,
  USDTWallet,
  USDTWalletSupportedNetwork,
  USDTWalletType,
} from 'src/services/wallets/factories/USDTWalletFactory';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

const HomeWallet = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const { wallets } = useWallets({ getAll: true });
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText, home, common, usdtWalletText } = translations;
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const { usdtWallets, createWallet } = useUSDTWallets();
  const { collaborativeSession } = useAppSelector((state) => state.vault);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  const dispatch = useDispatch();
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [collabSessionExistsModalVisible, setCollabSessionExistsModalVisible] = useState(false);
  const [pullRefresh, setPullRefresh] = useState(false);
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const [pickWalletType, setPickWalletType] = useState(false);
  const [createUsdtWallet, setCreateUsdtWallet] = useState(false);
  const syncing =
    ELECTRUM_CLIENT.isClientConnected &&
    Object.values(walletSyncing).some((isSyncing) => isSyncing);

  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault | USDTWallet)[] = [
    ...nonHiddenWallets,
    ...allVaults,
    ...usdtWallets,
  ].filter((item) => item !== null);
  const [isShowAmount, setIsShowAmount] = useState(false);
  const DashedCta_hexagonBackgroundColor = ThemedColor({
    name: 'DashedCta_hexagonBackgroundColor',
  });
  const dashed_CTA_background = ThemedColor({
    name: 'dashed_CTA_background',
  });
  const { showToast } = useToastMessage();

  const handleCollaborativeWalletCreation = () => {
    setShowAddWalletModal(false);
    if (Object.keys(collaborativeSession.signers).length > 0) {
      setCollabSessionExistsModalVisible(true);
    } else {
      dispatch(resetCollaborativeSession());
      setTimeout(() => {
        navigation.navigate('SetupCollaborativeWallet');
      }, 500); // delaying navigation by 0.5 second to ensure collaborative session reset
    }
  };

  const pullDownRefresh = () => {
    setPullRefresh(true);

    dispatch(autoSyncWallets(false, false, true));
    setPullRefresh(false);
  };

  const importUSDTWallet = async (mnemonic) => {
    try {
      const { newWallet, error } = await createWallet({
        type: USDTWalletType.IMPORTED,
        name: 'USDT Wallet',
        description: 'Imported USDT Wallet',
        importDetails: {
          mnemonic,
        },
      });

      if (newWallet) {
        showToast('USDT wallet imported successfully!', <TickIcon />);
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Home',
              params: { selectedOption: 'Wallets' },
            })
          );
        }, 900);
      } else {
        throw new Error(error);
      }
    } catch (err) {
      showToast(`Failed to import USDT wallet: ${err.message}`, <ToastErrorIcon />);
    }
  };

  const CREATE_WALLET_OPTIONS = [
    {
      title: walletText.createWallet,
      subtitle: walletText.createWalletDesc,
      icon: <NewWalletIcon />,
      onPress: () => {
        setShowAddWalletModal(false);
        navigation.navigate('AddNewWallet');
      },
      id: 'newWallet',
    },
    {
      title: home.ImportWallet,
      subtitle: walletText.restoreExistingWallet,
      icon: <ImportWalletIcon />,
      onPress: () => {
        setShowAddWalletModal(false);
        navigation.navigate('VaultConfigurationCreation');
      },
      id: 'importWallet',
    },
    {
      title: common.collaborativeWallet,
      subtitle: walletText.walletWithFamily,
      icon: <CollaborativeWalletIcon />,
      onPress: handleCollaborativeWalletCreation,
      id: 'collaborativeWallet',
    },
  ];
  const CREATE_USDT_WALLET_OPTIONS = [
    {
      title: walletText.createWallet,
      subtitle: 'Create a new USDT wallet',
      icon: <NewWalletIcon />,
      onPress: () => {
        navigation.navigate('addUsdtWallet');
        setCreateUsdtWallet(false);
      },
      id: 'usdtnewWallet',
    },
    {
      title: home.ImportWallet,
      subtitle: walletText.restoreExistingWallet,
      icon: <ImportWalletIcon />,
      onPress: () => {
        setCreateUsdtWallet(false);
        navigation.dispatch(
          CommonActions.navigate({
            name: 'EnterSeedScreen',
            params: {
              isImport: true,
              isUSDTWallet: true,
              importSeedCta: importUSDTWallet,
            },
          })
        );
      },
      id: 'usdtimportWallet',
    },
  ];

  const renderWalletCard = ({ item }: { item: Wallet | Vault | USDTWallet }) => {
    const handleWalletPress = (item, navigation) => {
      if (item.entityKind === EntityKind.VAULT) {
        navigation.navigate('VaultDetails', { vaultId: item.id, autoRefresh: true });
      } else if (item.entityKind === EntityKind.USDT_WALLET) {
        navigation.navigate('usdtDetails', { usdtWalletId: item.id });
      } else {
        navigation.navigate('WalletDetails', { walletId: item.id, autoRefresh: true });
      }
    };
    return (
      <TouchableOpacity
        onPress={() => handleWalletPress(item, navigation)}
        testID={`wallet_item_${item.id}`}
      >
        <WalletCard
          backgroundColor={getWalletCardGradient(item)}
          hexagonBackgroundColor={
            item.entityKind === EntityKind.USDT_WALLET ? Colors.aqualightMarine : Colors.CyanGreen
          }
          iconWidth={42}
          iconHeight={38}
          title={item.presentationData.name}
          tags={getWalletTags(item)}
          totalBalance={
            item.entityKind === EntityKind.USDT_WALLET
              ? getAvailableBalanceUSDTWallet(item as USDTWallet)
              : item.specs.balances.confirmed + item.specs.balances.unconfirmed
          }
          description={item.presentationData.description}
          wallet={item}
          isShowAmount={isShowAmount}
          setIsShowAmount={setIsShowAmount}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Box style={styles.walletContainer}>
      <ActivityIndicatorView visible={syncing} showLoader />
      <DashedCta
        backgroundColor={dashed_CTA_background}
        hexagonBackgroundColor={DashedCta_hexagonBackgroundColor}
        textColor={`${colorMode}.greenWhiteText`}
        name={walletText.addWallet}
        callback={() => setPickWalletType(true)}
        icon={<ThemedSvg name={'add_wallet_plus_icon'} width={9} height={9} />}
        iconWidth={22}
        iconHeight={20}
        cardStyles={styles.DashedCtaStyle}
      />
      <FlatList
        data={allWallets}
        renderItem={renderWalletCard}
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        keyExtractor={(item, index) => `${item.id || index}`}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
      <KeeperModal
        visible={showAddWalletModal}
        title={walletText.addNewWallet}
        subTitle={walletText.createOrImportWallet}
        close={() => setShowAddWalletModal(false)}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        showCloseIcon
        Content={() => (
          <Box style={styles.addWalletOptionsList}>
            {CREATE_WALLET_OPTIONS.map((option, index) => (
              <OptionItem key={index} option={option} colorMode={colorMode} />
            ))}
          </Box>
        )}
      />
      <KeeperModal
        visible={createUsdtWallet}
        title={walletText.addNewWallet}
        subTitle={walletText.createOrImportWallet}
        close={() => setCreateUsdtWallet(false)}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        showCloseIcon
        Content={() => (
          <Box style={styles.addWalletOptionsList}>
            {CREATE_USDT_WALLET_OPTIONS.map((option, index) => (
              <OptionItem key={index} option={option} colorMode={colorMode} />
            ))}
          </Box>
        )}
      />
      <KeeperModal
        visible={collabSessionExistsModalVisible}
        close={() => setCollabSessionExistsModalVisible(false)}
        title={walletText.collaborativeSessionExists}
        subTitle={walletText.collaborativeSessionExistsDesc}
        buttonText={common.continueSession}
        secondaryButtonText={common.startNew}
        secondaryCallback={() => {
          setCollabSessionExistsModalVisible(false);
          dispatch(resetCollaborativeSession());
          setTimeout(() => {
            navigation.navigate('SetupCollaborativeWallet');
          }, 500);
        }}
        buttonCallback={() => {
          setCollabSessionExistsModalVisible(false);
          navigation.navigate('SetupCollaborativeWallet');
        }}
      />
      <KeeperModal
        visible={pickWalletType}
        close={() => setPickWalletType(false)}
        title={usdtWalletText.pickWalletType}
        subTitle={usdtWalletText.selectCurrency}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <Box style={styles.walletTypeContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowAddWalletModal(true);
                setPickWalletType(false);
              }}
            >
              <Box
                borderColor={`${colorMode}.separator`}
                backgroundColor={`${colorMode}.boxSecondaryBackground`}
                style={styles.typeCard}
              >
                <CircleIconWrapper
                  width={wp(40)}
                  icon={<BitCoinWalletLogo />}
                  backgroundColor={Colors.BrightOrange}
                />
                <Text color={`${colorMode}.primaryText`} medium>
                  {usdtWalletText.bitcoinWallet}
                </Text>
              </Box>
            </TouchableOpacity>
            {bitcoinNetworkType === USDTWalletSupportedNetwork ? (
              <TouchableOpacity
                onPress={() => {
                  setCreateUsdtWallet(true);
                  setPickWalletType(false);
                }}
              >
                <Box
                  borderColor={`${colorMode}.separator`}
                  backgroundColor={`${colorMode}.boxSecondaryBackground`}
                  style={styles.typeCard}
                >
                  <CircleIconWrapper
                    width={wp(40)}
                    icon={<UsdtWalletLogo />}
                    backgroundColor={Colors.DesaturatedTeal}
                  />
                  <Text color={`${colorMode}.primaryText`} medium>
                    {usdtWalletText.dollarWallet}
                  </Text>
                </Box>
              </TouchableOpacity>
            ) : null}
          </Box>
        )}
      />
    </Box>
  );
};

const OptionItem = ({ option, colorMode }) => {
  return (
    <TouchableOpacity onPress={option.onPress}>
      <Box
        style={styles.optionCTR}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.separator`}
      >
        <CircleIconWrapper
          width={wp(40)}
          icon={option.icon}
          backgroundColor={`${colorMode}.pantoneGreen`}
        />
        <Box>
          <Text
            color={`${colorMode}.secondaryText`}
            fontSize={15}
            medium
            style={styles.optionTitle}
          >
            {option.title}
          </Text>
          <Text color={`${colorMode}.secondaryText`} fontSize={12}>
            {option.subtitle}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default HomeWallet;

const styles = StyleSheet.create({
  walletContainer: {
    gap: 15,
  },
  addWalletOptionsList: {
    gap: wp(15),
    marginBottom: hp(10),
  },
  optionTitle: {
    marginBottom: hp(5),
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    paddingVertical: hp(22),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1,
  },
  customStyle: {
    marginBottom: hp(10),
  },
  DashedCtaStyle: {
    width: windowWidth * 0.88,
  },
  walletTypeContainer: {
    gap: wp(15),
    marginBottom: hp(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  typeCard: {
    width: wp(148),
    height: hp(104),
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    borderRadius: 12,
    gap: wp(10),
  },
});
