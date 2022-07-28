import { Box, Image, Pressable, Text, View, Input, ScrollView } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
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
import { useDispatch } from 'react-redux';
import { getAppImage } from 'src/store/sagaActions/bhr';
import { useAppSelector } from 'src/store/hooks';

const EnterSeedScreen = () => {
  const navigation = useNavigation();
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

  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const [walletRecoverySuccessModal, setWalletRecoverySuccessModal] = useState(false);

  const openInvalidSeedsModal = () => setInvalidSeedsModal(true);
  const closeInvalidSeedsModal = () => setInvalidSeedsModal(false);

  const openLoaderModal = () => setCreateCloudBackupModal(true);
  const closeLoaderModal = () => setCreateCloudBackupModal(false);

  const walletRecoverySuccess = () => setWalletRecoverySuccessModal(true);
  const closeRecovery = () => setWalletRecoverySuccessModal(false);

  const closeWalletSuccessModal = () => {
    setWalletRecoverySuccessModal(false);
  };

  const dispatch = useDispatch();
  const { appImageRecoverd, appRecreated, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );

  useEffect(() => {
    if (appImageError) openInvalidSeedsModal();

    if (appRecoveryLoading) {
      openLoaderModal();
    }
    if (appRecreated) {
      setTimeout(() => {
        closeLoaderModal();
        navigation.navigate('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appRecoveryLoading, appImageError]);

  const onPressNext = async () => {
    if (firstValue === '') {
      openInvalidSeedsModal();
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
      dispatch(getAppImage(seedWord));
      // dispatch(
      //   getAppImage('stereo clay oil subway satoshi muffin claw clever mandate treat clay farm')
      // );
    }
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
                onChangeText={(text) => setFirstValue(text)}
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
                onChangeText={(text) => setSecondValue(text)}
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
                onChangeText={(text) => setThirdValue(text)}
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
                onChangeText={(text) => setFourthValue(text)}
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
                onChangeText={(text) => setFifthValue(text)}
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
                onChangeText={(text) => setSixthValue(text)}
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
                onChangeText={(text) => setSeventhValue(text)}
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
                onChangeText={(text) => setEightValue(text)}
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
                onChangeText={(text) => setNinthValue(text)}
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
                onChangeText={(text) => setTenthValue(text)}
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
                onChangeText={(text) => setElevnthValue(text)}
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
                onChangeText={(text) => setTwelthValue(text)}
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
              visible={invalidSeedsModal}
              close={closeInvalidSeedsModal}
              title={seed.InvalidSeeds}
              subTitle={seed.seedDescription}
              modalBackground={['#F7F2EC', '#F7F2EC']}
              buttonBackground={['#00836A', '#073E39']}
              buttonText={'Retry'}
              buttonTextColor={'#FAFAFA'}
              buttonCallback={closeInvalidSeedsModal}
              textColor={'#041513'}
              Content={InValidSeedsScreen}
            />
            <KeeperModal
              visible={walletRecoverySuccessModal}
              close={closeRecovery}
              title={'Wallet Recovery Successful'}
              subTitle={seed.seedDescription}
              modalBackground={['#F7F2EC', '#F7F2EC']}
              buttonBackground={['#00836A', '#073E39']}
              buttonText={'View Wallet'}
              buttonTextColor={'#FAFAFA'}
              buttonCallback={closeWalletSuccessModal}
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
