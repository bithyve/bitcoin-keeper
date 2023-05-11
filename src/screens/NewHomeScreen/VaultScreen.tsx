import React from 'react';
import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HideIcon from 'src/assets/images/icon_hide.svg'
import ColcardIcon from 'src/assets/images/trezor.svg'
import InheritanceIcon from 'src/assets/images/inheritanceWhite.svg'
import BitcoinIcon from 'src/assets/images/icon_bitcoin_white.svg'
import { hp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import HeaderDetails from './components/HeaderDetails';
import ListItemView from './components/ListItemView';

function VaultScreen() {
  return (
    <Box style={{ flex: 1 }}>
      <HeaderDetails />
      <ScreenWrapper>
        <Box style={styles.hideBalanceWrapper}>
          <HideIcon />
          <Text style={styles.hideBalanceText}>&nbsp;&nbsp;HIDE BALANCES</Text>
        </Box>
        <Box style={styles.titleWrapper}>
          <Text style={styles.titleText} color='light.primaryText'>Your Vault</Text>
          <Text style={styles.subTitleText} color='light.secondaryText'>Beach and sunshine baby!</Text>
        </Box>
        <Box style={styles.vaultDetailsWrapper} backgroundColor='light.learnMoreBorder'>
          <Box style={styles.signingDeviceWrapper}>
            <Box style={styles.signingDeviceDetails}>
              <Text style={styles.signingDeviceText} color='light.white'>3 of 5 Vault</Text>
              <Box style={styles.signingDeviceList}>
                <ColcardIcon />
                <ColcardIcon />
                <ColcardIcon />
                <ColcardIcon />
              </Box>
            </Box>
            <Box style={styles.unConfirmBalanceView}>
              <Text style={styles.unconfirmText} color='light.white'>Unconfirmed</Text>
              <Text style={styles.balanceText} color='light.white'>₿ 0.00050</Text>
            </Box>
          </Box>
          <Box style={styles.availableBalanceWrapper}>
            <Text style={styles.availableText} color='light.white'>Available Balance</Text>
            <Text style={styles.availablebalanceText} color='light.white'>₿ 10.0006</Text>
          </Box>
        </Box>
        <ListItemView icon={<InheritanceIcon />} title='Inheritance' subTitle='Setup inheritance Key' />
        <ListItemView icon={<BitcoinIcon />} title='Buy' subTitle='Stack sats directly in the vault' />
      </ScreenWrapper>
    </Box>
  );
};

export default VaultScreen;

const styles = StyleSheet.create({
  hideBalanceWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(10)
  },
  hideBalanceText: {
    fontSize: 10,
    color: '#704E2E'
  },
  titleWrapper: {
    marginVertical: hp(5)
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500'
  },
  subTitleText: {
    fontSize: 12
  },
  vaultDetailsWrapper: {
    padding: 10,
    borderRadius: 10,
    marginVertical: hp(20)
  },
  signingDeviceWrapper: {
    flexDirection: 'row',
    width: '100%'
  },
  signingDeviceDetails: {
    width: '70%'
  },
  signingDeviceList: {
    flexDirection: 'row',
    marginVertical: hp(5)
  },
  unConfirmBalanceView: {
    width: '30%',
    alignItems: 'flex-end'
  },
  signingDeviceText: {
    fontSize: 11
  },
  unconfirmText: {
    fontSize: 11
  },
  balanceText: {
    fontSize: 14
  },
  availableBalanceWrapper: {
    marginTop: hp(30)
  },
  availableText: {
    fontSize: 11
  },
  availablebalanceText: {
    fontSize: 20
  }
});
