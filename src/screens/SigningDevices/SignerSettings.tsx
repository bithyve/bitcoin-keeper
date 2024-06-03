import React, { useContext, useState } from 'react';
import { Box, useColorMode } from 'native-base';

import { wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';

function SignerSettings({ navigation, route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const isUaiFlow: boolean = route.params?.isUaiFlow ?? false;
  const [confirmPassVisible, setConfirmPassVisible] = useState(isUaiFlow);

  const onSuccess = () => navigation.navigate('DeleteKeys');

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={settings.SingerSettingsTitle}
        mediumTitle
        subtitle={settings.SingerSettingsSubtitle}
      />
      <Box style={{ paddingVertical: '10%', paddingLeft: 20 }}>
        <OptionCard
          title={settings.deleteKeys}
          description={settings.deleteKeysSubtitle}
          callback={() => setConfirmPassVisible(true)}
        />
      </Box>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        DarkCloseIcon={colorMode === 'dark'}
        close={() => setConfirmPassVisible(false)}
        title={settings.EnterPasscodeTitle}
        subTitleWidth={wp(240)}
        subTitle={settings.EnterPasscodeSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics={false}
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onSuccess}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default SignerSettings;
