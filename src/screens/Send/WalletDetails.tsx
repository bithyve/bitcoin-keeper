import React from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { ScaledSheet } from 'react-native-size-matters';

// components
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import EditIcon from 'src/assets/images/edit.svg';
import BTCIcon from 'src/assets/images/btc_black.svg';
import IconWallet from 'src/assets/images/icon_wallet.svg';

function WalletDetails({ availableAmt = '', walletName = '', isEditable = false, isSats = false, currencyIcon = BTCIcon }) {
  return (
    <Box style={styles.container} backgroundColor="light.primaryBackground">
      <Box flexDirection="row">
        <TouchableOpacity style={styles.buttonBackground}>
          <IconWallet />
        </TouchableOpacity>
        <Box
          style={{
            marginLeft: wp(10),
          }}
        >
          <Text color="light.sendCardHeading" numberOfLines={1} style={styles.walletNameText}>
            {walletName}
          </Text>
          <Text fontSize={12} numberOfLines={1}>
            Available to spend &nbsp;
            {currencyIcon}
            &nbsp;
            <Text bold fontSize={14}>
              {availableAmt} {isSats && 'sats'}
            </Text>
          </Text>
        </Box>
      </Box>
      {isEditable && (
        <TouchableOpacity
          style={{
            marginRight: wp(5),
          }}
        >
          {/* { Do not have right assert in xd} */}
          <EditIcon />
        </TouchableOpacity>
      )}
    </Box>
  );
}
const styles = ScaledSheet.create({
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: hp(45),
    height: hp(45),
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(10),
  },
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '97%',
    height: hp(70),
    borderRadius: 10,
  },
  walletNameText: {
    marginTop: 3,
    fontSize: 14,
    letterSpacing: 1.12,
    width: wp(100),
  },
});
export default WalletDetails;
