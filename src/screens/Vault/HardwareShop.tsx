import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import UpgradeLight from 'src/assets/images/upgrade-circle-arrow-white.svg';

const HardwareShop = () => {
  const dispatch = useDispatch;
  const { colorMode } = useColorMode();

  const { translations } = useContext(LocalizationContext);

  const { vault, signer, common } = translations;
  const isDarkMode = colorMode === 'dark';

  return (
    <ScreenWrapper>
      <KeeperHeader title={signer.ShopHardwareWallets} subtitle={signer.BitcoinSecurityWallets} />
      <Box style={styles.container}>
        <Text style={styles.text} semiBold>
          Get special discounts by subscribing to Keeper{' '}
        </Text>
        <Buttons
          primaryText={common.Upgrade}
          fullWidth
          LeftIcon={UpgradeLight}
          paddingVertical={hp(15)}
          primaryBackgroundColor={`${colorMode}.brownColor`}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default HardwareShop;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(10),
    paddingHorizontal: wp(8),
  },
  text: {
    marginTop: hp(10),
    marginBottom: hp(10),
  },
});
