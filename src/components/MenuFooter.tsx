import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import WalletIcon from 'src/assets/images/Wallet-grey.svg';
import KeyIcon from 'src/assets/images/key-grey.svg';
import ConciergeIcon from 'src/assets/images/faq-grey.svg';
import MoreIcon from 'src/assets/images/more-grey.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from './ThemedSvg.tsx/ThemedSvg';
import { screenWidth } from 'react-native-gifted-charts/src/utils';
import Colors from 'src/theme/Colors';

const MenuFooter = ({ selectedOption, onOptionChange }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  const menuOptions = [
    {
      name: walletTranslation.title,
      defaultIcon: <WalletIcon />,
      selectedIcon: <ThemedSvg name={'footer_Wallet'} />,
    },
    {
      name: walletTranslation.keys,
      defaultIcon: <KeyIcon />,
      selectedIcon: <ThemedSvg name={'footer_Key'} />,
    },
    {
      name: walletTranslation.concierge,
      defaultIcon: <ConciergeIcon />,
      selectedIcon: <ThemedSvg name={'footer_concierge'} />,
    },
    {
      name: walletTranslation.more,
      defaultIcon: <MoreIcon />,
      selectedIcon: <ThemedSvg name={'footer_more'} />,
    },
  ].filter(Boolean);

  return (
    <Box
      style={[styles.container]}
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
            style={[
              styles.menuItem,
              selectedOption === option.name && { backgroundColor: Colors.primaryGreen },
            ]}
          >
            <Box style={styles.iconContainer}>
              {selectedOption === option.name ? option.selectedIcon : option.defaultIcon}
            </Box>
          </TouchableOpacity>
        ))}
      </Box>
    </Box>
  );
};

export default MenuFooter;

const styles = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: screenWidth * 0.6,
    paddingVertical: hp(9),
    marginBottom: Platform.select({ ios: hp(35), android: hp(10) }),
    borderWidth: 1,
  },
  menuWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: wp(11),
    paddingHorizontal: wp(27),
    borderRadius: 100,
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
