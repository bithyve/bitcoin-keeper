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
import PrivateWallet from 'src/assets/privateImages/wallet-gold.svg';
import PrivateKey from 'src/assets/privateImages/key-gold-icon.svg';
import PrivateConcierge from 'src/assets/privateImages/gold-concierge-icon.svg';
import PrivateMore from 'src/assets/privateImages/more-gold-icon.svg';
import { useSelector } from 'react-redux';
import ContactGreyIcon from 'src/assets/images/contact-grey-icon.svg';
import ContactGreenIcon from 'src/assets/images/contact-green-icon.svg';

const MenuFooter = ({ selectedOption, onOptionChange }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';

  const menuOptions = [
    {
      name: wallet.homeWallets,
      defaultIcon: <WalletIcon />,
      selectedIcon: privateTheme ? (
        <PrivateWallet />
      ) : isDarkMode ? (
        <WalletWhite />
      ) : (
        <WalletGreen />
      ),
    },
    {
      name: wallet.keys,
      defaultIcon: <KeyIcon />,
      selectedIcon: privateTheme ? <PrivateKey /> : isDarkMode ? <KeyWhite /> : <KeyGreen />,
    },
    {
      name: wallet.concierge,
      defaultIcon: <ConciergeIcon />,
      selectedIcon: privateTheme ? (
        <PrivateConcierge />
      ) : isDarkMode ? (
        <ConceirgeWhite />
      ) : (
        <ConciergeGreen />
      ),
    },
    {
      name: wallet.contact,
      defaultIcon: <ContactGreyIcon />,
      selectedIcon: privateTheme ? (
        <ContactGreenIcon />
      ) : isDarkMode ? (
        <ContactGreenIcon />
      ) : (
        <ContactGreenIcon />
      ),
    },
    {
      name: wallet.more,
      defaultIcon: <MoreIcon />,
      selectedIcon: privateTheme ? <PrivateMore /> : isDarkMode ? <MoreWhite /> : <MoreGreen />,
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
                  ? privateTheme
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
