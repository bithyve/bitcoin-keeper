import React, { useContext, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import idx from 'idx';
import InheritanceIcon from 'src/assets/images/inheritanceWhite.svg';
import InheritanceDarkIcon from 'src/assets/images/icon_inheritance_dark.svg';
import EmptyVaultIllustration from 'src/assets/images/EmptyVaultIllustration.svg';
import { hp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import useVault from 'src/hooks/useVault';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ListItemView from './components/ListItemView';
import CurrencyInfo from './components/CurrencyInfo';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import HomeScreenWrapper from './components/HomeScreenWrapper';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';
import { AppSigners } from '../Home/components/AppSigners';

function VaultScreen() {
  const { activeVault } = useVault();
  const { colorMode } = useColorMode();
  const { vaultSigners, signers } = useSigners(activeVault ? activeVault.id : '');
  const unconfirmedBalance = idx(activeVault, (_) => _.specs.balances.unconfirmed) || 0;
  const confirmedBalance = idx(activeVault, (_) => _.specs.balances.confirmed) || 0;
  const scheme = idx(activeVault, (_) => _.scheme) || { m: 0, n: 0 };
  const [hideAmounts, setHideAmounts] = useState(true);

  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { vault } = translations;

  const navigateToHardwareSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup' }));
  };

  const onVaultPress = () => {
    if (vaultSigners.length) {
      navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
    } else {
      navigateToHardwareSetup();
    }
  };

  return (
    <HomeScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.titleWrapper}>
          <Text style={styles.titleText} color={`${colorMode}.primaryText`} testID="text_YourVault">
            {vault.yourVault}
          </Text>
        </Box>
        <TouchableOpacity testID="btn_vault" onPress={onVaultPress} activeOpacity={0.7}>
          <Box
            style={[
              styles.vaultDetailsWrapper,
              { alignItems: !activeVault ? 'center' : 'flex-start' },
            ]}
            backgroundColor={`${colorMode}.learnMoreBorder`}
          >
            {!activeVault ? (
              <Box>
                <Box style={styles.emptyVaultIllustration}>
                  <EmptyVaultIllustration />
                </Box>
                <Text color={`${colorMode}.white`}>{vault.toActiveVault}</Text>
              </Box>
            ) : (
              <>
                <Box style={styles.signingDeviceWrapper}>
                  <Box style={styles.signingDeviceDetails}>
                    <Text style={styles.signingDeviceText} color={`${colorMode}.white`}>
                      {`${scheme.m} of ${scheme.n} Vault`}
                    </Text>
                    <Box style={styles.signingDeviceList}>
                      {vaultSigners.map((signer) => (
                        <Box
                          backgroundColor="rgba(245, 241, 234, .2)"
                          style={styles.vaultSigner}
                          key={signer.masterFingerprint}
                        >
                          {SDIcons(signer.type, colorMode !== 'dark').Icon}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box style={styles.availableBalanceWrapper}>
                  <TouchableOpacity
                    onPress={() => setHideAmounts(!hideAmounts)}
                    testID="btn_vaultBalance"
                  >
                    <CurrencyInfo
                      hideAmounts={hideAmounts}
                      amount={confirmedBalance + unconfirmedBalance}
                      fontSize={20}
                      color={colorMode === 'light' ? 'white' : 'black'}
                      variation={colorMode === 'light' ? 'light' : 'dark'}
                    />
                  </TouchableOpacity>
                </Box>
              </>
            )}
          </Box>
        </TouchableOpacity>
        <AppSigners keys={signers} navigation={navigation} />
        <ListItemView
          icon={colorMode === 'light' ? <InheritanceIcon /> : <InheritanceDarkIcon />}
          title={vault.inheritanceTools}
          subTitle={vault.manageInheritance}
          iconBackColor={`${colorMode}.learnMoreBorder`}
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
    marginVertical: hp(20),
  },
  titleText: {
    fontSize: 16,
    fontFamily: Fonts.FiraSansCondensedMedium,
    letterSpacing: 1.28,
  },
  subTitleText: {
    fontSize: 12,
  },
  vaultDetailsWrapper: {
    paddingHorizontal: 15,
    borderRadius: 10,
    height: hp(210),
    justifyContent: 'center',
    marginBottom: hp(20),
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
