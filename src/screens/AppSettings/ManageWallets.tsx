import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { EntityKind, VisibilityType, WalletType } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import HideWalletIcon from 'src/assets/images/hide_wallet.svg';
import ShowIcon from 'src/assets/images/show.svg';
import ShowAllIcon from 'src/assets/images/eye_folder.svg';
import AlignIcon from 'src/assets/images/align_right.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import BtcWhite from 'src/assets/images/btc_white.svg';
import { SatsToBtc } from 'src/constants/Bitcoin';
import dbManager from 'src/storage/realm/dbManager';
import { useNavigation } from '@react-navigation/native';
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
import { Vault } from 'src/core/wallets/interfaces/vault';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';

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
    marginTop: 4,
  },
  walletsContainer: {
    marginHorizontal: 20,
    marginTop: '5%',
  },
});

function ListItem({ title, subtitle, balance, onBtnPress, isHidden }) {
  const { colorMode } = useColorMode();
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
          {colorMode === 'light' ? <BtcBlack /> : <BtcWhite />}
          <Text mx={1} fontSize={14} color={`${colorMode}.primaryText`}>
            {SatsToBtc(balance)}
          </Text>
        </Box>
        <TouchableOpacity activeOpacity={0.6} onPress={onBtnPress} testID="btnHide">
          <Box
            borderColor="light.RussetBrown"
            backgroundColor="light.RussetBrown"
            style={styles.learnMoreContainer}
          >
            {isHidden ? <ShowIcon /> : <HideWalletIcon />}
            <Text color={`${colorMode}.white`} style={styles.learnMoreText}>
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

  const { wallets } = useWallets();

  const walletsWithoutWhirlpool: Wallet[] = useQuery(RealmSchema.Wallet).filtered(
    `type != "${WalletType.PRE_MIX}" && type != "${WalletType.POST_MIX}" && type != "${WalletType.BAD_BANK}"`
  );

  const { allVaults } = useVault({ includeArchived: false });
  const allWallets: (Wallet | Vault)[] = [...walletsWithoutWhirlpool, ...allVaults].filter(
    (item) => item !== null
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

    if (hide && checkBalance && specs.balances.confirmed > 0) {
      setShowBalanceAlert(true);
      setSelectedWallet(wallet);
      return;
    }

    try {
      const visibilityType = hide ? VisibilityType.HIDDEN : VisibilityType.DEFAULT;
      console.log({ visibilityType });
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
      <Box>
        <Box style={[styles.alignCenter, styles.BalanceModalContainer]}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              updateWalletVisibility(selectedWallet, true, false);
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
              <Box style={styles.createBtn} backgroundColor={`${colorMode}.greenButtonBackground`}>
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
        data={allWallets}
        extraData={[visibleWallets, hiddenWallets]}
        contentContainerStyle={styles.walletsContainer}
        renderItem={({ item }) => (
          <ListItem
            title={item.presentationData.name}
            subtitle={item.presentationData.description}
            balance={item.specs.balances.confirmed}
            isHidden={item.presentationData.visibility === VisibilityType.HIDDEN}
            onBtnPress={
              item.presentationData.visibility === VisibilityType.HIDDEN
                ? () => updateWalletVisibility(item, false)
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
        <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.bottomIcon}>
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
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle=""
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
