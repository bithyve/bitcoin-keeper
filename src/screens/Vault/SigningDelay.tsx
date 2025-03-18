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
import { NetworkType } from 'src/services/wallets/enums';
import config from 'src/utils/service-utilities/config';

const SigningDelay = ({ route }) => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common } = translations;
  const { totalDelay, addSignerFlow } = route.params;

  const isMainNet = config.NETWORK_TYPE === NetworkType.MAINNET;

  const MAINNET_DURATIONS = [
    { label: OFF, value: 0 },
    { label: DAY_1, value: 1 * 24 * 60 * 60 * 1000 },
    { label: DAY_3, value: 3 * 24 * 60 * 60 * 1000 },
    { label: DAY_5, value: 5 * 24 * 60 * 60 * 1000 },
    { label: WEEK_1, value: 7 * 24 * 60 * 60 * 1000 },
    { label: WEEKS_2, value: 14 * 24 * 60 * 60 * 1000 },
  ];

  const TESTNET_DURATIONS = [
    { label: OFF, value: 0 },
    { label: DAY_1, value: 5 * 60 * 1000 }, // 5 minutes
    { label: DAY_3, value: 10 * 60 * 1000 }, // 10 minutes
    { label: DAY_5, value: 15 * 60 * 1000 }, // 15 minutes
    { label: WEEK_1, value: 30 * 60 * 1000 }, // 30 minutes
    { label: WEEKS_2, value: 1 * 60 * 60 * 1000 }, // 1 hour
  ];

  const TIMELOCK_DURATIONS = isMainNet ? MAINNET_DURATIONS : TESTNET_DURATIONS;

  const DEFAULT_TIMELOCK = isMainNet ? MAINNET_DURATIONS[1] : TESTNET_DURATIONS[1];

  const [selectedOption, setSelectedOption] = useState(totalDelay ? totalDelay : DEFAULT_TIMELOCK);
  const handleDelay = () => {
    navigation.navigate('ChoosePolicyNew', {
      delayTime: selectedOption,
      addSignerFlow,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScreenWrapper>
        <WalletHeader title={signingServer.signigDelay} />
        <Text color={`${colorMode}.modalWhiteContent`} medium style={styles.title}>
          {signingServer.signigDelaySubTitle}
        </Text>
        <Text color={`${colorMode}.policySubtitle`} style={styles.subtitleText}>
          {signingServer.serverSigningDelaySubTitle}
        </Text>
        <Box style={styles.fieldWrapper}>
          <OptionDropdown
            options={TIMELOCK_DURATIONS}
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
