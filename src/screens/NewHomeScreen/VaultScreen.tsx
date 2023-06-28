import React, { useState } from 'react';
import { Box, ScrollView } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import InheritanceIcon from 'src/assets/images/inheritanceWhite.svg';
import EmptyVaultIllustration from 'src/assets/images/EmptyVaultIllustration.svg';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
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

function VaultScreen() {
  const { activeVault } = useVault();
  const signers = idx(activeVault, (_) => _.signers) || [];
  const unconfirmedBalance = idx(activeVault, (_) => _.specs.balances.unconfirmed) || 0;
  const confirmedBalance = idx(activeVault, (_) => _.specs.balances.confirmed) || 0;
  const scheme = idx(activeVault, (_) => _.scheme) || { m: 0, n: 0 };
  const [hideAmounts, setHideAmounts] = useState(true);

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

  return (
    <HomeScreenWrapper>
      {/* <BalanceToggle hideAmounts={hideAmounts} setHideAmounts={setHideAmounts} /> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.titleWrapper}>
          <Text style={styles.titleText} color="light.primaryText" testID='text_YourVault'>
            Your Vault
          </Text>
          {/* <Text style={styles.subTitleText} color="light.secondaryText">
            Keys on Signing Devices
          </Text> */}
        </Box>
        <TouchableOpacity testID="btn_vault" onPress={onVaultPress} activeOpacity={0.7}>
          <Box
            style={!activeVault ? styles.emptyVaultSignerWrapper : styles.vaultDetailsWrapper}
            backgroundColor="light.learnMoreBorder"
          >
            {!activeVault ? (
              <Box>
                <Box style={styles.emptyVaultIllustration}>
                  <EmptyVaultIllustration />
                </Box>
                <Text color="light.white">Add Signers to activate your Vault</Text>
              </Box>
            ) : (
              <>
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
                </Box>
                <Box style={styles.availableBalanceWrapper}>
                  <TouchableOpacity onPress={() => setHideAmounts(!hideAmounts)} testID='btn_vaultBalance'>
                    <CurrencyInfo
                      hideAmounts={hideAmounts}
                      amount={confirmedBalance + unconfirmedBalance}
                      fontSize={20}
                      color={Colors.White}
                      variation="grey"
                    />
                  </TouchableOpacity>
                </Box>
              </>
            )}
          </Box>
        </TouchableOpacity>

        <ListItemView
          icon={<InheritanceIcon />}
          title="Inheritance"
          subTitle="Setup inheritance Key"
          iconBackColor="light.learnMoreBorder"
          onPress={() => {
            navigation.dispatch(CommonActions.navigate({ name: 'SetupInheritance' }));
          }}
        />
      </ScrollView>
    </HomeScreenWrapper>
  );
}

export default VaultScreen;

const styles = StyleSheet.create({
  titleWrapper: {
    marginVertical: windowHeight > 680 ? hp(5) : 0,
    marginTop: hp(20),
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
  },
  vaultDetailsWrapper: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: hp(20),
  },
  emptyVaultSignerWrapper: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: hp(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyVaultIllustration: {
    alignSelf: 'center',
    marginBottom: 10,
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
