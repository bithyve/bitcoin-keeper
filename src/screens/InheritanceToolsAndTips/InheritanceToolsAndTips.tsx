import React, { useContext, useState } from 'react';
import { HStack, useColorMode } from 'native-base';
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
import { hp } from 'src/constants/responsive';
import useIsSmallDevices from 'src/hooks/useSmallDevices';

function InheritanceToolsAndTips({ navigation }) {
  const { colorMode } = useColorMode();
  const isSmallDevice = useIsSmallDevices();

  const { translations } = useContext(LocalizationContext);
  const { inheritence } = translations;
  const [selectedCard, selectCard] = useState(1);

  let setPadding;
  if (selectedCard === 3) {
    setPadding = hp(40);
  } else {
    setPadding = isSmallDevice ? 50 : 0;
  }

  const onCardSelect = (id: number) => {
    selectCard(id);
  };

  // TODO: add learn more modal
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.Champagne`}>
      <KeeperHeader
        title={inheritence.SecurityAndInheritance}
        subtitle={inheritence.SecurityAndInheritanceDescp}
        // To-Do-Learn-More
      />
      <HStack style={[styles.container, { paddingBottom: setPadding }]}>
        <WalletCard
          id={1}
          numberOfLines={2}
          walletName={`Key\nSecurity`}
          icon={<WalletActiveIcon />}
          selectedIcon={<WalletGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ alignSelf: 'flex-end', marginRight: 10 }}
        />
        <WalletCard
          id={2}
          numberOfLines={2}
          walletName={`Backup and\nRecovery`}
          icon={<ImportIcon />}
          selectedIcon={<ImportGreenIcon />}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          arrowStyles={{ alignSelf: 'center' }}
        />
        <WalletCard
          id={3}
          numberOfLines={2}
          walletName={`Inheritance\nDocuments`}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginTop: hp(10),
  },
});

export default InheritanceToolsAndTips;
