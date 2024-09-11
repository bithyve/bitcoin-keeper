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
import WatchOnlyIcon from 'src/assets/images/watchonly.svg';
import SignersIcon from 'src/assets/images/signers.svg';
import WalletfileIcon from 'src/assets/images/walletfile.svg';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import { hp } from 'src/constants/responsive';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';

function AddWalletContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  return (
    <Box>
      <Box style={styles.addWalletContainer}>
        <Box style={styles.addWalletIconWrapper}>
          <WatchOnlyIcon />
        </Box>
        <Box style={styles.addWalletContentWrapper}>
          <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletTitleText}>
            {wallet.watchOnly}
          </Text>
          <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletDescText}>
            {wallet.watchOnlyDesc}
          </Text>
        </Box>
      </Box>
      <Box style={styles.addWalletContainer}>
        <Box style={styles.addWalletIconWrapper}>
          <WalletfileIcon />
        </Box>
        <Box style={styles.addWalletContentWrapper}>
          <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletTitleText}>
            {wallet.walletConfigurationFile}
          </Text>
          <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletDescText}>
            {wallet.walletConfigurationFileDesc}
          </Text>
        </Box>
      </Box>
      <Box style={styles.addWalletContainer}>
        <Box style={styles.addWalletIconWrapper}>
          <SignersIcon />
        </Box>
        <Box style={styles.addWalletContentWrapper}>
          <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletTitleText}>
            {wallet.useSignersVaultRegistration}
          </Text>
          <Text color={`${colorMode}.modalGreenContent`} style={styles.addWalletDescText}>
            {wallet.useSignersVaultRegistrationDesc}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

function AddWallet({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;
  const isSmallDevice = useIsSmallDevices();
  const dispatch = useDispatch();
  const [selectedCard, selectCard] = useState(1);
  const [visibleModal, setVisibleModal] = useState(false);

  const onCardSelect = (id: number) => {
    selectCard(id);
  };

  let setPadding;
  if (selectedCard === 3) {
    setPadding = hp(40);
  } else {
    setPadding = isSmallDevice ? 50 : 0;
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={wallet.AddWallet}
        subtitle={wallet.chooseFromTemplate}
        learnMore
        learnMorePressed={() => {
          setVisibleModal(true);
        }}
        learnTextColor={`${colorMode}.white`}
      />
      <HStack style={[styles.container, { paddingBottom: setPadding }]}>
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
        title={wallet.AddWallet}
        subTitle={''}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={AddWalletContent}
        showCloseIcon={false}
        learnMore
        learnMoreTitle={common.needHelp}
        learnMoreCallback={() => {
          setVisibleModal(false);
          dispatch(goToConcierge([ConciergeTag.WALLET], 'add-wallet'));
        }}
        buttonText={common.ok}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonCallback={() => setVisibleModal(false)}
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
    flexDirection: 'row',
    width: '100%',
  },
  addWalletIconWrapper: {
    width: '15%',
  },
  addWalletContentWrapper: {
    width: '85%',
  },
  addWalletDescText: {
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
    marginBottom: 5,
  },
  addWalletTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.65,
    padding: 1,
  },
});

export default AddWallet;
