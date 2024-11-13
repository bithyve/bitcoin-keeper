import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletActiveIcon from 'src/assets/images/wallet-white-small.svg';
import WalletGreenIcon from 'src/assets/images/wallet-green-small.svg';
import AdvancedGreenIcon from 'src/assets/images/advanced-green-small.svg';
import AdvancedIcon from 'src/assets/images/advanced-white-small.svg';
import ImportGreenIcon from 'src/assets/images/import-green-small.svg';
import ImportIcon from 'src/assets/images/import-white-small.svg';
import { StyleSheet } from 'react-native';
import Wallets from './Wallets';
import AdvancedWallets from './AdvancedWallets';
import ImportWallets from './ImportWallets';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import KeyIcon from 'src/assets/images/multi-or-single-key.svg';
import ImportWalletIcon from 'src/assets/images/importing-wallet.svg';
import AdvanceCustomizationIcon from 'src/assets/images/advanced-customization.svg';
import { hp } from 'src/constants/responsive';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import MenuCardWrapper from 'src/components/MenuCardWrapper';

function AddWalletContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  const walletOptions = [
    {
      icon: KeyIcon,
      title: wallet.addWalletOption1Title,
      desc: wallet.addWalletOption1Description,
    },
    {
      icon: ImportWalletIcon,
      title: wallet.addWalletOption2Title,
      desc: wallet.addWalletOption2Description,
    },
    {
      icon: AdvanceCustomizationIcon,
      title: wallet.addWalletOption3Title,
      desc: wallet.addWalletOption3Description,
    },
  ];

  return (
    <Box>
      {walletOptions.map((option, index) => (
        <Box key={index} style={styles.addWalletContainer}>
          <Box style={styles.addWalletIconWrapper}>
            <option.icon />
          </Box>
          <Box style={styles.addWalletContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletTitleText}>
              {option.title}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletDescText}>
              {option.desc}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function AddWallet({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;
  const dispatch = useDispatch();
  const [selectedCard, selectCard] = useState(1);
  const [visibleModal, setVisibleModal] = useState(false);

  const onCardSelect = (id: number) => {
    selectCard(id);
  };

  const menuData = [
    {
      title: wallet.CreateNew,
      description: wallet.singleMultiKey,
      icon: <WalletActiveIcon />,
      selectedIcon: <WalletGreenIcon />,
      selectCard: selectedCard,
    },
    {
      title: wallet.import,
      description: wallet.recoverRecreate,
      icon: <ImportIcon />,
      selectedIcon: <ImportGreenIcon />,
      selectCard: selectedCard,
    },
    {
      title: wallet.advanced,
      description: wallet.CustomMultiKey,
      icon: <AdvancedIcon />,
      selectCard: selectedCard,
      selectedIcon: <AdvancedGreenIcon />,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={wallet.AddWallet}
        subtitle={wallet.addWalletHeaderSubtitle}
        learnMore
        learnMorePressed={() => {
          setVisibleModal(true);
        }}
        learnTextColor={`${colorMode}.buttonText`}
      />
      <MenuCardWrapper
        menuData={menuData}
        selectedCard={selectedCard}
        onCardSelect={onCardSelect}
        numberOfLines={1}
      />
      {selectedCard === 1 && <Wallets navigation={navigation} />}
      {selectedCard === 2 && <ImportWallets navigation={navigation} />}
      {selectedCard === 3 && <AdvancedWallets navigation={navigation} />}
      <KeeperModal
        visible={visibleModal}
        close={() => {
          setVisibleModal(false);
        }}
        title={wallet.walletSetupModalTitle}
        subTitle={''}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={AddWalletContent}
        showCloseIcon={true}
        DarkCloseIcon
        secondaryButtonText={common.needHelp}
        secondaryCallback={() => {
          setVisibleModal(false);
          dispatch(goToConcierge([ConciergeTag.WALLET], 'add-wallet'));
        }}
        buttonText={common.Okay}
        buttonCallback={() => setVisibleModal(false)}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    alignSelf: 'center',
  },
  addWalletContainer: {
    width: '100%',
    gap: 10,
  },
  addWalletIconWrapper: {
    width: '15%',
  },
  addWalletContentWrapper: {
    width: '97%',
  },
  addWalletDescText: {
    fontSize: 13,
    padding: 1,
    marginBottom: 25,
  },
  addWalletTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    padding: 1,
  },
});

export default AddWallet;
