import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';

function InheritanceKey({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Inheritance Key</Text>
        <Text style={styles.description}>Set up an additional key</Text>
        <Text style={styles.commonTextStyle}>
          Inheritance Key is an additional key available to increase the security of the vault
          without having to buy a hardware signer. It is available to all Diamond Hands subscribers.
        </Text>
        <Text style={styles.commonTextStyle}>
          When a request is made to use this key for signing or recovery, there is a 15 day delay.
          This gives time to the user to decline the request if they don’t identify it. The request
          alerts are sent on the app and can also be sent on email or via. sms.
        </Text>
        <Box mt={20} alignItems={'center'}>
          <DashedButton
            description="Lorem ipsum dolor amet"
            callback={() => {}}
            name="Add inheritance key"
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            Inheritance Key can be added when creating any vault or after creating one.
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
  addContainer: {
    marginTop: hp(40),
    gap: 10,
    alignItems: 'center',
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
});

export default InheritanceKey;
