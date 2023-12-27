import { Box, ScrollView, useColorMode } from 'native-base';
import { useContext, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletDark from 'src/assets/images/walletDark.svg';
import SignerCard from 'src/components/SignerCard';
import { StyleSheet } from 'react-native';
import AddSignerCard from 'src/components/AddCard';

function AddSigner({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer, common } = translations;

  const [selectedCard, selectCard] = useState('');

  const onCardSelect = (name: string) => {
    if (name === selectedCard) selectCard('');
    else selectCard(name);
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`rgba(247, 242, 236, 1)`}>
      <KeeperHeader title={signer.addSigner} subtitle={signer.addSignerSubTitle} />
      <ScrollView showsVerticalScrollIndicator={true}>
        <Box style={styles.signerContainer}>
          <SignerCard
            walletName={'Testing'}
            walletDescription={'Description'}
            icon={colorMode === 'dark' ? <WalletActiveIcon /> : <WalletDark />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
          <SignerCard
            walletName={'Testing'}
            walletDescription={'Description'}
            icon={colorMode === 'dark' ? <WalletActiveIcon /> : <WalletDark />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
          <SignerCard
            walletName={'Testing'}
            walletDescription={'Description'}
            icon={colorMode === 'dark' ? <WalletActiveIcon /> : <WalletDark />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
          <SignerCard
            walletName={'Testing'}
            walletDescription={'Description'}
            icon={colorMode === 'dark' ? <WalletActiveIcon /> : <WalletDark />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
          <AddSignerCard
            name={'Add'}
            walletDescription={'Description'}
            icon={colorMode === 'dark' ? <WalletActiveIcon /> : <WalletDark />}
            selectedCard={selectedCard}
            onCardSelect={onCardSelect}
          />
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signerContainer: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    marginTop: 5,
  },
});

export default AddSigner;
