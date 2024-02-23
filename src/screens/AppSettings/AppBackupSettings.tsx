import React, { useContext, useState } from 'react';
import { ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import OptionCard from 'src/components/OptionCard';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

function AppBackupSettings() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.BackupSettings} subtitle={settings.BackupSettingSubTitle} />
      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title="View Recovery Keys"
          description="you can view keys"
          callback={() => {
            setConfirmPassVisible(true);
          }}
        />
      </ScrollView>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle="To backup app recovery key"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              navigation.dispatch(
                CommonActions.navigate('ExportSeed', {
                  seed: primaryMnemonic,
                  next: false,
                  viewRecoveryKeys: true,
                })
              );
            }}
          />
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  optionsListContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
export default AppBackupSettings;
