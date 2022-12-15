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
      justifyContent="space-between"
      alignItems="center"
      style={{ marginRight: wp(10) }}
      flexDirection="row"
      backgroundColor="light.lightYellow"
      width="97%"
      height={hp(54)}
      borderRadius={10}
    >
      <Box flexDirection="row">
        <TouchableOpacity style={styles.buttonBackground}>
          <IconWallet />
        </TouchableOpacity>
        <Box marginLeft={wp(10)}>
          <Text
            fontFamily="body"
            fontWeight="200"
            fontSize={14}
            mt="1"
            numberOfLines={1}
            letterSpacing={1.12}
            color="light.sendCardHeading"
            width={wp(100)}
          >
            {walletName && walletName}
          </Text>
          <Text fontFamily="body" fontSize={12} numberOfLines={1}>
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
    </Box>
  );
}
const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },

  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(10),
  },
});
export default WalletDetails;
