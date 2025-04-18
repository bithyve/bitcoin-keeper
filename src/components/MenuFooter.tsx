import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import WalletWhite from 'src/assets/images/walletWhiteIcon.svg';
import KeyWhite from 'src/assets/images/KeyWhiteIcon.svg';
import ConceirgeWhite from 'src/assets/images/faqWhiteIcon.svg';
import MoreWhite from 'src/assets/images/moreWhiteIcon.svg';
import WalletIcon from 'src/assets/images/Wallet-grey.svg';
import KeyIcon from 'src/assets/images/key-grey.svg';
import ConciergeIcon from 'src/assets/images/faq-grey.svg';
import MoreIcon from 'src/assets/images/more-grey.svg';
import WalletGreen from 'src/assets/images/wallet_green.svg';
import KeyGreen from 'src/assets/images/key-green.svg';
import ConciergeGreen from 'src/assets/images/faq-green.svg';
import MoreGreen from 'src/assets/images/more-green.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from './KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Colors from 'src/theme/Colors';
import usePlan from 'src/hooks/usePlan';
import PrivateWallet from 'src/assets/images/private-wallet-gold.svg';
import PrivateKey from 'src/assets/images/private-key-gold.svg';
import PrivateConcierge from 'src/assets/images/private-gold-concierge.svg';
import PrivateMore from 'src/assets/images/private-more-gold.svg';

const MenuFooter = ({ selectedOption, onOptionChange }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const { isOnL4 } = usePlan();

  const menuOptions = [
    {
      name: wallet.homeWallets,
      defaultIcon: <WalletIcon />,
      selectedIcon: isOnL4 ? <PrivateWallet /> : isDarkMode ? <WalletWhite /> : <WalletGreen />,
    },
    {
      name: wallet.keys,
      defaultIcon: <KeyIcon />,
      selectedIcon: isOnL4 ? <PrivateKey /> : isDarkMode ? <KeyWhite /> : <KeyGreen />,
    },
    {
      name: wallet.concierge,
      defaultIcon: <ConciergeIcon />,
      selectedIcon: isOnL4 ? (
        <PrivateConcierge />
      ) : isDarkMode ? (
        <ConceirgeWhite />
      ) : (
        <ConciergeGreen />
      ),
    },
    {
      name: wallet.more,
      defaultIcon: <MoreIcon />,
      selectedIcon: isOnL4 ? <PrivateMore /> : isDarkMode ? <MoreWhite /> : <MoreGreen />,
    },
  ];

  return (
    <Box
      style={styles.container}
      backgroundColor={
        isDarkMode ? `${colorMode}.primaryGreenBackground` : `${colorMode}.ChampagneBliss`
      }
      borderColor={`${colorMode}.MistSlate`}
    >
      <Box style={styles.menuWrapper}>
        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.name}
            onPress={() => onOptionChange(option.name)}
            style={[styles.menuItem]}
          >
            <Box style={styles.iconContainer}>
              {selectedOption === option.name ? option.selectedIcon : option.defaultIcon}
            </Box>
            <Text
              style={[styles.menuText]}
              color={
                selectedOption === option.name
                  ? isOnL4
                    ? `${colorMode}.pantoneGreen`
                    : isDarkMode
                    ? Colors.headerWhite
                    : `${colorMode}.pantoneGreen`
                  : `${colorMode}.placeHolderTextColor`
              }
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </Box>
    </Box>
  );
};

export default MenuFooter;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: hp(85),
    borderRadius: 20,
    paddingHorizontal: wp(10),
    paddingTop: hp(10),
    paddingBottom: hp(26),
    borderWidth: 1,
  },
  menuWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: hp(5),
    paddingHorizontal: wp(10),
    borderRadius: 10,
  },
  iconContainer: {
    width: wp(20),
    height: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    marginTop: 5,
    fontSize: 11,
    textAlign: 'center',
  },
});
