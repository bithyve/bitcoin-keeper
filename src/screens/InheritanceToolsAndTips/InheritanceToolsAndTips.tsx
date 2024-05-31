import React, { useContext, useState } from 'react';
import { Box, HStack, Text, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
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
import KeySecuriy from './KeySecurity';
import BackupRecovery from './BackupRecovery';
import InheritanceTool from './InheritanceTool';
import { hp, wp } from 'src/constants/responsive';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import KeeperModal from 'src/components/KeeperModal';
import BTCModalIcon from 'src/assets/images/btc-illustration.svg';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';

function InheritanceToolsAndTips({ navigation }) {
  const { colorMode } = useColorMode();
  const isSmallDevice = useIsSmallDevices();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common, inheritence: inheritanceTranslation } = translations;
  const [selectedCard, selectCard] = useState(1);
  const [inheritanceModal, setInheritanceModal] = useState(false);

  let setPadding;
  if (selectedCard === 3) {
    setPadding = hp(20);
  } else {
    setPadding = isSmallDevice && selectedCard === 3 ? hp(30) : 0;
  }

  const onCardSelect = (id: number) => {
    selectCard(id);
  };

  function InheritanceModalContent() {
    return (
      <Box style={styles.ModalContainer}>
        <Box style={styles.BTCModalIcon}>
          <BTCModalIcon />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.inhertianceModalDesc}>
          {inheritanceTranslation.learnMoreDescription}
        </Text>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={inheritanceTranslation.SecurityAndInheritance}
        subtitle={inheritanceTranslation.SecurityAndInheritanceDescp}
        learnMore={true}
        learnBackgroundColor={`${colorMode}.BrownNeedHelp`}
        learnTextColor={`${colorMode}.white`}
        learnMorePressed={() => setInheritanceModal(true)}
      />
      <HStack style={[styles.container, { paddingBottom: setPadding }]}>
        <WalletCard
          id={1}
          numberOfLines={2}
          walletName={inheritanceTranslation.KeySecurity}
          icon={<WalletActiveIcon />}
          selectedIcon={<WalletGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ alignSelf: 'flex-end', marginRight: 10 }}
        />
        <WalletCard
          id={2}
          numberOfLines={2}
          walletName={inheritanceTranslation.BackupAndRecovery}
          icon={<ImportIcon />}
          selectedIcon={<ImportGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ alignSelf: 'center' }}
        />
        <WalletCard
          id={3}
          numberOfLines={2}
          walletName={inheritanceTranslation.InheritanceDocuments}
          icon={<AdvancedIcon />}
          selectedIcon={<AdvancedGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ marginLeft: 10 }}
        />
      </HStack>
      {selectedCard === 1 && <KeySecuriy navigation={navigation} />}
      {selectedCard === 2 && <BackupRecovery navigation={navigation} />}
      {selectedCard === 3 && <InheritanceTool navigation={navigation} />}
      <KeeperModal
        visible={inheritanceModal}
        close={() => {
          setInheritanceModal(false);
        }}
        title={inheritanceTranslation.learnMoreTitle}
        subTitle={inheritanceTranslation.learnMoreSubTitle}
        subTitleWidth={wp(295)}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={InheritanceModalContent}
        DarkCloseIcon
        learnMore
        learnMoreTitle={common.needMoreHelp}
        learnMoreCallback={() =>
          dispatch(goToConcierge([ConciergeTag.INHERITANCE], 'inheritance-tools-and-tips'))
        }
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonText={common.continue}
        buttonCallback={() => setInheritanceModal(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginTop: hp(10),
  },
  ModalContainer: {
    gap: 20,
  },
  BTCModalIcon: {
    alignSelf: 'center',
  },
  inhertianceModalDesc: {
    marginTop: hp(10),
    fontWeight: 400,
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
    marginBottom: 25,
    width: wp(295),
  },
});

export default InheritanceToolsAndTips;
