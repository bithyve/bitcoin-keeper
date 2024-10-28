import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import {
  Box,
  Input,
  InputGroup,
  Pressable,
  Stack,
  Icon,
  StatusBar,
  useColorMode,
} from 'native-base';
import BackIcon from 'src/assets/images/back.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import IconDoller from 'src/assets/images/icon_dollar.svg';
import WalletIcon from 'src/assets/images/icon_wallet.svg';
import CustomButton from 'src/components/CustomButton/CustomButton';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const onPressNumber = () => {
  console.log('Number pressed');
};

const onDeletePressed = () => {
  console.log('Delete Pressed');
};

function SendToWallet({ navigation }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.Container} backgroundColor={`${colorMode}.secondaryBackground`}>
      <StatusBar barStyle="dark-content" />
      <Pressable onPress={() => navigation.goBack()} mx={8} my={12}>
        <BackIcon />
      </Pressable>
      <Box ml={10} mb={5} flexDirection="row" width="100%" alignItems="center">
        <Box width="60%">
          <Text fontSize={20}>Sending to Wallet</Text>
          <Text fontSize={12}>Lorem ipsum dolor sit amet</Text>
        </Box>
        <Box alignItems="center" justifyContent="center" width="30%">
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <Box flexDirection="row" mt={wp('10%')} style={styles.walletDetails}>
        <Box mt={hp('1%')} ml={wp('10%')}>
          <WalletIcon />
        </Box>
        <Text fontSize={18} ml={hp('3%')}>
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
                color="#BDB7B1"
              />
            }
            placeholder="|  Enter Amount"
            placeholderTextColor={`${colorMode}.greenText`}
            size="xl"
            width="100%"
            _input={
              colorMode === 'dark' && {
                selectionColor: Colors.SecondaryWhite,
                cursorColor: Colors.SecondaryWhite,
              }
            }
          />
        </InputGroup>
        <Input placeholder="Add Note" placeholderTextColor={`${colorMode}.greenText`} size="xl" />
      </Stack>
      <Box style={styles.actionButtons}>
        <Pressable onPress={() => console.log('Cancel Pressed')}>
          <Text mt="12%" mr="10%" color={`${colorMode}.greenText`} fontSize={15}>
            Cancel
          </Text>
        </Pressable>
        <CustomButton
          value="Send"
          color={`${colorMode}.white`}
          onPress={() => console.log('Send Pressed')}
        />
      </Box>
      <Box style={styles.keypadView}>
        <KeyPadView
          onDeletePressed={onDeletePressed}
          onPressNumber={onPressNumber}
          keyColor={`${colorMode}.primaryText`}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    </Box>
  );
}

//

export default SendToWallet;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
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
