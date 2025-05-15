import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import MultiUserIllustration from 'src/assets/images/MultiUserIllustration.svg';
import MultiUserIllustrationDark from 'src/assets/images/MultiUserIllustrationDark.svg';
import { clearHasCreds } from 'src/store/reducers/login';
import { setAppCreated } from 'src/store/reducers/storage';

export const MultiUserScreen = ({ navigation }: any) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const dispatch = useDispatch();
  const { settings } = useContext(LocalizationContext).translations;

  const onAddNewUser = () => {
    dispatch(clearHasCreds());
    dispatch(setAppCreated(false));
    navigation.replace('LoginStack', {
      screen: 'CreatePin',
    });
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
            {isDarkMode ? <MultiUserIllustrationDark /> : <MultiUserIllustration />}
          </Box>
          <Text fontSize={14}>{settings.multiUserScreenTitle2}</Text>
          <Buttons primaryText="Add User" primaryCallback={onAddNewUser} fullWidth />
        </Box>
      </Box>
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
});
