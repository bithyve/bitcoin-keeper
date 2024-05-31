import Text from 'src/components/KeeperText';
import { Box, View, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import {
  Platform,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import * as bip39 from 'bip39';

import StatusBarComponent from 'src/components/StatusBarComponent';
import SeedWordsView from 'src/components/SeedWordsView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
import Illustration from 'src/assets/images/illustration.svg';
import { getPlaceholder } from 'src/utils/utilities';

function InputSeedWordSigner({ route }: { route: any }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;
  const { common } = translations;
  const { onSuccess, xfp } = route.params;
  const [seedData, setSeedData] = useState([
    {
      id: 1,
      name: '',
      invalid: false,
    },
    {
      id: 2,
      name: '',
      invalid: false,
    },
    {
      id: 3,
      name: '',
      invalid: false,
    },
    {
      id: 4,
      name: '',
      invalid: false,
    },
    {
      id: 5,
      name: '',
      invalid: false,
    },
    {
      id: 6,
      name: '',
      invalid: false,
    },
    {
      id: 7,
      name: '',
      invalid: false,
    },
    {
      id: 8,
      name: '',
      invalid: false,
    },
    {
      id: 9,
      name: '',
      invalid: false,
    },
    {
      id: 10,
      name: '',
      invalid: false,
    },
    {
      id: 11,
      name: '',
      invalid: false,
    },
    {
      id: 12,
      name: '',
      invalid: false,
    },
  ]);

  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [walletRecoverySuccessModal, setWalletRecoverySuccessModal] = useState(false);

  const closeInvalidSeedsModal = () => setInvalidSeedsModal(false);

  const closeRecovery = () => setWalletRecoverySuccessModal(false);

  const closeWalletSuccessModal = () => {
    setWalletRecoverySuccessModal(false);
  };

  const getSeedWord = () => {
    let seedWord = '';
    for (let i = 0; i < 12; i++) {
      seedWord += `${seedData[i].name} `;
    }
    return seedWord.trim();
  };

  const onPressNext = async () => {
    const mnemonic = getSeedWord();
    if (bip39.validateMnemonic(mnemonic)) {
      onSuccess({ xfp, seedBasedSingerMnemonic: mnemonic });
      navigation.goBack();
    } else Alert.alert('Invalid Mnemonic');
  };

  function RecoverWalletScreen() {
    return (
      <View>
        <Illustration />
        <Text color={`${colorMode}.greenText`} fontSize={13}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, iqua
        </Text>
      </View>
    );
  }

  function InValidSeedsScreen() {
    return (
      <View>
        <Box alignSelf="center">
          <InvalidSeeds />
        </Box>
        <Text color={`${colorMode}.greenText`} fontSize={13} padding={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit
        </Text>
      </View>
    );
  }

  const getFormattedNumber = (number) => {
    if (number < 9) return `0${number + 1}`;
    return number + 1;
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
              onPressHandler={() => {
                navigation.goBack();
              }}
            />
          </Box>
          <View>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={seedData}
              extraData={seedData}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              contentContainerStyle={{
                marginStart: 15,
              }}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    marginHorizontal: 20,
                    marginVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      width: 22,
                      fontSize: 16,
                      color: '#00836A',
                      marginTop: 8,
                    }}
                    bold
                  >
                    {getFormattedNumber(index)}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      item.invalid
                        ? {
                            borderColor: '#F58E6F',
                          }
                        : { borderColor: '#FDF7F0' },
                    ]}
                    placeholder={`enter ${getPlaceholder(index)} word`}
                    value={item?.name}
                    textContentType="none"
                    returnKeyType="next"
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType={Platform.OS === 'android' ? 'visible-password' : 'name-phone-pad'}
                    onChangeText={(text) => {
                      const data = [...seedData];
                      data[index].name = text.trim();
                      if (bip39.wordlists.english.includes(text.trim())) {
                        data[index].invalid = false;
                      }
                      setSeedData(data);
                    }}
                    onBlur={() => {
                      const inputValue = seedData[index].name.trim();
                      if (inputValue && !bip39.wordlists.english.includes(inputValue)) {
                        const data = [...seedData];
                        data[index].invalid = true;
                        setSeedData(data);
                      }
                    }}
                  />
                </View>
              )}
            />
          </View>
          <Text color={`${colorMode}.GreyText`} marginX={10} marginY={10} fontSize={12}>
            {seed.seedDescription}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Box backgroundColor="transparent" flexDirection="row" marginLeft={10} marginTop={4}>
              <View style={styles.dot} />
              <View style={styles.dash} />
            </Box>
            <Box backgroundColor="transparent" flexDirection="row" marginRight={10}>
              <TouchableOpacity>
                <Text
                  fontSize={13}
                  bold
                  letterSpacing={1}
                  marginTop={2}
                  //   color={buttonCancelColor}
                  marginRight={5}
                >
                  {common.needHelp}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressNext} disabled={false}>
                <Box style={styles.cta} backgroundColor={`${colorMode}.greenButtonBackground`}>
                  <Text fontSize={13} bold letterSpacing={1} color="white">
                    {common.next}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
            <KeeperModal
              visible={invalidSeedsModal}
              close={closeInvalidSeedsModal}
              title={seed.InvalidSeeds}
              subTitle={seed.seedDescription}
              buttonText="Retry"
              buttonTextColor={`${colorMode}.white`}
              buttonCallback={closeInvalidSeedsModal}
              textColor={`${colorMode}.primaryText`}
              Content={InValidSeedsScreen}
            />
            <KeeperModal
              visible={walletRecoverySuccessModal}
              close={closeRecovery}
              title={seed.walletRecoverySuccessful}
              subTitle={seed.seedDescription}
              buttonText="View Wallet"
              buttonTextColor={`${colorMode}.white`}
              buttonCallback={closeWalletSuccessModal}
              textColor={`${colorMode}.primaryText`}
              Content={RecoverWalletScreen}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
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
  ctabutton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#FDF7F0',
    shadowOpacity: 0.4,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 6,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 10 },
    borderRadius: 10,
    fontSize: 12,
    height: 35,
    width: 110,
    marginLeft: 10,
    borderWidth: 1,
    paddingHorizontal: 5,
  },
});

export default InputSeedWordSigner;
