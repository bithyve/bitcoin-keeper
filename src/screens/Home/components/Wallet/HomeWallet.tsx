import { Box, useColorMode, View } from 'native-base';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import DashedCta from 'src/components/DashedCta';
import Plus from 'src/assets/images/add-plus-white.svg';
import WalletCard from './WalletCard';
import Colors from 'src/theme/Colors';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

import useWalletAsset from 'src/hooks/useWalletAsset';
import { VisibilityType } from 'src/services/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import { hp } from 'src/constants/responsive';

const HomeWallet = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const { wallets } = useWallets({ getAll: true });
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });

  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults].filter(
    (item) => item !== null
  );

  const renderWalletCard = ({ item }: { item: Wallet | Vault }) => {
    return (
      <WalletCard
        backgroundColor={getWalletCardGradient(item)}
        hexagonBackgroundColor={isDarkMode ? Colors.CyanGreen : Colors.CyanGreen}
        iconWidth={42}
        iconHeight={38}
        title={item.presentationData.name}
        tags={getWalletTags(item)}
        totalBalance={item.specs.balances.confirmed + item.specs.balances.unconfirmed}
        description={item.presentationData.description}
        wallet={item}
      />
    );
  };

  return (
    <Box style={styles.walletContainer}>
      <DashedCta
        backgroundColor={isDarkMode ? 'rgba(21, 27, 25, 1)' : `${colorMode}.DashedButtonCta`}
        hexagonBackgroundColor={isDarkMode ? Colors.pantoneGreen : Colors.pantoneGreen}
        textColor={isDarkMode ? Colors.White : `${colorMode}.pantoneGreen`}
        name="Add Wallet"
        callback={() => navigation.navigate('AddWallet')}
        icon={<Plus width={8.6} height={8.6} />}
        iconWidth={22}
        iconHeight={20}
      />
      <FlatList
        data={allWallets}
        renderItem={renderWalletCard}
        keyExtractor={(item, index) => `${item.id || index}`}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </Box>
  );
};

export default HomeWallet;

const styles = StyleSheet.create({
  walletContainer: {
    gap: 20,
    paddingVertical: hp(25),
  },
});
