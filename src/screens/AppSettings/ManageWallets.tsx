import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { EntityKind, VisibilityType, WalletType } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import HideWalletIcon from 'src/assets/images/hide_wallet.svg';
import ShowIcon from 'src/assets/images/show.svg';
import dbManager from 'src/storage/realm/dbManager';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import KeeperModal from 'src/components/KeeperModal';
import { useQuery } from '@realm/react';
import { captureError } from 'src/services/sentry';
import useWallets from 'src/hooks/useWallets';
import { useDispatch } from 'react-redux';
import { setNetBalance } from 'src/store/reducers/wallets';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import useVault from 'src/hooks/useVault';
import { Vault } from 'src/services/wallets/interfaces/vault';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';

function ListItem({ title, subtitle, balance, onBtnPress, isHidden }) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    // TODO: Drag and rearrange wallet functionality
    // <Box style={{ flexDirection: 'row', gap: 10, width: '90%' }}>
    //   <TouchableOpacity style={{ gap: 2, alignItems: 'center', justifyContent: 'center' }}>
    //     <AlignIcon />
    //   </TouchableOpacity>
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletInfoContainer}>
      <Box style={styles.textContainer}>
        <HexagonIcon
          width={32}
          height={28}
          backgroundColor={Colors.pantoneGreen}
          icon={<WalletIcon />}
        />
        <Box>
          <Text fontSize={13} color={`${colorMode}.primaryText`}>
            {title}
          </Text>
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            {subtitle}
          </Text>
        </Box>
      </Box>
      <Box style={styles.justifyContent}>
        <Box style={styles.alignCenter}>
          {getCurrencyIcon(BTC, 'green')}
          <Text fontSize={15} color={`${colorMode}.primaryText`}>
            {` ${getBalance(balance)} ${getSatUnit()}`}
          </Text>
        </Box>
        <TouchableOpacity activeOpacity={0.6} onPress={onBtnPress} testID="btnHide">
          <Box
            borderColor={`${colorMode}.BrownNeedHelp`}
            backgroundColor={`${colorMode}.BrownNeedHelp`}
            style={styles.learnMoreContainer}
          >
            {isHidden ? <ShowIcon /> : <HideWalletIcon />}
            <Text color={`${colorMode}.white`} medium style={styles.learnMoreText}>
              {isHidden ? 'Unhide' : 'Hide'}
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
    // </Box>
  );
}

function ManageWallets() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  const { wallets } = useWallets({ getAll: true }); // contains all wallets(hidden/unhidden) except for whirlpool wallets

  const { allVaults } = useVault({ includeArchived: false });
  const allWallets: (Wallet | Vault)[] = [...wallets, ...allVaults].filter((item) => item !== null);

  const visibleWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.DEFAULT
  );
  const hiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.HIDDEN
  );
  const [showBalanceAlert, setShowBalanceAlert] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const navigation = useNavigation();
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
    updateWalletVisibility(selectedWallet, false);
  };

  const updateWalletVisibility = (wallet: Wallet | Vault, hide: boolean, checkBalance = true) => {
    const { id, entityKind, specs } = wallet;
    const isWallet = entityKind === EntityKind.WALLET;

    if (hide && checkBalance && specs.balances.confirmed + specs.balances.unconfirmed > 0) {
      setShowBalanceAlert(true);
      setSelectedWallet(wallet);
      return;
    }

    try {
      const visibilityType = hide ? VisibilityType.HIDDEN : VisibilityType.DEFAULT;
      const schema = isWallet ? RealmSchema.Wallet : RealmSchema.Vault;

      dbManager.updateObjectById(schema, id, {
        presentationData: {
          name: wallet.presentationData.name,
          description: wallet.presentationData.description,
          visibility: visibilityType,
          shell: wallet.presentationData.shell,
        },
      });
    } catch (error) {
      console.log(error);
      captureError(error);
    }
  };

  function BalanceAlertModalContent() {
    return (
      <Box style={styles.modalContainer}>
        <Text
          color={`${colorMode}.secondaryText`}
          style={styles.unhideText}
        >{`You can unhide this wallet anytime from App Settings >Manage Wallets > Unhide Wallet`}</Text>
        <Box style={styles.BalanceModalContainer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              updateWalletVisibility(selectedWallet, true, false);
              setShowBalanceAlert(false);
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
              Continue to Hide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowBalanceAlert(false);
              navigation.dispatch(CommonActions.navigate('Send', { sender: selectedWallet }));
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box style={styles.createBtn} backgroundColor={`${colorMode}.greenButtonBackground`}>
                <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.white`} bold>
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
        title={settings.ManageWalletsTitle}
        subtitle={settings.ManageWalletsSub}
        rightComponent={<CurrencyTypeSwitch />}
      />
      <FlatList
        data={allWallets}
        extraData={[visibleWallets, hiddenWallets]}
        contentContainerStyle={styles.walletsContainer}
        renderItem={({ item }) => (
          <ListItem
            title={item.presentationData.name}
            subtitle={item.presentationData.description}
            balance={item.specs.balances.confirmed + item.specs.balances.unconfirmed}
            isHidden={item.presentationData.visibility === VisibilityType.HIDDEN}
            onBtnPress={
              item.presentationData.visibility === VisibilityType.HIDDEN
                ? () => {
                    setConfirmPassVisible(true);
                    setSelectedWallet(item);
                  }
                : () => updateWalletVisibility(item, true)
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
      />

      {/* TODO: showAll/hideAll wallet functionality
      <Box backgroundColor="#BABABA" height={0.9} width="100%" />
      <Pressable onPress={() => setShowAll(true)} style={styles.footer}>
        <Box backgroundColor={`${colorMode}.BrownNeedHelp`} style={styles.bottomIcon}>
          <ShowAllIcon />
        </Box>
        <Text style={{ fontWeight: '500' }} color={`${colorMode}.primaryText`}>
          Show all
        </Text>
      </Pressable> */}

      <KeeperModal
        dismissible
        close={() => {
          setShowBalanceAlert(false);
        }}
        visible={showBalanceAlert}
        title="You have funds in your wallet"
        subTitle="You have sats in your wallet. Are you sure you want to hide it?"
        Content={BalanceAlertModalContent}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(240)}
        closeOnOverlayClick={false}
        showButtons
        showCloseIcon={false}
      />

      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        showCloseIcon={false}
        title="Enter Passcode"
        subTitleWidth={wp(240)}
        subTitle="Confirm passcode to unhide wallets"
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

const styles = StyleSheet.create({
  learnMoreContainer: {
    flexDirection: 'row',
    gap: 3,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.24,
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
  textContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  justifyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  BalanceModalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  walletsContainer: {
    marginHorizontal: 20,
    marginTop: '5%',
  },
  modalContainer: {
    gap: 40,
  },
  unhideText: {
    fontSize: 13,
    width: wp(200),
  },
});
