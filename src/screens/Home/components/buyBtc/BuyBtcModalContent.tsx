import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import { EntityKind } from 'src/services/wallets/enums';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';

const BuyBtcModalContent = ({ allWallets, setSelectedWallet, selectedWallet }) => {
  const { colorMode } = useColorMode();
  const DashedCtaBorderColor = ThemedColor({ name: 'DashedCtaBorderColor' });

  const getWalletIcon = (entityKind) =>
    entityKind === EntityKind.VAULT ? <VaultIcon /> : <WalletIcon />;

  return (
    <Box>
      {allWallets.map((option) => {
        const isSelected =
          selectedWallet?.specs?.receivingAddress === option?.specs?.receivingAddress;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => {
              setSelectedWallet(option);
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
                icon={getWalletIcon(option.entityKind)}
                backgroundColor={`${colorMode}.pantoneGreen`}
              />
              <Text medium>{option.presentationData.name}</Text>
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
