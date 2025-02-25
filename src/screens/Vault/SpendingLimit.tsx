import { Box, useColorMode, View } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import PolicyField from './components/PolicyField';
import OptionDropdown from 'src/components/OptionDropdown';
import {
  MONTHS_3,
  MONTHS_6,
  MONTHS_12,
  MONTH_1,
  WEEK_1,
  WEEKS_2,
  DAY_1,
  NO_LIMIT,
} from './constants';
import Buttons from 'src/components/Buttons';
import { hp, windowHeight } from 'src/constants/responsive';
import { useNavigation } from '@react-navigation/native';

const SpendingLimit = ({ route }) => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common } = translations;
  const { totalSats, totalTime } = route.params;

  const [maxTransaction, setMaxTransaction] = useState(totalSats ? `${totalSats}` : '0');

  const DEFAULT_INHERITANCE_TIMELOCK = { label: WEEK_1, value: 7 * 24 * 60 * 60 * 1000 };
  const [selectedOption, setSelectedOption] = useState(
    totalTime ? totalTime : DEFAULT_INHERITANCE_TIMELOCK
  );

  const INHERITANCE_TIMELOCK_DURATIONS = [
    { label: NO_LIMIT, value: 0 },
    { label: DAY_1, value: 1 * 24 * 60 * 60 * 1000 },
    DEFAULT_INHERITANCE_TIMELOCK,
    { label: WEEKS_2, value: 14 * 24 * 60 * 60 * 1000 },
    { label: MONTH_1, value: 30 * 24 * 60 * 60 * 1000 },
    { label: MONTHS_3, value: 3 * 30 * 24 * 60 * 60 * 1000 },
    { label: MONTHS_6, value: 6 * 30 * 24 * 60 * 60 * 1000 },
    { label: MONTHS_12, value: 12 * 30 * 24 * 60 * 60 * 1000 },
  ];
  const handleConfirm = () => {
    navigation.navigate('ChoosePolicyNew', {
      isUpdate: true,
      maxTransaction: maxTransaction,
      timelimit: selectedOption,
    });
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
              onChangeText={(text) => setMaxTransaction(text)}
            />
            <OptionDropdown
              options={INHERITANCE_TIMELOCK_DURATIONS}
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
