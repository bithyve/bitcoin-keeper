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
      <KeeperHeader title={`Advanced Options`} mediumTitle subtitle={'For all keys'} />
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
        close={() => setConfirmPassVisible(false)}
        title="Enter Passcode"
        subTitleWidth={wp(240)}
        subTitle="Confirm passcode to show all hidden keys"
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
