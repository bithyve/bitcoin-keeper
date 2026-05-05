import React, { useContext } from 'react';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import DotGreen from 'src/assets/images/dot-green.svg';
import DotWhite from 'src/assets/images/dot-white.svg';
import DotCream from 'src/assets/images/dot-cream.svg';

type Props = {
  used: boolean;
};

function AddressUsageBadge({ used }: Props) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    // TODO: Export colors to theme file
    <Box
      bgColor={used ? `${colorMode}.alertRed` : `${colorMode}.newBadgeGreen`}
      rounded="full"
      style={styles.addressTypeBadge}
    >
      <Box style={styles.container}>
        {isDarkMode ? <DotWhite /> : used ? <DotCream /> : <DotGreen />}

        <Text
          color={used ? `${colorMode}.seashellWhiteText` : `${colorMode}.textGreen`}
          style={styles.addressTypeText}
        >
          {used ? walletTranslation.UsedAddress : walletTranslation.NewAddress}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  addressTypeBadge: {
    width: wp(110),
    height: hp(25),
    marginLeft: wp(14),
    marginBottom: hp(5),
    justifyContent: 'center',
    paddingHorizontal: wp(10),
  },
  addressTypeText: {
    fontSize: 11,
    textAlign: 'center',
    minWidth: wp(75),
    lineHeight: 11,
  },
  container: {
    width: '100%',
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddressUsageBadge;
