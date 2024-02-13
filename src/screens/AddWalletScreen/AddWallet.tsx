import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import AdvancedGreenIcon from 'src/assets/images/advanced_green.svg';
import AdvancedIcon from 'src/assets/images/advanced.svg';
import ImportGreenIcon from 'src/assets/images/import_green.svg';
import ImportIcon from 'src/assets/images/import.svg';
import WalletCard from 'src/components/WalletCard';
import { StyleSheet } from 'react-native';
import Wallets from './Wallets';
import AdvancedWallets from './AdvancedWallets';
import ImportWallets from './ImportWallets';

function AddWallet({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  const [selectedCard, selectCard] = useState(1);

  const onCardSelect = (id: number) => {
    selectCard(id);
  };

  //TODO: add learn more modal
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.Champagne`}>
      <KeeperHeader
        title={wallet.AddWallet}
        subtitle={wallet.chooseFromTemplate}
        //To-Do-Learn-More
      />
      <Box style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletType}
        >
          <WalletCard
            id={1}
            walletName="Create New"
            walletDescription="Singlesig / Multisig"
            icon={<WalletActiveIcon />}
            selectedIcon={<WalletGreenIcon />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
            arrowStyles={{ alignSelf: 'flex-end', marginRight: 10 }}
          />
          <WalletCard
            id={2}
            walletName="Import"
            walletDescription="Recover / Recreate"
            icon={<ImportIcon />}
            selectedIcon={<ImportGreenIcon />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
            arrowStyles={{ alignSelf: 'center' }}
          />
          <WalletCard
            id={3}
            walletName="Advanced"
            walletDescription="For seasoned plebs"
            icon={<AdvancedIcon />}
            selectedIcon={<AdvancedGreenIcon />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
            arrowStyles={{ marginLeft: 10 }}
          />
        </ScrollView>
        {selectedCard === 1 && <Wallets navigation={navigation} />}
        {selectedCard === 2 && <ImportWallets navigation={navigation} />}
        {selectedCard === 3 && <AdvancedWallets navigation={navigation} />}
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  note: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    alignSelf: 'center',
  },
});

export default AddWallet;
