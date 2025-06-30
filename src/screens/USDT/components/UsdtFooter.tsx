import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SendIconWhite from 'src/assets/images/send-diagonal-arrow-up.svg';
import RecieveIconWhite from 'src/assets/images/send-diagonal-arrow-down.svg';
import BuyIcon from 'src/assets/images/buy-logo.svg';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';

const UsdtFooter = ({ usdtWallet }: { usdtWallet: USDTWallet }) => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { colorMode } = useColorMode();

  // If usdtWallet is not provided, we can handle it gracefully
  if (!usdtWallet) {
    return null; // or return a placeholder component
  }
  const footerItems = [
    {
      Icon: SendIconWhite,
      text: common.send,
      onPress: () => navigation.dispatch(CommonActions.navigate('sendUsdt', { usdtWallet })),
    },
    {
      Icon: RecieveIconWhite,
      text: common.receive,
      onPress: () => navigation.dispatch(CommonActions.navigate('usdtReceive', { usdtWallet })),
    },
    {
      Icon: BuyIcon,
      text: common.Buy,
      onPress: () => navigation.dispatch(CommonActions.navigate('buyUstd', { usdtWallet })),
    },
  ];
  return (
    <Box
      style={styles.container}
      borderColor={`${colorMode}.separator`}
      backgroundColor={`${colorMode}.pantoneGreen`}
    >
      {footerItems.map((item, index) => {
        return (
          <TouchableOpacity onPress={item.onPress}>
            <Box style={styles.innerContainer} key={index}>
              <item.Icon width={24} height={24} />
              <Text fontSize={12} semiBold color={Colors.primaryCream}>
                {item.text}
              </Text>
            </Box>
          </TouchableOpacity>
        );
      })}
    </Box>
  );
};

export default UsdtFooter;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(15),
    paddingHorizontal: wp(30),
    borderRadius: 70,
    gap: wp(50),
    width: wp(300),
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
});
