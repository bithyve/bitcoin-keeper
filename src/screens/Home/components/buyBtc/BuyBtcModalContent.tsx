import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import WalletWhite from 'src/assets/images/walletWhiteIcon.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

const BuyBtcModalContent = ({ setSelectedWallet, selectedWallet }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { buyBTC: buyBTCText } = translations;
  const DashedCtaBorderColor = ThemedColor({ name: 'DashedCtaBorderColor' });

  const buyBtcOptions = [
    {
      id: 1,
      label: buyBTCText.inheritanceWallet,
      walleticon: <WalletWhite width={wp(18)} height={wp(16)} />,
      address: '3FZbgi29cpjq2GjdwV8eyHuJ3FZbgi29cxheyxpjq2GjdwV8eyHuJ',
    },
    {
      id: 2,
      label: buyBTCText.familyWallet,
      walleticon: <WalletWhite width={wp(18)} height={wp(16)} />,
      address: '3FZbgi29cpjq2GjdwV8eyHuJ3FZbgi29cpjqxvxvxvxvvx2GjdwV8eyHuJ',
    },
    {
      id: 3,
      label: buyBTCText.dailyUseWallet,
      walleticon: <WalletWhite width={wp(18)} height={wp(16)} />,
      address: '3FZbgi29cpjq2GjdwV8eyHuJ3FZbgi29cpjq2hshshshhsjdwV8eyHuJ',
    },
  ];

  return (
    <Box>
      {buyBtcOptions.map((option) => {
        const isSelected = selectedWallet === option.address;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => {
              setSelectedWallet(option.address);
            }}
          >
            <Box
              style={styles.container}
              backgroundColor={`${colorMode}.textInputBackground`}
              borderColor={isSelected ? DashedCtaBorderColor : `${colorMode}.separator`}
              borderWidth={2}
            >
              <CircleIconWrapper
                width={40}
                icon={option.walleticon}
                backgroundColor={`${colorMode}.pantoneGreen`}
              />
              <Text medium>{option.label}</Text>
            </Box>
          </TouchableOpacity>
        );
      })}
    </Box>
  );
};

export default BuyBtcModalContent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    borderRadius: 10,
    marginBottom: hp(10),
  },
});
