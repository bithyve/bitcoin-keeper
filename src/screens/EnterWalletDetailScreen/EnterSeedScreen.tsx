import { Box, Image, Pressable, Text, View, Input, ScrollView } from 'native-base';
import React, { useContext, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import SeedWordsView from 'src/components/SeedWordsView';
import { LocalizationContext } from 'src/common/content/LocContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import LinearGradient from 'react-native-linear-gradient';
import KeeperModal from 'src/components/KeeperModal';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import BTC from 'src/assets/images/btc_white.svg';
import Illustration from 'src/assets/images/illustration.svg';

const EnterSeedScreen = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const seed = translations['seed'];
  const [firstValue, setFirstValue] = useState('');
  const [secondValue, setSecondValue] = useState('');
  const [thirdValue, setThirdValue] = useState('');
  const [fourthValue, setFourthValue] = useState('');
  const [fifthValue, setFifthValue] = useState('');
  const [sixthValue, setSixthValue] = useState('');
  const [seventhValue, setSeventhValue] = useState('');
  const [eightValue, setEightValue] = useState('');
  const [ninthValue, setNinthValue] = useState('');
  const [tenthValue, setTenthValue] = useState('');
  const [eleventhValue, setElevnthValue] = useState('');
  const [twelvthValue, setTwelthValue] = useState('');

  const [visible, setVisible] = useState(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const close = () => setVisible(false);
  const open = () => setVisible(true);
  const openModalLoader = () => setCreateCloudBackupModal(true);
  const openModalFlow = () => setOpenModal(true);
  const closeRecovery = () => setOpenModal(false);

  const navigateToHardwareSetup = () => {
    close();
  };

  const onPressNext = () => {
    if (firstValue === '') {
      open();
    } else {
      const seedWord =
        firstValue +
        ' ' +
        secondValue +
        ' ' +
        thirdValue +
        ' ' +
        fourthValue +
        ' ' +
        fifthValue +
        ' ' +
        sixthValue +
        ' ' +
        seventhValue +
        ' ' +
        eightValue +
        ' ' +
        ninthValue +
        ' ' +
        tenthValue +
        ' ' +
        eleventhValue +
        ' ' +
        twelvthValue;
      console.log(seedWord);
      openModalLoader();
      // openModalFlow();
    }
  };

  const handleChangeFirst = (text) => {
    setFirstValue(text);
  };
  const handleChangeSecond = (text) => {
    setSecondValue(text);
  };
  const handleChangeThird = (text) => {
    setThirdValue(text);
  };
  const handleChangeFourth = (text) => {
    setFourthValue(text);
  };
  const handleChangeFifth = (text) => {
    setFifthValue(text);
  };
  const handleChangeSixth = (text) => {
    setSixthValue(text);
  };
  const handleChangeSeventh = (text) => {
    setSeventhValue(text);
  };
  const handleChangeEighth = (text) => {
    setEightValue(text);
  };
  const handleChangeNinth = (text) => {
    setNinthValue(text);
  };
  const handleChangeTenth = (text) => {
    setTenthValue(text);
  };
  const handleChangeEleventh = (text) => {
    setElevnthValue(text);
  };
  const handleChangeTwelvth = (text) => {
    setTwelthValue(text);
  };

  const passwordScreen = () => {
    setOpenModal(false);
  };

  const RecoverWalletScreen = () => {
    return (
      <View>
        <Illustration />
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'200'}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, iqua'}
        </Text>
      </View>
    );
  };

  const InValidSeedsScreen = () => {
    return (
      <View>
        <Box alignSelf={'center'}>
          <InvalidSeeds />
        </Box>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'
          }
        </Text>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.container}
      >
        <ScrollView marginTop={10}>
          <StatusBarComponent />
          <Box marginX={10}>
            <SeedWordsView
              title={seed.EnterSeed}
              subtitle={seed.recoverWallet}
              onPressHandler={() => navigation.navigate('NewKeeperApp')}
            />
          </Box>
          <View flexDirection={'row'} marginY={10} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>01 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 1st word'}
                w="62%"
                height={'10'}
                value={firstValue}
                onChangeText={handleChangeFirst}
              />
            </Box>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>02 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 2nd word'}
                w="62%"
                height={'10'}
                value={secondValue}
                onChangeText={handleChangeSecond}
              />
            </Box>
          </View>
          <View flexDirection={'row'} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>03 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 3rd word'}
                w="62%"
                height={'10'}
                value={thirdValue}
                onChangeText={handleChangeThird}
              />
            </Box>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>04 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 4th word'}
                w="62%"
                height={'10'}
                value={fourthValue}
                onChangeText={handleChangeFourth}
              />
            </Box>
          </View>
          <View flexDirection={'row'} marginY={10} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>05 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 5th word'}
                w="62%"
                height={'10'}
                value={fifthValue}
                onChangeText={handleChangeFifth}
              />
            </Box>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>06 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 6th word'}
                w="62%"
                height={'10'}
                value={sixthValue}
                onChangeText={handleChangeSixth}
              />
            </Box>
          </View>
          <View flexDirection={'row'} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>07 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 7th word'}
                w="62%"
                height={'10'}
                value={seventhValue}
                onChangeText={handleChangeSeventh}
              />
            </Box>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>08 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 8th word'}
                w="62%"
                height={'10'}
                value={eightValue}
                onChangeText={handleChangeEighth}
              />
            </Box>
          </View>
          <View flexDirection={'row'} marginY={10} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>09 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 9th word'}
                w="62%"
                height={'10'}
                value={ninthValue}
                onChangeText={handleChangeNinth}
              />
            </Box>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>10 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 10th word'}
                w="62%"
                height={'10'}
                value={tenthValue}
                onChangeText={handleChangeTenth}
              />
            </Box>
          </View>
          <View flexDirection={'row'} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>11 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 11th word'}
                w="62%"
                height={'10'}
                value={eleventhValue}
                onChangeText={handleChangeEleventh}
              />
            </Box>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>12 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 12th word'}
                w="62%"
                height={'10'}
                value={twelvthValue}
                onChangeText={handleChangeTwelvth}
              />
            </Box>
          </View>
          <Text color={'#4F5955'} marginX={10} marginY={10} fontSize={12}>
            {seed.seedDescription}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Box bg={'transparent'} flexDirection={'row'} marginLeft={10} marginTop={4}>
              <View style={styles.dot}></View>
              <View style={styles.dash}></View>
            </Box>
            <Box bg={'transparent'} flexDirection={'row'} marginRight={10}>
              <TouchableOpacity>
                <Text
                  fontSize={13}
                  fontFamily={'body'}
                  fontWeight={'300'}
                  letterSpacing={1}
                  marginTop={2}
                  //   color={buttonCancelColor}
                  marginRight={5}
                >
                  Need Help?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressNext}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={['#00836A', '#073E39']}
                  style={styles.cta}
                >
                  <Text
                    fontSize={13}
                    fontFamily={'body'}
                    fontWeight={'300'}
                    letterSpacing={1}
                    color={'white'}
                  >
                    Next
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
            <KeeperModal
              visible={visible}
              close={close}
              title={seed.InvalidSeeds}
              subTitle={seed.seedDescription}
              modalBackground={['#F7F2EC', '#F7F2EC']}
              buttonBackground={['#00836A', '#073E39']}
              buttonText={'Retry'}
              buttonTextColor={'#FAFAFA'}
              buttonCallback={navigateToHardwareSetup}
              textColor={'#041513'}
              Content={InValidSeedsScreen}
            />
            <KeeperModal
              visible={openModal}
              close={closeRecovery}
              title={'Wallet Recovery Successful'}
              subTitle={seed.seedDescription}
              modalBackground={['#F7F2EC', '#F7F2EC']}
              buttonBackground={['#00836A', '#073E39']}
              buttonText={'View Wallet'}
              buttonTextColor={'#FAFAFA'}
              buttonCallback={passwordScreen}
              textColor={'#041513'}
              Content={RecoverWalletScreen}
            />
            <ModalWrapper
              visible={createCloudBackupModal}
              onSwipeComplete={() => setCreateCloudBackupModal(false)}
            >
              <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
            </ModalWrapper>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  dot: {
    backgroundColor: '#A7A7A7',
    width: 6,
    height: 4,
    marginRight: 6,
  },
  dash: {
    backgroundColor: '#676767',
    width: 26,
    height: 4,
  },
  inputcontainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  numbers: {
    fontSize: 16,
    color: '#00836A',
    fontWeight: 'bold',
    marginTop: 8,
  },
  ctabutton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
});

export default EnterSeedScreen;
