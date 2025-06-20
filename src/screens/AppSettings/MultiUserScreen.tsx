import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { clearHasCreds } from 'src/store/reducers/login';
import { setAppCreated } from 'src/store/reducers/storage';
import { useAppSelector } from 'src/store/hooks';
import LoginMethod from 'src/models/enums/LoginMethod';
import KeeperModal from 'src/components/KeeperModal';
import DisableBiometricIllustration from 'src/assets/images/DisableBiometricIllustration.svg';
import { changeLoginMethod } from 'src/store/sagaActions/login';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_check.svg';
import { setInitialNodesSaved } from 'src/store/reducers/network';
import { saveBackupMethodByAppId } from 'src/store/sagaActions/account';
import { setBackupType } from 'src/store/reducers/bhr';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

export const MultiUserScreen = ({ navigation }: any) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const dispatch = useDispatch();
  const { settings } = useContext(LocalizationContext).translations;
  const { loginMethod } = useAppSelector((state) => state.settings);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const { showToast } = useToastMessage();
  const { allAccounts } = useAppSelector((s) => s.account);

  const onAddNewUser = () => {
    if (loginMethod === LoginMethod.BIOMETRIC) {
      setShowBiometricModal(true);
      return;
    }
    dispatch(clearHasCreds());
    dispatch(setAppCreated(false));
    dispatch(setInitialNodesSaved(false));
    dispatch(saveBackupMethodByAppId());
    dispatch(setBackupType(null));
    navigation.replace('LoginStack', {
      screen: 'CreatePin',
    });
  };

  const onDisableBiometric = () => {
    dispatch(changeLoginMethod(LoginMethod.PIN));
    setShowBiometricModal(false);
    showToast('Biometric authentication disabled', <TickIcon />);
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.header}>
          <WalletHeader title={settings.multiUserScreenHeader} />
        </Box>

        <Box
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          style={styles.contentCtr}
        >
          <Text fontSize={14}>{settings.multiUserScreenTitle1}</Text>
          <Box alignItems={'center'}>
            <ThemedSvg name={'multiuser_illustration'} />
          </Box>
          <Buttons
            primaryText="Add User"
            primaryCallback={onAddNewUser}
            fullWidth
            primaryDisable={allAccounts.length >= 10}
          />
        </Box>
      </Box>
      <KeeperModal
        visible={showBiometricModal}
        closeOnOverlayClick={false}
        close={() => setShowBiometricModal(false)}
        title={'Disable Biometrics'}
        subTitleWidth={wp(240)}
        subTitle={'You need to disable biometric login to create multiple accounts'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box style={styles.modalCtr}>
              <Box alignItems={'center'}>
                <DisableBiometricIllustration />
              </Box>
              <Buttons
                primaryText={'Disable'}
                primaryCallback={onDisableBiometric}
                secondaryText="Cancel"
                secondaryCallback={() => setShowBiometricModal(false)}
              />
            </Box>
          </Box>
        )}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
  contentCtr: {
    padding: wp(20),
    paddingBottom: wp(11),
    borderWidth: 1,
    borderRadius: 12,
    gap: hp(30),
  },
  modalCtr: {
    marginTop: hp(20),
    gap: hp(30),
  },
});
