import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { VisibilityType, WalletType } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
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
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';

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
  walletInfoContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    gap: 5,
    width: '100%',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    gap: 10,
  },
  bottomIcon: {
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function ListItem({ title, subtitle, balance, btnTitle, onBtnPress }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={{ flexDirection: 'row', gap: 10, width: '90%' }}>
      <TouchableOpacity style={{ gap: 2, alignItems: 'center', justifyContent: 'center' }}>
        <WalletInsideGreen />
      </TouchableOpacity>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletInfoContainer}>
        <Box style={{ flexDirection: 'row', gap: 10 }}>
          <Box style={styles.iconContainer} backgroundColor={`${colorMode}.primaryGreenBackground`}>
            <WalletIcon />
          </Box>
          <Box>
            <Text fontSize={13} color={`${colorMode}.primaryText`}>
              {title}
            </Text>
            <Text fontSize={12} color={`${colorMode}.secondaryText`}>
              {subtitle}
            </Text>
          </Box>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" alignItems="center">
            {colorMode === 'light' ? <BtcBlack /> : <BtcWhite />}
            <Text mx={1} fontSize={14} color={`${colorMode}.primaryText`}>
              {SatsToBtc(balance)}
            </Text>
          </Box>
          <TouchableOpacity activeOpacity={0.6} onPress={onBtnPress} testID={`btn${btnTitle}`}>
            <Box
              borderColor="light.RussetBrown"
              backgroundColor="light.RussetBrown"
              style={styles.learnMoreContainer}
            >
              <Text color={`${colorMode}.white`} style={styles.learnMoreText}>
                {btnTitle}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
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
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

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

  const onProceed = () => {
    unhideWallet(selectedWallet);
  };

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
      <KeeperHeader
        title={settings.ManageWallets}
        subtitle={settings.ManageWalletsSub}
        rightComponent={<CurrencyTypeSwitch />}
      />
      <FlatList
        data={visibleWallets}
        extraData={[visibleWallets, hiddenWallets]}
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
      <Box backgroundColor="#BABABA" height={0.9} width="100%" />
      <Box style={styles.footer}>
        <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.bottomIcon}>
          <WalletIcon />
        </Box>
        <Text style={{ fontWeight: '500' }} color={`${colorMode}.primaryText`}>
          Show all
        </Text>
      </Box>
      {/* <FlatList
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
              setConfirmPassVisible(true);
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
      /> */}
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
        closeOnOverlayClick={() => {}}
        showButtons
        showCloseIcon={false}
      />

      <KeeperModal
        visible={confirmPassVisible}
        close={() => setConfirmPassVisible(false)}
        title={'Confirm Passcode'}
        subTitleWidth={wp(240)}
        subTitle={''}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
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
    </ScreenWrapper>
  );
}

export default ManageWallets;
