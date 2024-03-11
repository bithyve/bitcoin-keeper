import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import MasterRecoveryKeyIcon from 'src/assets/images/master-recovery-key.svg';

function MasterRecoveryKey({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Master Recovery Key</Text>
        <Text style={styles.description}>Backup 12-word phrase</Text>
        <Text style={styles.commonTextStyle}>
          Each of the vault (multisig wallet) has configuration details that are needed during
          recovery.
        </Text>

        <Text style={styles.commonTextStyle}>
          Your Keeper app’s meta data along with all the configuration files are stored on the cloud
          in an encrypted manner.
        </Text>
        <Text style={styles.commonTextStyle}>
          Simply backing up or noting down the Master Recovery Key gives you access to all this data
          which is updated automatically.
        </Text>
        <Box style={styles.circleStyle}>
          <MasterRecoveryKeyIcon />
        </Box>
        <Box mt={5} alignItems={'center'}>
          <DashedButton
            description="Lorem ipsum dolor amet"
            callback={() => {}}
            name="View Recovery Key"
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            Master Recovery Key also gives access to app’s hot keys and so need to be secured
            properly.
          </Text>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
  commonTextStyle: {
    marginTop: hp(20),
    color: Colors.white,
  },
  addContainer: {
    marginTop: hp(40),
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default MasterRecoveryKey;
