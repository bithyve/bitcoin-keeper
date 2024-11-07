import React, { useContext } from 'react';
import { Badge, Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

type Props = {
  used: boolean;
};

function AddressUsageBadge({ used }: Props) {
  const { colorMode } = useColorMode();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    // TODO: Export colors to theme file
    <Badge
      bgColor={used ? `${colorMode}.alertRed` : `${colorMode}.newBadgeGreen`}
      rounded="full"
      style={styles.addressTypeBadge}
    >
      <Box flexDirection="row">
        <Text
          color={used ? `${colorMode}.textWhite` : `${colorMode}.textGreen`}
          style={styles.addressTypePoint}
        >
          .
        </Text>
        <Text
          color={used ? `${colorMode}.textWhite` : `${colorMode}.textGreen`}
          style={styles.addressTypeText}
        >
          {used ? walletTranslation.UsedAddress : walletTranslation.NewAddress}
        </Text>
      </Box>
    </Badge>
  );
}

const styles = StyleSheet.create({
  addressTypeBadge: {
    width: wp(110),
    height: hp(25),
    marginLeft: wp(14),
    marginBottom: hp(5),
  },
  addressTypePoint: {
    fontSize: 50,
    height: '100%',
    textAlign: 'center',
    marginTop: hp(11),
    marginRight: wp(1),
  },
  addressTypeText: {
    fontSize: 11,
    height: '100%',
    textAlign: 'center',
    marginTop: hp(5.5),
    minWidth: wp(75),
  },
});

export default AddressUsageBadge;
