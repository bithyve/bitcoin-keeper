import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {
  onPress: () => void;
};

function RecoveryKeyReminderBanner({ onPress }: Props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { home: homeTranslation } = translations;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorMode === 'dark' ? '#2a1a00' : '#fff8ed' },
      ]}
    >
      <Text
        style={styles.label}
        color={colorMode === 'dark' ? '#f5c77e' : '#7a4a00'}
      >
        {homeTranslation.recoveryKeyNotBackedUp}
      </Text>
      <TouchableOpacity onPress={onPress} testID="btn_reminder_backup_now">
        <Text style={styles.cta} color={`${colorMode}.pantoneGreen`}>
          {homeTranslation.backUpNow}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default RecoveryKeyReminderBanner;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    marginHorizontal: wp(16),
    marginBottom: hp(6),
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    flex: 1,
  },
  cta: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: wp(12),
  },
});
