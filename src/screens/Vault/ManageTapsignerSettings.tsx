import { useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Signer } from 'src/services/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/services/wallets/enums';
import OptionCard from 'src/components/OptionCard';

import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ScrollView } from 'react-native-gesture-handler';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { SDIcons } from './SigningDeviceIcons';
import { InteracationMode } from './HardwareModalMap';

function ManageTapsignerSettings({ route }: any) {
  const { colorMode } = useColorMode();
  const {
    signer: signerFromParam,
  }: {
    signer: Signer;
  } = route.params;

  const signer: Signer = signerFromParam;

  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations } = translations;

  const navigation: any = useNavigation();

  const navigateToUnlockTapsigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UnlockTapsigner',
      })
    );
  };

  const onChangeTapsignerPin = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChangeTapsignerPin',
        params: {
          signer: signer,
        },
      })
    );
  };

  const onSaveTapsignerBackup = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'TapsignerAction',
        params: {
          mode: InteracationMode.BACKUP_SIGNER,
          signer: signer,
        },
      })
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={signerTranslations.manageTapsigner} />
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={signerTranslations.saveBackup}
          description={signerTranslations.saveBackupDesc}
          callback={onSaveTapsignerBackup}
        />
        <OptionCard
          title={signerTranslations.changePIN}
          description={signerTranslations.changeCardPIN}
          callback={onChangeTapsignerPin}
        />
        <OptionCard
          title={signerTranslations.unlockCardRateLimit}
          description={signerTranslations.runUnlockCard}
          callback={navigateToUnlockTapsigner}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

export default ManageTapsignerSettings;

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingTop: hp(10),
    paddingHorizontal: wp(10),
  },
});
