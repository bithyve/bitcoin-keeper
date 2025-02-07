import React, { useContext, useState } from 'react';
import { Box, Text, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletActiveIcon from 'src/assets/images/wallet-white-small.svg';
import WalletGreenIcon from 'src/assets/images/wallet-green-small.svg';
import AdvancedGreenIcon from 'src/assets/images/advanced-green-small.svg';
import AdvancedIcon from 'src/assets/images/advanced-white-small.svg';
import ImportGreenIcon from 'src/assets/images/import-green-small.svg';
import ImportIcon from 'src/assets/images/import-white-small.svg';
import KeySecuriy from './KeySecurity';
import BackupRecovery from './BackupRecovery';
import InheritanceTool from './InheritanceTool';
import { hp, wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import BTCModalIcon from 'src/assets/images/btc-illustration.svg';
import { useDispatch } from 'react-redux';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import MenuCardWrapper from 'src/components/MenuCardWrapper';
import { CommonActions } from '@react-navigation/native';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';

function InheritanceToolsAndTips({ navigation }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common, inheritence: inheritanceTranslation } = translations;
  const [selectedCard, selectCard] = useState(1);
  const [inheritanceModal, setInheritanceModal] = useState(false);

  const menuData = [
    {
      title: inheritanceTranslation.KeySecurity,
      icon: <WalletActiveIcon />,
      selectedIcon: <WalletGreenIcon />,
      selectedCard: selectedCard,
    },
    {
      title: inheritanceTranslation.BackupAndRecovery,
      icon: <ImportIcon />,
      selectedIcon: <ImportGreenIcon />,
      selectedCard: selectedCard,
    },
    {
      title: inheritanceTranslation.InheritanceDocuments,
      icon: <AdvancedIcon />,
      selectedIcon: <AdvancedGreenIcon />,
      selectedCard: selectedCard,
    },
  ];

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
        learnTextColor={`${colorMode}.buttonText`}
        learnMorePressed={() => setInheritanceModal(true)}
      />
      <MenuCardWrapper
        menuData={menuData}
        selectedCard={selectedCard}
        onCardSelect={onCardSelect}
        numberOfLines={2}
      />
      <Box style={styles.optionsContainer}>
        {selectedCard === 1 && <KeySecuriy navigation={navigation} />}
        {selectedCard === 2 && <BackupRecovery navigation={navigation} />}
        {selectedCard === 3 && <InheritanceTool navigation={navigation} />}
      </Box>
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
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.whiteButtonText`}
        buttonBackground={`${colorMode}.whiteButtonBackground`}
        secButtonTextColor={`${colorMode}.whiteSecButtonText`}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          setInheritanceModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: [ConciergeTag.INHERITANCE],
                screenName: 'inheritance-tools-and-tips',
              },
            })
          );
        }}
        buttonCallback={() => setInheritanceModal(false)}
        DarkCloseIcon
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flex: 1,
    marginLeft: wp(5),
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
    fontSize: 14,
    letterSpacing: 0.65,
    padding: 1,
    marginBottom: 25,
    width: wp(295),
  },
});

export default InheritanceToolsAndTips;
