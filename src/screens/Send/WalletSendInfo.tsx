import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import EditIcon from 'src/assets/images/edit.svg';
import BTCIcon from 'src/assets/images/btc_black.svg';
import BTCWhite from 'src/assets/images/btc_white.svg';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import Colors from 'src/theme/Colors';
import HexagonIcon from 'src/components/HexagonIcon';
import { SatsToBtc } from 'src/constants/Bitcoin';

function WalletSendInfo({
  availableAmt,
  walletName = '',
  isEditable = false,
  isSats = false,
  currencyIcon = BTCIcon,
  selectedUTXOs = [],
  isAddress = false,
  recipient = null,
  icon,
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <Box testID="view_wallet_info" style={styles.container}>
      <Box style={styles.wrapper}>
        <Box w="15%">
          <TouchableOpacity>
            <HexagonIcon width={44} height={38} backgroundColor={Colors.RussetBrown} icon={icon} />
          </TouchableOpacity>
        </Box>
        <Box style={styles.walletSendInfoWrapper}>
          <Text color={`${colorMode}.primaryText`} numberOfLines={1} style={styles.walletNameText}>
            Sending to {isAddress ? 'address' : recipient.entityKind.toLowerCase()}
          </Text>
          {selectedUTXOs.length ? (
            <Text fontSize={12} numberOfLines={1} color={`${colorMode}.primaryText`}>
              {walletTranslation.sendingFromUtxo} &nbsp;
              {colorMode === 'light' ? <BTCIcon /> : <BTCWhite />}
              &nbsp;
              <Text bold fontSize={14}>
                {SatsToBtc(selectedUTXOs.reduce((a, c) => a + c.value, 0))} {isSats && 'sats'}
              </Text>
            </Text>
          ) : (
            <Box>
              <Text fontSize={14} numberOfLines={1} ellipsizeMode={isAddress ? 'middle' : 'tail'}>
                {walletName}
              </Text>
            </Box>
          )}
        </Box>
        <Box w="25%">
          {/* <Pressable
            onPress={() => console.log('pressed')}
            backgroundColor={`${colorMode}.accent`}
            borderColor={`${colorMode}.learnMoreBorder`}
            style={styles.advanceWrapper}
          >
            <Text testID="text_advance" color={`${colorMode}.sendMax`} style={styles.advanceText}>
              {walletTranslation.advanced}
            </Text>
          </Pressable> */}
        </Box>
      </Box>
      {isEditable && (
        <TouchableOpacity
          style={{
            marginRight: wp(5),
          }}
          testID={`btn_edit_wallet_send_info`}
        >
          {/* { Do not have right assert in xd} */}
          <EditIcon />
        </TouchableOpacity>
      )}
    </Box>
  );
}
const styles = StyleSheet.create({
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: hp(50),
    height: hp(50),
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(10),
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    borderRadius: 10,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 8,
    width: '100%',
  },
  walletNameText: {
    marginTop: 3,
    fontSize: 12,
    letterSpacing: 1.12,
    width: wp(120),
    fontWeight: 500,
    marginBottom: -4,
  },
  advanceWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 3,
    borderWidth: 1,
  },
  advanceText: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  walletSendInfoWrapper: {
    marginLeft: wp(5),
    width: '55%',
  },
});
export default WalletSendInfo;
