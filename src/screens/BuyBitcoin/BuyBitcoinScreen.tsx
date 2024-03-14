import React, { useContext, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import idx from 'idx';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import { getCountry } from 'react-native-localize';
import { fetchRampReservation } from 'src/services/ramp';
import { hp, wp } from 'src/constants/responsive';
import HexagonIcon from 'src/components/HexagonIcon';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import Breadcrumbs from 'src/components/Breadcrumbs';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import BuyBitcoinWalletSelectionModal from './components/BuyBitcoinModal';
import { EntityKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import useVault from 'src/hooks/useVault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

function BuyBitcoinScreen() {
  const { colorMode } = useColorMode();
  const { currencyCode } = useAppSelector((state) => state.settings);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const { wallets } = useWallets({ getAll: true });
  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults].filter(
    (item) => item !== null
  );

  const [selectedWallet, setSelectedWallet] = useState(allWallets[0]);

  const receivingAddress = idx(selectedWallet, (_) => _.specs.receivingAddress) || '';
  const balance = idx(selectedWallet, (_) => _.specs.balances.confirmed) || 0;
  const name = idx(selectedWallet, (_) => _.presentationData.name) || '';

  const [walletSelectionVisible, setWalletSelectionVisible] = useState(false);

  const buyWithRamp = (address: string) => {
    try {
      if (currencyCode === 'GBP' || getCountry() === 'UK') {
        Linking.openURL('https://ramp.network/buy#');
      } else {
        Linking.openURL(fetchRampReservation({ receiveAddress: address }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={'Buy Bitcoin with Ramp'}
        subtitle={
          'Ramp enables BTC purchases using payment methods available, based on your country'
        }
        // To-Do-Learn-More
      />
      <Box style={styles.container}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setWalletSelectionVisible(true)}>
          <Box style={styles.toWalletWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <Text fontSize={13} color={`${colorMode}.primaryText`}>
              Bitcoin will be transferred to
            </Text>
            <Box style={styles.walletInfo}>
              <Box style={styles.iconContainer}>
                <HexagonIcon
                  width={40}
                  height={35}
                  backgroundColor={'rgba(45, 103, 89, 1)'}
                  icon={getWalletIcon(selectedWallet)}
                />
                <Box>
                  <Text style={styles.presentationName} color={`${colorMode}.primaryText`}>
                    {name}
                  </Text>
                  <CurrencyInfo
                    amount={balance}
                    hideAmounts={false}
                    fontSize={14}
                    color={`${colorMode}.primaryText`}
                    variation={colorMode === 'light' ? 'dark' : 'light'}
                  />
                </Box>
              </Box>
              <RightArrowIcon />
            </Box>
          </Box>
        </TouchableOpacity>

        <Box style={styles.toWalletWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
          <Text fontSize={13} color={`${colorMode}.primaryText`}>
            Address for ramp transactions
          </Text>
          <Box style={styles.iconContainer}>
            <HexagonIcon
              width={40}
              height={35}
              backgroundColor={'rgba(145, 120, 93, 1)'}
              icon={
                <Text color={`${colorMode}.primaryBackground`} fontSize={16}>
                  @
                </Text>
              }
            />
            <Text
              style={styles.addressTextView}
              color={`${colorMode}.black`}
              ellipsizeMode="middle"
              numberOfLines={2}
            >
              {receivingAddress}
            </Text>
          </Box>
        </Box>
      </Box>

      <Text color={`${colorMode}.black`} style={styles.buyBtcContent}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>

      <Box style={styles.footer}>
        <Breadcrumbs totalScreens={3} currentScreen={2} />
        <Buttons
          primaryText={common.proceed}
          primaryCallback={() => buyWithRamp(receivingAddress)}
        />
      </Box>

      <KeeperModal
        visible={walletSelectionVisible}
        close={() => setWalletSelectionVisible(false)}
        title="Select Wallet"
        subTitle="Purchased bitcoin would be transferred to selected wallet"
        subTitleWidth={wp(220)}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.SlateGrey`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        Content={() =>
          BuyBitcoinWalletSelectionModal({
            allWallets,
            selectedWallet,
            setSelectedWallet,
            setWalletSelectionVisible,
          })
        }
      />
    </ScreenWrapper>
  );
}

export default BuyBitcoinScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  walletInfo: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buyBtcContent: {
    fontSize: 13,
    letterSpacing: 0.13,
    lineHeight: 20,
    width: wp(200),
    marginHorizontal: 20,
    marginVertical: 20,
  },
  toWalletWrapper: {
    height: hp(110),
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 12,
  },
  presentationName: {
    fontSize: 14,
    letterSpacing: 0.14,
  },
  addressTextView: {
    width: wp(200),
    fontSize: 14,
    letterSpacing: 0.14,
    lineHeight: 20,
  },
});
