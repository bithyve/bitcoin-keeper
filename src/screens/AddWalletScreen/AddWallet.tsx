import { Box, ScrollView, useColorMode } from 'native-base';
import { useContext, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SingleSig from './SingleSig';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';

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
        <SingleSig selectedCard={selectedCard} onCardSelect={onCardSelect} />
        <SingleSig selectedCard={selectedCard} onCardSelect={onCardSelect} />
        <SingleSig selectedCard={selectedCard} onCardSelect={onCardSelect} />
        <Box style={{ alignSelf: 'flex-end', marginRight: 10 }}>
          <CustomGreenButton value={common.proceed} />
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default AddWallet;
