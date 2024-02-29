import React from 'react';
import { Box } from 'native-base';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import HexagonIcon from 'src/components/HexagonIcon';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import { StyleSheet } from 'react-native';

type Props = {
  wallets: Wallet[];
};

function BuyBitcoinWalletSelectionModal({ wallets }: Props) {
  console.log('checking the wallets', wallets);
  return (
    <Box style={styles.container}>
      {wallets.map((wallet) => {
        const name = wallet.presentationData.name || '';
        const balance = wallet.specs.balances.confirmed || 0;
        return (
          <SignerCard
            // key={signer.masterFingerprint}
            name={name}
            description={balance.toString()}
            icon={
              <HexagonIcon
                width={40}
                height={35}
                backgroundColor={'rgba(45, 103, 89, 1)'}
                icon={<WalletIcon />}
              />
            }
            isSelected={true}
            onCardSelect={(selected) => {}}
          />
        );
      })}
    </Box>
  );
}

export default BuyBitcoinWalletSelectionModal;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
