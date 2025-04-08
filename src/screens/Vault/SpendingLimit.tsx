import { Box, useColorMode, View } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import PolicyField from './components/PolicyField';
import OptionDropdown from 'src/components/OptionDropdown';
import { MONTHS_3, MONTHS_6, MONTHS_12, MONTH_1, WEEK_1, WEEKS_2, DAY_1, OFF } from './constants';
import Buttons from 'src/components/Buttons';
import { hp, windowHeight } from 'src/constants/responsive';
import { useNavigation } from '@react-navigation/native';
import { numberWithCommas } from 'src/utils/utilities';
import { NetworkType } from 'src/services/wallets/enums';
import { useAppSelector } from 'src/store/hooks';

const SpendingLimit = ({ route }) => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common } = translations;
  const { totalSats, totalTime, addSignerFlow } = route.params;
  const [maxTransaction, setMaxTransaction] = useState(
    totalSats && totalSats !== 'null' ? numberWithCommas(totalSats) : '0'
  );
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  const isMainNet = bitcoinNetworkType === NetworkType.MAINNET;

  const MAINNET_SERVER_POLICY_DURATIONS = [
    { label: OFF, value: 0 },
    { label: DAY_1, value: 1 * 24 * 60 * 60 * 1000 },
    { label: WEEK_1, value: 7 * 24 * 60 * 60 * 1000 },
    { label: WEEKS_2, value: 14 * 24 * 60 * 60 * 1000 },
    { label: MONTH_1, value: 30 * 24 * 60 * 60 * 1000 },
    { label: MONTHS_3, value: 3 * 30 * 24 * 60 * 60 * 1000 },
    { label: MONTHS_6, value: 6 * 30 * 24 * 60 * 60 * 1000 },
    { label: MONTHS_12, value: 12 * 30 * 24 * 60 * 60 * 1000 },
  ];

  const TESTNET_SERVER_POLICY_DURATIONS = [
    { label: OFF, value: 0 },
    { label: DAY_1, value: 5 * 60 * 1000 }, // 5 minutes
    { label: WEEK_1, value: 30 * 60 * 1000 }, //  30 minutes
    { label: WEEKS_2, value: 1 * 60 * 1000 }, //  1 hour
    { label: MONTH_1, value: 2 * 60 * 1000 }, //  2 hours
    { label: MONTHS_3, value: 3 * 60 * 60 * 1000 }, //  3 hours
    { label: MONTHS_6, value: 4 * 60 * 60 * 1000 }, //  4 hours
    { label: MONTHS_12, value: 5 * 60 * 60 * 1000 }, //  5 hours
  ];

  const SERVER_POLICY_DURATIONS = isMainNet
    ? MAINNET_SERVER_POLICY_DURATIONS
    : TESTNET_SERVER_POLICY_DURATIONS;

  const DEFAULT_TIMELOCK = SERVER_POLICY_DURATIONS[2];
  const [selectedOption, setSelectedOption] = useState(totalTime || DEFAULT_TIMELOCK);

  const handleConfirm = () => {
    navigation.navigate('ChoosePolicyNew', {
      isUpdate: true,
      maxTransaction: maxTransaction.replace(/,/g, ''),
      timelimit: selectedOption,
      addSignerFlow,
    });
  };

  const handleInputChange = (text: string) => {
    let cleanedText = text.replace(/[^0-9.]/g, '');
    let formattedText = numberWithCommas(cleanedText);
    setMaxTransaction(formattedText);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper>
          <WalletHeader title={signingServer.configureLimit} />
          <Text color={`${colorMode}.modalSubtitleBlack`} style={styles.subtitleText}>
            {signingServer.configureLimitSubTitle}
          </Text>
          <Box style={styles.fieldWrapper}>
            <PolicyField
              onPress={() => {}}
              value={maxTransaction}
              onChangeText={handleInputChange}
            />
            <OptionDropdown
              options={SERVER_POLICY_DURATIONS}
              selectedOption={selectedOption}
              onOptionSelect={(option) => setSelectedOption(option)}
            />
          </Box>
          <Box style={styles.btnWrapper}>
            <Buttons primaryText={common.confirm} primaryCallback={handleConfirm} fullWidth />
          </Box>
        </ScreenWrapper>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SpendingLimit;

const styles = StyleSheet.create({
  subtitleText: {
    marginTop: 12,
  },
  fieldWrapper: {
    gap: 20,
    flex: 1,
  },
  btnWrapper: {
    paddingTop: hp(windowHeight > 700 ? 18 : 0),
    paddingBottom: hp(20),
  },
});
