import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import OptionDropdown from 'src/components/OptionDropdown';
import { WEEK_1, WEEKS_2, DAY_3, DAY_5, DAY_1, OFF } from './constants';
import Buttons from 'src/components/Buttons';
import { hp, windowHeight } from 'src/constants/responsive';
import { useNavigation } from '@react-navigation/native';

const SigningDelay = ({ route }) => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common } = translations;
  const { totalDelay } = route.params;

  const DEFAULT_INHERITANCE_TIMELOCK = { label: DAY_1, value: 1 * 24 * 60 * 60 * 1000 };
  const [selectedOption, setSelectedOption] = useState(
    totalDelay ? totalDelay : DEFAULT_INHERITANCE_TIMELOCK
  );

  const INHERITANCE_TIMELOCK_DURATIONS = [
    { label: OFF, value: 0 },
    DEFAULT_INHERITANCE_TIMELOCK,
    { label: DAY_3, value: 3 * 24 * 60 * 60 * 1000 },
    { label: DAY_5, value: 5 * 24 * 60 * 60 * 1000 },
    { label: WEEK_1, value: 7 * 24 * 60 * 60 * 1000 },
    { label: WEEKS_2, value: 14 * 24 * 60 * 60 * 1000 },
  ];
  const handleDelay = () => {
    navigation.navigate('ChoosePolicyNew', {
      delayTime: selectedOption,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScreenWrapper>
        <WalletHeader title={signingServer.signigDelay} />
        <Text color={`${colorMode}.subPlansubtitle`} medium style={styles.title}>
          {signingServer.signigDelaySubTitle}
        </Text>
        <Text color={`${colorMode}.policySubtitle`} style={styles.subtitleText}>
          {signingServer.serverSigningDelaySubTitle}
        </Text>
        <Box style={styles.fieldWrapper}>
          <OptionDropdown
            options={INHERITANCE_TIMELOCK_DURATIONS}
            selectedOption={selectedOption}
            onOptionSelect={(option) => setSelectedOption(option)}
          />
        </Box>
        <Box style={styles.btnWrapper}>
          <Buttons primaryText={common.confirm} primaryCallback={handleDelay} fullWidth />
        </Box>
      </ScreenWrapper>
    </TouchableWithoutFeedback>
  );
};

export default SigningDelay;

const styles = StyleSheet.create({
  subtitleText: {
    fontSize: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    marginTop: 20,
  },
  fieldWrapper: {
    marginTop: 15,
    gap: 20,
    flex: 1,
  },
  btnWrapper: {
    paddingTop: hp(windowHeight > 700 ? 18 : 0),
    paddingBottom: hp(20),
  },
});
