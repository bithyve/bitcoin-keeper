import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppSelector } from 'src/store/hooks';
import { setRecepitVerificationFailed } from 'src/store/reducers/login';
import { Shadow } from 'react-native-shadow-2';

function DowngradeModalContent() {
  const { colorMode } = useColorMode();

  return (
    <Box>
      <Box alignItems="center">
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      </Box>
    </Box>
  );
}

export function DowngradeModal() {
  const { colorMode } = useColorMode();
  const { recepitVerificationFailed } = useAppSelector((state) => state.login);
  const { translations } = useContext(LocalizationContext);
  const { common, choosePlan } = translations;
  const dispatch = useDispatch();

  return (
    <KeeperModal
      dismissible={false}
      close={() => {}}
      visible={recepitVerificationFailed}
      title={choosePlan.validateSubscriptionTitle}
      subTitle={choosePlan.validateSubscriptionSubTitle}
      Content={() => <DowngradeModalContent />}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      subTitleWidth={wp(210)}
      showCloseIcon={false}
      buttonText={common.continue}
      buttonCallback={dispatch(setRecepitVerificationFailed(false))}
    />
  );
}

const styles = StyleSheet.create({
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
});
