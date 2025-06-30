import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_check.svg';
import { setPersonalBackupPassword } from 'src/store/reducers/account';
import KeeperTextInput from 'src/components/KeeperTextInput';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';

export const PersonalCloudBackupPassword = ({ navigation }: any) => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const [password, setPassword] = useState(null);
  const [confPassword, setConfPassword] = useState(null);
  const isSmallDevice = useIsSmallDevices();
  const { common } = useContext(LocalizationContext).translations;
  const [errorMessage, setErrorMessage] = useState(null);
  const { id: appId }: any = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const personalBackupPassword = useAppSelector(
    (state) => state.account.personalBackupPasswordByAppId?.[appId]
  );
  const isNew = !personalBackupPassword;

  const onSavePassword = () => {
    try {
      setErrorMessage(null);
      validatePassword();
      dispatch(setPersonalBackupPassword({ appId, password }));
      showToast('Password updated successfully', <TickIcon />);
      setTimeout(() => navigation.goBack(), 100);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const validatePassword = () => {
    if (!password) throw new Error('Password is required');
    if (!confPassword) throw new Error('Confirm password is required');
    if (password != confPassword) throw new Error('Password does not match');
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.header}>
          <WalletHeader title={'Personal Cloud Backup Password'} />
        </Box>
        <ScrollView
          style={styles.scrollViewWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isSmallDevice && { paddingBottom: hp(100) }}
        >
          <Box gap={hp(10)}>
            <Text>{`${isNew ? 'Create' : 'Update'} password for personal cloud backup file`}</Text>
            {/* // ! */}
            <Text>{'This password will be used to encrypt the personal cloud backup file'}</Text>
          </Box>

          <Box
            style={{
              marginTop: hp(30),
              gap: hp(10),
            }}
          >
            <KeyboardInputWithLabel
              testId={'input_password'}
              label={'Enter password'}
              placeholder={'Enter password'}
              value={password}
              onChangeText={setPassword}
            />
            <KeyboardInputWithLabel
              testId={'input_conf_password'}
              label={'Confirm password'}
              placeholder={'Confirm password'} // !
              value={confPassword}
              onChangeText={setConfPassword}
            />
          </Box>
          {errorMessage && <Text color={`${colorMode}.alertRed`}>{errorMessage}</Text>}
        </ScrollView>

        <Buttons
          primaryCallback={onSavePassword}
          primaryText={isNew ? common.create : common.update}
          fullWidth
        />
      </Box>
    </ScreenWrapper>
  );
};

export const KeyboardInputWithLabel = ({ testId, label, placeholder, value, onChangeText }) => {
  const { colorMode } = useColorMode();
  return (
    <Box>
      {label?.length > 0 && <Text>{label}</Text>}
      <KeeperTextInput
        testID={testId}
        placeholder={placeholder}
        inpuBackgroundColor={`${colorMode}.textInputBackground`}
        inpuBorderColor={`${colorMode}.dullGreyBorder`}
        value={value}
        onChangeText={onChangeText}
        paddingLeft={5}
        secureTextEntry
        auto
        autoCapitalize="none"
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
  scrollViewWrapper: {
    flex: 1,
  },
});
