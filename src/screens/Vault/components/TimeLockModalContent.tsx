import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import IKSInfocard from './IKSInfoCard';
import { useContext } from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const TimeLockModalContent = ({ name, description, duration, Icon, callback }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText, common } = translations;
  return (
    <Box style={styles.infoContainer}>
      <IKSInfocard name={name} description={description} duration={duration} Icon={Icon} />
      <Box>
        <Text color={`${colorMode}.secondaryText`}>{vaultText.timelockInfo}</Text>
      </Box>
      <Box style={styles.buttonContainer}>
        <Buttons primaryText={common.continue} primaryCallback={callback} fullWidth />
      </Box>
    </Box>
  );
};

export default TimeLockModalContent;

const styles = StyleSheet.create({
  infoContainer: {
    gap: hp(25),
  },
  buttonContainer: {
    marginTop: 20,
  },
});
