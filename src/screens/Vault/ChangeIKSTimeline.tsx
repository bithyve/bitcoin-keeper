import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import OptionDropdown from 'src/components/OptionDropdown';
import Buttons from 'src/components/Buttons';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSignerMap from 'src/hooks/useSignerMap';
import { Signer } from 'src/services/wallets/interfaces/vault';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { SDIcons } from './SigningDeviceIcons';
import TimeLockModalContent from './components/TimeLockModalContent';
import { MONTHS_12, MONTHS_18, MONTHS_24 } from './constants';

const DEFAULT_INHERITANCE_TIMELOCK = { label: MONTHS_12, value: 12 * 30 * 24 * 60 * 60 * 1000 };
const INHERITANCE_TIMELOCK_DURATIONS = [
  DEFAULT_INHERITANCE_TIMELOCK,
  { label: MONTHS_18, value: 18 * 30 * 24 * 60 * 60 * 1000 },
  { label: MONTHS_24, value: 24 * 30 * 24 * 60 * 60 * 1000 },
];
function ChangeIKSTimeline({ route }) {
  const { signerId }: { signerId: string } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signerMap } = useSignerMap();
  const signer: Signer = signerMap[signerId];
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText, common } = translations;
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLockModal, setTimeLockModal] = useState(false);
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={vaultText.changeTimeline} subtitle={vaultText.changeTimelineDesc} />
      <Box style={styles.container}>
        <OptionDropdown
          label={vaultText.setTimelock}
          options={INHERITANCE_TIMELOCK_DURATIONS}
          selectedOption={selectedOption}
          onOptionSelect={(option) => setSelectedOption(option)}
        />
        <Buttons
          primaryText={common.confirm}
          primaryCallback={() => setTimeLockModal(true)}
          primaryDisable={!selectedOption}
          fullWidth
        />
      </Box>
      <KeeperModal
        visible={timeLockModal}
        close={() => setTimeLockModal(false)}
        title={vaultText.revaultTimelineChanged}
        subTitleWidth={wp(280)}
        subTitle={vaultText.revaultTimelineChangedDesc}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={true}
        Content={() => (
          <TimeLockModalContent
            name={signer.signerName}
            description={`${common.added} ${moment(signer.addedOn).calendar().toLowerCase()}`}
            Icon={SDIcons(signer.type).Icon}
            callback={() => {
              setTimeLockModal(false);
              navigation.goBack();
            }}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default ChangeIKSTimeline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(40),
    paddingHorizontal: wp(10),
    justifyContent: 'space-between',
  },
});
