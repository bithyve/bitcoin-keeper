import React, { useState } from 'react';
import { Box, Pressable, ScrollView } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import InheritanceIcon from 'src/assets/images/inheritanceWhite.svg';
import BitcoinIcon from 'src/assets/images/icon_bitcoin_white.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import useVault from 'src/hooks/useVault';
import idx from 'idx';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Colors from 'src/theme/Colors';
import ListItemView from './components/ListItemView';
import CurrencyInfo from './components/CurrencyInfo';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import HomeScreenWrapper from './components/HomeScreenWrapper';
import BalanceToggle from './components/BalanceToggle';
import RampModal from '../WalletDetails/components/RampModal';

function VaultScreen() {
  const { activeVault } = useVault();
  const signers = idx(activeVault, (_) => _.signers) || [];
  const unconfirmedBalance = idx(activeVault, (_) => _.specs.balances.unconfirmed) || 0;
  const confirmedBalance = idx(activeVault, (_) => _.specs.balances.confirmed) || 0;
  const scheme = idx(activeVault, (_) => _.scheme) || { m: 0, n: 0 };
  const [hideAmounts, setHideAmounts] = useState(true);
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);

  const navigation = useNavigation();

  const navigateToHardwareSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'AddSigningDevice', params: {} }));
  };

  const onVaultPress = () => {
    if (signers.length) {
      navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
    } else {
      navigateToHardwareSetup();
    }
  };

  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  return (
    <HomeScreenWrapper>
      <BalanceToggle hideAmounts={hideAmounts} setHideAmounts={setHideAmounts} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.titleWrapper}>
          <Text style={styles.titleText} color="light.primaryText">
            Your Vault
          </Text>
          <Text style={styles.subTitleText} color="light.secondaryText">
            Beach and sunshine baby!
          </Text>
        </Box>
        <Box style={styles.vaultDetailsWrapper} backgroundColor="light.learnMoreBorder">
          <TouchableOpacity testID="btn_vault" onPress={onVaultPress} activeOpacity={0.7}>
            <Box style={styles.signingDeviceWrapper}>
              <Box style={styles.signingDeviceDetails}>
                <Text style={styles.signingDeviceText} color="light.white">
                  {`${scheme.m} of ${scheme.n} Vault`}
                </Text>
                <Box style={styles.signingDeviceList}>
                  {signers.map((signer: any) => (
                    <Box backgroundColor="rgba(245, 241, 234, .2)" style={styles.vaultSigner}>
                      {SDIcons(signer.type, true).Icon}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box style={styles.unConfirmBalanceView}>
                <Text style={styles.unconfirmText} color="light.white">
                  Unconfirmed
                </Text>
                <CurrencyInfo
                  hideAmounts={hideAmounts}
                  amount={confirmedBalance + unconfirmedBalance}
                  fontSize={14}
                  color={Colors.White}
                  variation="grey"
                />
              </Box>
            </Box>
            <Box style={styles.availableBalanceWrapper}>
              <Text style={styles.availableText} color="light.white">
                Available Balance
              </Text>
              <CurrencyInfo
                hideAmounts={hideAmounts}
                amount={confirmedBalance + unconfirmedBalance}
                fontSize={20}
                color={Colors.White}
                variation="grey"
              />
            </Box>
          </TouchableOpacity>
        </Box>
        <Pressable
          onPress={() => {
            navigation.dispatch(CommonActions.navigate({ name: 'SetupInheritance' }));
          }}
        >
          <ListItemView
            icon={<InheritanceIcon />}
            title="Inheritance"
            subTitle="Setup inheritance Key"
            iconBackColor="light.learnMoreBorder"
          />
        </Pressable>
        <ListItemView
          icon={<BitcoinIcon />}
          title="Buy"
          subTitle="Stack sats directly in the vault"
          iconBackColor="light.learnMoreBorder"
          onPress={onPressBuyBitcoin}
        />
      </ScrollView>

      {activeVault && (
        <RampModal
          showBuyRampModal={showBuyRampModal}
          setShowBuyRampModal={setShowBuyRampModal}
          receivingAddress={activeVault.specs.receivingAddress}
          balance={activeVault.specs.balances.confirmed}
          name="Vault"
        />
      )}
    </HomeScreenWrapper>
  );
}

export default VaultScreen;

const styles = StyleSheet.create({
  titleWrapper: {
    marginVertical: hp(5),
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
  },
  vaultDetailsWrapper: {
    padding: 15,
    borderRadius: 10,
    marginVertical: hp(20),
  },
  signingDeviceWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  signingDeviceDetails: {
    width: '70%',
  },
  signingDeviceList: {
    flexDirection: 'row',
    marginVertical: hp(5),
  },
  unConfirmBalanceView: {
    width: '30%',
    alignItems: 'flex-end',
  },
  signingDeviceText: {
    fontSize: 11,
  },
  unconfirmText: {
    fontSize: 11,
  },
  balanceText: {
    fontSize: 14,
  },
  availableBalanceWrapper: {
    marginTop: hp(30),
  },
  availableText: {
    fontSize: 11,
  },
  availablebalanceText: {
    fontSize: 20,
  },
  vaultSigner: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    width: 30,
    height: 30,
    borderRadius: 30,
  },
});
