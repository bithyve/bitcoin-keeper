import { StyleSheet, StatusBar } from 'react-native';
import { Box, Input, InputGroup, Pressable, Stack, Text, Icon } from 'native-base';
import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import IconDoller from 'src/assets/icons/Wallets/icon_dollar.svg';
import WalletIcon from 'src/assets/icons/icon_wallet.svg';
import CustomButton from 'src/components/CustomButton/CustomButton';

const onPressNumber = () => {
  console.log('Number pressed');
};

const SendToWallet = ({ navigation }) => {
  return (
    <Box style={styles.Container}>
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Pressable onPress={() => navigation.goBack()} mx={8} my={12}>
        <BackIcon />
      </Pressable>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)}>Sending to Wallet</Text>
          <Text fontSize={RFValue(12)}>Lorem ipsum dolor sit amet</Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box flexDirection={'row'} mt={wp('10%')} style={styles.walletDetails}>
        <Box mt={hp('1%')} ml={wp('10%')}>
          <WalletIcon />
        </Box>
        <Text fontSize={RFValue(18)} ml={hp('3%')}>
          Maldives Funds
        </Text>
        <Text ml={wp('20%')} mt={hp('1%')}>
          Icon
        </Text>
      </Box>
      <Stack style={styles.inputContainer} space={4}>
        <InputGroup>
          <Input
            InputLeftElement={
              <Icon
                as={<IconDoller styles={{ marginLeft: '5%' }} />}
                size={5}
                ml="2"
                color={'#BDB7B1'}
              />
            }
            placeholder="|  Enter Amount"
            placeholderTextColor={'#073E39'}
            size="xl"
            width="100%"
          />
        </InputGroup>
        <Input placeholder="Add Note" placeholderTextColor={'#073E39'} size="xl" />
      </Stack>
      <Box style={styles.actionButtons}>
        <Pressable onPress={() => console.log('Cancel Pressed')}>
          <Text mt={'12%'} mr={'10%'} color={'#073E39'} fontSize={RFValue(15)}>
            Cancel
          </Text>
        </Pressable>
        {/* <Pressable>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#00836A', '#073E39']}
          />
          <Text>Send</Text>
        </Pressable> */}
        <CustomButton
          value={'Send'}
          color={'#FAFAFA'}
          onPress={() => console.log('Send Pressed')}
        />
      </Box>
      <Box style={styles.keypadView}>
        <KeyPadView onPressNumber={onPressNumber} />
      </Box>
    </Box>
  );
};

//

export default SendToWallet;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
  },
  inputContainer: {
    width: wp('75%'),
    marginLeft: wp('10%'),
    marginTop: hp('7%'),
    alignItems: 'baseline',
  },
  keypadView: {
    marginTop: hp('5%'),
    // backgroundColor: '#073E39',
  },
  walletDetails: {
    // justifyContent: 'space-evenly',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp('5%'),
    marginRight: hp('5%'),
    alignContent: 'space-between',
  },
});
