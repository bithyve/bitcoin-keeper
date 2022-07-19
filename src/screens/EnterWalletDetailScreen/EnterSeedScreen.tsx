import { Box, Image, Pressable, Text, View, Input } from 'native-base';
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
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
const EnterSeedScreen = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const seed = translations['seed'];
  const [firstValue, setFirstValue] = useState('');
  const [secondValue, setSecondValue] = useState('');
  const [thirdValue, setThirdValue] = useState('');
  const [fourthValue, setFourthValue] = useState('');
  const [fifthValue, setFifthValue] = useState('');
  const [sixthValue, setSixthValue] = useState('');

  const [visible, setVisible] = useState(false);

  const close = () => setVisible(false);
  const open = () => setVisible(true);

  const navigateToHardwareSetup = () => {
    close();
  };

  const onPressNext = () => {
    console.log(JSON.stringify(firstValue));
    if (firstValue === '') {
      open();
    } else {
      navigation.navigate('NewHome');
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
        <SafeAreaView>
          <StatusBarComponent />
          <Box marginX={10}>
            <SeedWordsView
              title={seed.EnterSeed}
              subtitle={seed.recoverWallet}
              onPressHandler={() => navigation.navigate('NewHome')}
            />
          </Box>
          <View flexDirection={'row'} marginY={10} marginLeft={10} marginRight={20}>
            <Box style={styles.inputcontainer}>
              <Text style={styles.numbers}>01 </Text>
              <Input
                placeholderTextColor={'grey'}
                backgroundColor={'#FDF7F0'}
                placeholder={'enter 1st word'}
                w="60%"
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
                w="60%"
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
                w="60%"
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
                w="60%"
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
                w="60%"
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
                w="60%"
                height={'10'}
                value={sixthValue}
                onChangeText={handleChangeSixth}
              />
            </Box>
          </View>
          <Text color={'#4F5955'} marginX={10} fontSize={12}>
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
          </View>
        </SafeAreaView>
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
});

export default EnterSeedScreen;
