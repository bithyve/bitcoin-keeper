import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { VisibilityType, WalletType } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import BtcWhite from 'src/assets/images/btc_white.svg';
import { SatsToBtc } from 'src/constants/Bitcoin';
import dbManager from 'src/storage/realm/dbManager';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import KeeperModal from 'src/components/KeeperModal';
import { useQuery } from '@realm/react';
import { captureError } from 'src/services/sentry';
import useWallets from 'src/hooks/useWallets';
import { useDispatch } from 'react-redux';
import { setNetBalance } from 'src/store/reducers/wallets';

const styles = StyleSheet.create({
  learnMoreContainer: {
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.6,
    alignSelf: 'center',
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
});

function ListItem({ title, subtitle, balance, btnTitle, onBtnPress }) {
  const { colorMode } = useColorMode();
  return (
    <Box flexDirection="row" my={2} alignItems="center">
      <WalletInsideGreen />
      <Box mx={4} flex={1}>
        <Text fontSize={13} color={`${colorMode}.primaryText`}>
          {title}
        </Text>
        <Text fontSize={12} color={`${colorMode}.secondaryText`}>
          {subtitle}
        </Text>
        <Box flexDirection="row" alignItems="center">
          {colorMode === 'light' ? <BtcBlack /> : <BtcWhite />}
          <Text mx={1} fontSize={14} color={`${colorMode}.primaryText`}>
            {SatsToBtc(balance)}
          </Text>
        </Box>
      </Box>

      <TouchableOpacity activeOpacity={0.6} onPress={onBtnPress} testID={`btn${btnTitle}`}>
        <Box
          borderColor="light.learnMoreBorder"
          backgroundColor="light.lightAccent"
          style={styles.learnMoreContainer}
        >
          <Text color="light.learnMoreBorder" style={styles.learnMoreText}>
            {btnTitle}
          </Text>
        </Box>
      </TouchableOpacity>
    </Box>
  );
}

function ManageWallets() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  const { wallets } = useWallets();

  const walletsWithoutWhirlpool: Wallet[] = useQuery(RealmSchema.Wallet).filtered(
    `type != "${WalletType.PRE_MIX}" && type != "${WalletType.POST_MIX}" && type != "${WalletType.BAD_BANK}"`
  );
  const visibleWallets = walletsWithoutWhirlpool.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.DEFAULT
  );
  const hiddenWallets = walletsWithoutWhirlpool.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.HIDDEN
  );
  const [showBalanceAlert, setShowBalanceAlert] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    calculateBalanceAfterVisblityChange();
  }, [wallets]);

  const calculateBalanceAfterVisblityChange = () => {
    const nonHiddenWallets = wallets.filter(
      (wallet) => wallet.presentationData.visibility === VisibilityType.DEFAULT
    );
    let netBalance = 0;
    nonHiddenWallets.forEach((wallet) => {
      const { confirmed, unconfirmed } = wallet.specs.balances;
      netBalance = netBalance + confirmed + unconfirmed;
    });
    dispatch(setNetBalance(netBalance));
  };

  useEffect(() => {
    if (route.params?.isAuthenticated) {
      unhideWallet(selectedWallet);
      navigation.setParams({ isAuthenticated: false });
    }
  }, [route.params?.isAuthenticated]);

  const hideWallet = (wallet: Wallet, checkBalance = true) => {
    if (wallet.specs.balances.confirmed > 0 && checkBalance) {
      setShowBalanceAlert(true);
      setSelectedWallet(wallet);
      return;
    }
    try {
      dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, {
        presentationData: {
          name: wallet.presentationData.name,
          description: wallet.presentationData.description,
          visibility: VisibilityType.HIDDEN,
          shell: wallet.presentationData.shell,
        },
      });
    } catch (error) {
      captureError(error);
    }
  };

  const unhideWallet = (wallet: Wallet) => {
    try {
      dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, {
        presentationData: {
          name: wallet.presentationData.name,
          description: wallet.presentationData.description,
          visibility: VisibilityType.DEFAULT,
          shell: wallet.presentationData.shell,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  function BalanceAlertModalContent() {
    return (
      <Box>
        <Box marginTop={4} alignItems="center" flexDirection="row">
          <TouchableOpacity
            style={[styles.cancelBtn]}
            onPress={() => {
              hideWallet(selectedWallet, false);
              setShowBalanceAlert(false);
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color="light.greenText" bold>
              Continue to Hide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowBalanceAlert(false);
              const walletIndex = visibleWallets.findIndex(
                (wallet) => wallet.id === selectedWallet.id
              );
              navigation.navigate('WalletDetails', { walletId: selectedWallet.id, walletIndex });
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box
                style={[styles.createBtn]}
                backgroundColor={`${colorMode}.greenButtonBackground`}
              >
                <Text numberOfLines={1} style={styles.btnText} color="light.white" bold>
                  Move Funds
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <HeaderTitle
        title={settings.ManageWallets}
        subtitle={settings.ManageWalletsSub}
        paddingLeft={wp(25)}
      />
      <FlatList
        data={visibleWallets}
        extraData={[visibleWallets, hiddenWallets]}
        style={{ height: '50%' }}
        contentContainerStyle={{ marginHorizontal: 20, marginTop: '5%' }}
        renderItem={({ item }) => (
          <ListItem
            title={item.presentationData.name}
            subtitle={item.presentationData.description}
            balance={item.specs.balances.confirmed}
            btnTitle="Hide"
            onBtnPress={() => hideWallet(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
      />
      <Box backgroundColor="#BABABA" height={0.4} width="100%" />
      <FlatList
        data={hiddenWallets}
        extraData={[visibleWallets, hiddenWallets]}
        style={{ height: '50%' }}
        contentContainerStyle={{ marginHorizontal: 20 }}
        renderItem={({ item }) => (
          <ListItem
            title={item.presentationData.name}
            subtitle={item.presentationData.description}
            balance={item.specs.balances.confirmed}
            btnTitle="Unhide"
            onBtnPress={() => {
              setSelectedWallet(item);
              navigation.navigate('Login', {
                relogin: true,
                screen: 'ManageWallets',
                title: 'Enter Passcode to Unhide Wallet',
              });
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
      />
      <KeeperModal
        dismissible
        close={() => {
          setShowBalanceAlert(false);
        }}
        visible={showBalanceAlert}
        title="You have funds in your wallet"
        subTitle="It seems you have a balance in your wallet. Are you sure do you want to hide it?"
        Content={BalanceAlertModalContent}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        closeOnOverlayClick={() => { }}
        showButtons
        showCloseIcon={false}
      />
    </ScreenWrapper>
  );
}

export default ManageWallets;
