import React, { useCallback } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import { useNavigation, CommonActions } from '@react-navigation/native';
import WarningIllustration from 'src/assets/images/warning.svg';
import Text from 'src/components/KeeperText';
import useVault from 'src/hooks/useVault';

function IdentifySignerModal({ visible, close, signer, secondaryCallback, vaultId }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  const { activeVault } = useVault({ vaultId });
  const Content = useCallback(() => {
    return (
      <Box alignItems="center">
        <WarningIllustration />
        <Box>
          <Text color={`${colorMode}.greenText`} fontSize={14} padding={1} letterSpacing={0.65}>
            {
              'The signing process will be smoother if you identify your signer type correctly.\n\nYou can always chang it from the device settings > advance options > assign signer type.'
            }
          </Text>
        </Box>
      </Box>
    );
  }, []);

  const callback = () => {
    close();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AssignSignerType',
        params: {
          vault: activeVault,
        },
      })
    );
  };
  const cleanedSecondaryCallback = () => {
    close();
    secondaryCallback();
  };
  return (
    <KeeperModal
      visible={visible}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.textGreen`}
      subTitleColor={`${colorMode}.modalSubtitleBlack`}
      close={close}
      title="Assign device type"
      subTitle="Identify your device type for enhanced connectivity and communication"
      buttonText="Identify"
      secondaryButtonText="Skip"
      secondaryCallback={cleanedSecondaryCallback}
      Content={Content}
      buttonCallback={callback}
    />
  );
}

export default IdentifySignerModal;
