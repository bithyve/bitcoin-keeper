import { Box, ScrollView, useColorMode } from 'native-base';
import { useContext, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletType from './WalletType';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';

import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import WatchOnlyWalletIcon from 'src/assets/images/watch_only_wallet.svg';
import ImportWalletIcon from 'src/assets/images/import_wallet.svg';
import Shield from 'src/assets/images/shield.svg';
import WhiteShield from 'src/assets/images/shield_white.svg';
import CollaborativeVault from 'src/assets/images/collaborative_vault.svg';
import LockGreen from 'src/assets/images/lock_green.svg';
import Lock from 'src/assets/images/lock.svg';

const dummyData = [
  {
    heading: 'Single Sig',
    data: [
      {
        walletName: 'Hot Wallet',
        walletDescription: "App's mobile key",
        icon: <WalletGreenIcon />,
        selectedIcon: <WalletActiveIcon />,
      },
      {
        walletName: 'Watch Only',
        walletDescription: 'Use external xPub',
        icon: <WatchOnlyWalletIcon />,
        selectedIcon: <WalletActiveIcon />,
      },
      {
        walletName: 'Import',
        walletDescription: 'Import External wallet',
        icon: <ImportWalletIcon />,
        selectedIcon: <WalletActiveIcon />,
      },
    ],
  },
  {
    heading: 'Multi Sig',
    data: [
      {
        walletName: '2 of 3 Vault',
        walletDescription: 'Occasional use wallet',
        icon: <Shield />,
        selectedIcon: <WhiteShield />,
      },
      {
        walletName: '3 of 5 Vault',
        walletDescription: 'Deep cold storage',
        icon: <Shield />,
        selectedIcon: <WhiteShield />,
      },
      {
        walletName: 'Collaborative',
        walletDescription: 'With contacts/ devices',
        icon: <CollaborativeVault />,
        selectedIcon: <WalletActiveIcon />,
      },
    ],
  },
  {
    heading: 'Advanced',
    data: [
      {
        walletName: 'Time-lock',
        walletDescription: 'For 3, 6 or 12 mo',
        icon: <LockGreen />,
        selectedIcon: <Lock />,
      },
      {
        walletName: 'Degrading MultiSig',
        walletDescription: 'Time based sig',
        icon: <WalletGreenIcon />,
        selectedIcon: <WalletActiveIcon />,
      },
      {
        walletName: 'Custom Multi Sig',
        walletDescription: 'Build your own',
        icon: <WalletGreenIcon />,
        selectedIcon: <WalletActiveIcon />,
      },
    ],
  },
];

function AddWallet({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  const [selectedCard, selectCard] = useState('');

  const onCardSelect = (name: string) => {
    if (name === selectedCard) selectCard('');
    else selectCard(name);
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.Champagne`}>
      <KeeperHeader title={wallet.AddWallet} subtitle={wallet.chooseFromTemplate} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {dummyData.map((data) => (
          <WalletType walletData={data} selectedCard={selectedCard} onCardSelect={onCardSelect} />
        ))}
        <Box style={{ alignSelf: 'flex-end', marginRight: 20 }}>
          <CustomGreenButton value={common.proceed} />
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default AddWallet;
