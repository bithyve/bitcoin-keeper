import { Box, HStack, useColorMode } from 'native-base';
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
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import KeyIcon from 'src/assets/images/multi-or-single-key.svg';
import ImportWalletIcon from 'src/assets/images/importing-wallet.svg';
import AdvanceCustomizationIcon from 'src/assets/images/advanced-customization.svg';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import { hp } from 'src/constants/responsive';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';

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
            <Text
              color={`${colorMode}.modalGreenContent`}
              semiBold
              style={styles.addWalletTitleText}
            >
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
      <HStack style={[styles.container]}>
        <WalletCard
          id={1}
          walletName={wallet.CreateNew}
          walletDescription={wallet.singleMultiKey}
          icon={<WalletActiveIcon />}
          selectedIcon={<WalletGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ alignSelf: 'flex-end', marginRight: 10 }}
        />
        <WalletCard
          id={2}
          walletName={wallet.import}
          walletDescription={wallet.recoverRecreate}
          icon={<ImportIcon />}
          selectedIcon={<ImportGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ alignSelf: 'center' }}
        />
        <WalletCard
          id={3}
          walletName={wallet.advanced}
          walletDescription={wallet.CustomMultiKey}
          icon={<AdvancedIcon />}
          selectedIcon={<AdvancedGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ marginLeft: 10 }}
        />
      </HStack>
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
  container: {
    gap: 4,
    marginTop: hp(10),
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
    fontSize: 15,
    padding: 1,
  },
});

export default AddWallet;
