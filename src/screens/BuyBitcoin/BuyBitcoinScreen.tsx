import React, { useContext } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import { getCountry } from 'react-native-localize';
import { fetchRampReservation } from 'src/services/thirdparty/ramp';
import { hp, wp } from 'src/constants/responsive';
import HexagonIcon from 'src/components/HexagonIcon';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { EntityKind, VaultType } from 'src/services/wallets/enums';

function BuyBitcoinScreen({ route }) {
  const { colorMode } = useColorMode();
  const { currencyCode } = useAppSelector((state) => state.settings);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const { wallet } = route.params;
  const receivingAddress = wallet.specs.receivingAddress;
  const balance = wallet.specs.balances.confirmed;
  const name = wallet.presentationData.name;

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
        <Box style={styles.toWalletWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
          <Text fontSize={13} color={`${colorMode}.primaryText`}>
            Bitcoin will be transferred to
          </Text>
          <Box style={styles.iconContainer}>
            <HexagonIcon
              width={40}
              height={35}
              backgroundColor={'rgba(45, 103, 89, 1)'}
              icon={getWalletIcon(wallet)}
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
        </Box>

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
      <Box style={styles.flexSpacer} />

      <Text color={`${colorMode}.black`} style={styles.buyBtcContent}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>

      <Box style={styles.footer}>
        <Buttons
          primaryText={common.proceed}
          primaryCallback={() => buyWithRamp(receivingAddress)}
          fullWidth
        />
      </Box>
    </ScreenWrapper>
  );
}

export default BuyBitcoinScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(50),
    marginHorizontal: wp(10),
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: '3%',
    marginVertical: hp(10),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buyBtcContent: {
    fontSize: 13,
    letterSpacing: 0.13,
    lineHeight: 20,
    width: wp(290),
    marginHorizontal: wp(10),
    marginVertical: hp(20),
  },
  toWalletWrapper: {
    height: hp(110),
    marginTop: hp(20),
    paddingHorizontal: wp(20),
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
  flexSpacer: {
    flex: 1,
  },
});
