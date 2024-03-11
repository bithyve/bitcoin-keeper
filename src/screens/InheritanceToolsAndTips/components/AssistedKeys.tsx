import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import AssistedKeysIcon from 'src/assets/images/assisted-key.svg';
import DashedButton from 'src/components/DashedButton';
function AssistedKeys({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Assisted Keys</Text>
        <Text style={styles.description}>Server hosted signers</Text>
        <Text style={styles.commonTextStyle}>
          Keeper offers two Assisted Keys Signing Server: allows an automated script to sign the txn
          when correct 2FA code is provided. You can also setup a spending policy
        </Text>
        <Box style={styles.circleStyle}>
          <AssistedKeysIcon />
        </Box>
        <Text style={styles.commonTextStyle}>
          Inheritance Key: signs a txn after a delay of 15 days during which the user can cancel the
          request
        </Text>

        <Box mt={5} alignItems={'center'}>
          <DashedButton
            description="Lorem ipsum dolor amet"
            callback={() => {}}
            name="Add Assisted Keys"
          />
        </Box>
        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            These keys can be added from the Manage Keys section on the Home Screen
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
    marginTop: hp(40),
    color: Colors.white,
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
  addCardStyle: {
    marginTop: hp(20),
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
  notes: { alignItems: 'flex-start' },
});

export default AssistedKeys;
