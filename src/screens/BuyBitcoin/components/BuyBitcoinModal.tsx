import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { Box } from 'native-base';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import HexagonIcon from 'src/components/HexagonIcon';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { EntityKind, VaultType } from 'src/core/wallets/enums';

type Props = {
  allWallets: (Wallet | Vault)[];
  selectedWallet: Wallet | Vault;
  setSelectedWallet: Dispatch<SetStateAction<Wallet | Vault>>;
  setWalletSelectionVisible: Dispatch<SetStateAction<boolean>>;
};

function BuyBitcoinWalletSelectionModal({
  allWallets,
  selectedWallet,
  setSelectedWallet,
  setWalletSelectionVisible,
}: Props) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(null);

  useEffect(() => {
    const selectedIndex = allWallets.findIndex((wallet) => wallet.id === selectedWallet.id);
    setSelectedWalletIndex(selectedIndex);
  }, []);

  const onCardSelect = (index: number) => {
    if (index === selectedWalletIndex) setSelectedWalletIndex(null);
    else setSelectedWalletIndex(index);
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  return (
    <Box style={styles.container}>
      <Box style={styles.cardContainer}>
        {allWallets.map((wallet, index) => {
          const name = wallet.presentationData.name || '';
          const balance = wallet.specs.balances.confirmed || 0;
          return (
            <SignerCard
              key={wallet.id}
              name={name}
              description={balance.toString()}
              icon={
                <HexagonIcon
                  width={40}
                  height={35}
                  backgroundColor={'rgba(45, 103, 89, 1)'}
                  icon={getWalletIcon(wallet)}
                />
              }
              isSelected={index === selectedWalletIndex}
              onCardSelect={() => onCardSelect(index)}
            />
          );
        })}
      </Box>
      <Buttons
        primaryDisable={selectedWalletIndex === null}
        primaryText={common.proceed}
        primaryCallback={() => {
          setSelectedWallet(allWallets[selectedWalletIndex]);
          setWalletSelectionVisible(false);
        }}
        secondaryText={common.cancel}
        secondaryCallback={() => setWalletSelectionVisible(false)}
      />
    </Box>
  );
}

export default BuyBitcoinWalletSelectionModal;

const styles = StyleSheet.create({
  container: {
    gap: 30,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
