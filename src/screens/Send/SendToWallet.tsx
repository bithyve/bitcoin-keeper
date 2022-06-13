import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { Box, Input, InputGroup, InputLeftAddon, Pressable, Text } from 'native-base';
import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import React from 'react';

const SendToWallet = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.Container}>
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Pressable onPress={() => navigation.goBack()} mx={5} my={10}>
        <BackIcon />
      </Pressable>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)}>Sending to Wallet</Text>
          <Text fontSize={RFValue(12)}>Lorem ipsum dolor sit amet </Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <CurrencyTypeSwitch />
        </Box>
        <Box>
          {/* <InputGroup variant="outline">
            <InputLeftAddon children={'$'} /> */}
          <Input placeholder="Enter Amount" size="md" />
          {/* </InputGroup> */}
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SendToWallet;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
  },
});
