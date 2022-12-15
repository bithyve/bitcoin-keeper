import React from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { ScaledSheet } from 'react-native-size-matters';

// components
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import EditIcon from 'src/assets/images/svgs/edit.svg';
import BTCIcon from 'src/assets/images/svgs/btc_black.svg';
import IconWallet from 'src/assets/images/svgs/icon_wallet.svg';

function WalletDetails({ availableAmt, walletName, isEditable = false }) {
  return (
    <Box
      style={styles.container}
      backgroundColor="light.lightYellow"
    >
      <Box flexDirection="row">
        <TouchableOpacity style={styles.buttonBackground}>
          <IconWallet />
        </TouchableOpacity>
        <Box style={{
          marginLeft: wp(10)
        }}>
          <Text
            color="light.sendCardHeading"
            numberOfLines={1}
            style={styles.walletNameText}
          >
            {walletName && walletName}
          </Text>
          <Text fontSize={12} numberOfLines={1}>
            Available to spend &nbsp;
            <BTCIcon />
            &nbsp;
            <Text fontWeight="bold" fontSize={14}>
              {availableAmt && availableAmt} sats
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
    </Box >
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
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "97%",
    height: hp(70),
    borderRadius: 10
  },
  walletNameText: {
    marginTop: 3,
    fontSize: 14,
    letterSpacing: 1.12,
    width: wp(100)
  }
});
export default WalletDetails;
