import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';

function CanaryWallets({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Canary Wallets</Text>
        <Text style={styles.description}>Alert on key compromise</Text>
        <Text style={styles.commonTextStyle}>
          Each key used in a multi-key wallet can also be used as a single-key wallet itself.
          Keeping funds in these wallets act as Canary.
        </Text>

        <Box style={styles.circleStyle}>
          <CanaryIcon />
        </Box>
        <Text style={styles.commonTextStyle}>
          If someone gets access to one of the keys and finds funds in the single-key wallet they
          may try to withdraw those funds. This will be detected by the app and the user will be
          advised to change that key from any multi-key setup.
        </Text>
        <Box mt={5}>
          <DashedButton
            description="Lorem ipsum dolor amet"
            callback={() => {}}
            name="Manage Keys"
          />
        </Box>
        <Text style={styles.commonTextStyle}>
          These wallets can be accessed and funded from the Settings of any key
        </Text>
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
    // textAlign: 'center',
    marginTop: hp(40),
    color: Colors.white,
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default CanaryWallets;
