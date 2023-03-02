/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-no-bind */
import * as bip39 from 'bip39';

import { Box, ScrollView, View } from 'native-base';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import SuccessSvg from 'src/assets/images/successSvg.svg';
import Buttons from 'src/components/Buttons';
import Fonts from 'src/common/Fonts';
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { ScaledSheet } from 'react-native-size-matters';
import SeedWordsView from 'src/components/SeedWordsView';
import StatusBarComponent from 'src/components/StatusBarComponent';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getAppImage } from 'src/store/sagaActions/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { getPlaceholder } from 'src/common/utilities';
import config from 'src/core/config';
import { generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { captureError } from 'src/core/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';

function EnterSeedScreen({ route }) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;

  const { isSoftKeyRecovery = false, type } = route.params || {};
  const { appImageRecoverd, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );
  const { appId } = useAppSelector((state) => state.storage);

  const ref = useRef<FlatList>(null);
  const [activePage, setActivePage] = useState(0);
  const [seedData, setSeedData] = useState([
    {
      id: 1,
      name: '',
      invalid: true,
    },
    {
      id: 2,
      name: '',
      invalid: true,
    },
    {
      id: 3,
      name: '',
      invalid: true,
    },
    {
      id: 4,
      name: '',
      invalid: true,
    },
    {
      id: 5,
      name: '',
      invalid: true,
    },
    {
      id: 6,
      name: '',
      invalid: true,
    },
    {
      id: 7,
      name: '',
      invalid: true,
    },
    {
      id: 8,
      name: '',
      invalid: true,
    },
    {
      id: 9,
      name: '',
      invalid: true,
    },
    {
      id: 10,
      name: '',
      invalid: true,
    },
    {
      id: 11,
      name: '',
      invalid: true,
    },
    {
      id: 12,
      name: '',
      invalid: true,
    },
  ]);
  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [recoverySuccessModal, setRecoverySuccessModal] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [onChangeIndex, setOnChangeIndex] = useState(-1);

  const openInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    setInvalidSeedsModal(true);
  };
  const closeInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    setInvalidSeedsModal(false);
  };

  const { showToast } = useToastMessage();

  const dispatch = useDispatch();

  useEffect(() => {
    if (appImageError) openInvalidSeedsModal();
  }, [appRecoveryLoading, appImageError, appImageRecoverd]);

  useEffect(() => {
    if (appId && recoveryLoading) {
      setRecoveryLoading(false);
      setRecoverySuccessModal(true);
      navigation.navigate('App', { screen: 'NewHome' });
    }
  }, [appId]);

  const isSeedFilled = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (seedData[i].invalid) {
        return false;
      }
    }
    return true;
  };

  const getSeedWord = () => {
    let seedWord = '';
    for (let i = 0; i < 12; i++) {
      seedWord += `${seedData[i].name} `;
    }
    return seedWord.trim();
  };

  const setupSeedWordsBasedKey = (mnemonic) => {
    try {
      const networkType = config.NETWORK_TYPE;
      const { xpub, derivationPath, masterFingerprint } = generateSeedWordsKey(
        mnemonic,
        networkType
      );
      const softSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp: masterFingerprint,
        signerType: SignerType.SEED_WORDS,
        storageType: SignerStorage.WARM,
        isMultisig: true,
      });
      dispatch(setSigningDevices(softSigner));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const onPressNextSoftReocvery = () => {
    if (isSeedFilled(6)) {
      if (isSeedFilled(12)) {
        const seedWord = getSeedWord();
        if (type === SignerType.SEED_WORDS) {
          setupSeedWordsBasedKey(seedWord);
        } else if (type === SignerType.MOBILE_KEY) {
          Alert.alert('Warning', 'Entire app will be restored', [
            {
              text: 'OK',
              onPress: () => {
                setRecoveryLoading(true);
                dispatch(getAppImage(seedWord));
              },
            },
          ]);
        }
      } else {
        ref.current.scrollToIndex({ index: 5, animated: true });
      }
    } else {
      showToast('Enter correct seedwords', <ToastErrorIcon />);
    }
  };

  const onPressNextSeedReocvery = async () => {
    if (isSeedFilled(6)) {
      if (isSeedFilled(12)) {
        const seedWord = getSeedWord();
        setRecoveryLoading(true);
        dispatch(getAppImage(seedWord));
      } else {
        ref.current.scrollToIndex({ index: 5, animated: true });
      }
    } else {
      showToast('Enter correct seedwords', <ToastErrorIcon />);
    }
  };

  function InValidSeedsScreen() {
    return (
      <View>
        <Box alignSelf="center">
          <InvalidSeeds />
        </Box>
        <Text color="light.greenText" fontSize={13} padding={2}>
          Make sure the words are entered in the correct sequence
        </Text>
      </View>
    );
  }

  function SuccessModalContent() {
    return (
      <View>
        <Box alignSelf="center">
          <SuccessSvg />
        </Box>
        <Text color="light.greenText" fontSize={13} padding={2}>
          The BIP-85 wallets and vault in the app are recovered.
        </Text>
      </View>
    );
  }

  const getFormattedNumber = (number) => {
    if (number < 9) return `0${number + 1}`;
    return number + 1;
  };

  const scrollHandler = (event) => {
    const newScrollOffset = event.nativeEvent.contentOffset.y;
    if (newScrollOffset > 90) {
      setActivePage(1);
    } else {
      setActivePage(0);
    }
  };
  const getSuggestedWords = (text) => {
    const filteredData = bip39.wordlists.english.filter((data) =>
      data.toLowerCase().startsWith(text)
    );
    setSuggestedWords(filteredData);
  };
  const getPosition = (index: number) => {
    switch (index) {
      case 0:
      case 1:
        return 1;

      case 2:
      case 3:
        return 2;

      case 4:
      case 5:
        return 3;

      default:
        return 1;
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.container}
      >
        <StatusBarComponent />
        <Box marginX={10} mt={25}>
          {isSoftKeyRecovery ? (
            <SeedWordsView
              title="Enter Seed Words"
              onPressHandler={() => navigation.navigate('LoginStack', { screen: 'SignersList' })}
            />
          ) : (
            <SeedWordsView
              title={seed?.enterRecoveryPhrase}
              subtitle={seed.recoverWallet}
              onPressHandler={() =>
                navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })
              }
            />
          )}
        </Box>
        <View>
          <FlatList
            ref={ref}
            keyExtractor={(index) => index.toString()}
            data={seedData}
            extraData={seedData}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            contentContainerStyle={{
              marginHorizontal: 15,
            }}
            style={{
              flexGrow: 0,
              height: 190,
            }}
            pagingEnabled
            scrollEnabled={isSeedFilled(6)}
            onScroll={(event) => scrollHandler(event)}
            renderItem={({ item, index }) => (
              <View style={styles.inputListWrapper}>
                <Text style={styles.indexText} bold>
                  {getFormattedNumber(index)}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    item.invalid && item.name != ''
                      ? {
                        borderColor: '#F58E6F',
                      }
                      : { borderColor: '#FDF7F0' },
                  ]}
                  placeholder={`Enter ${getPlaceholder(index)} word`}
                  placeholderTextColor="rgba(7,62,57,0.6)"
                  value={item?.name}
                  textContentType="none"
                  returnKeyType="next"
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType={Platform.OS === 'android' ? 'visible-password' : 'name-phone-pad'}
                  onChangeText={(text) => {
                    const data = [...seedData];
                    data[index].name = text.trim();
                    setSeedData(data);
                    if (text.length > 1) {
                      setOnChangeIndex(index);
                      getSuggestedWords(text.toLowerCase());
                    } else {
                      setSuggestedWords([]);
                    }
                  }}
                  onBlur={() => {
                    if (!bip39.wordlists.english.includes(seedData[index].name)) {
                      const data = [...seedData];
                      data[index].invalid = true;
                      setSeedData(data);
                    }
                  }}
                  onFocus={() => {
                    const data = [...seedData];
                    data[index].invalid = false;
                    setSeedData(data);
                    setSuggestedWords([]);
                    setOnChangeIndex(index);
                  }}
                  onSubmitEditing={() => {
                    setSuggestedWords([]);
                  }}
                />
              </View>
            )}
          />
          {suggestedWords?.length > 0 ? (
            <ScrollView
              style={[
                styles.suggestionScrollView,
                {
                  marginTop: getPosition(onChangeIndex) * hp(55),
                  height: onChangeIndex === 4 || onChangeIndex === 5 ? hp(90) : null,
                },
              ]}
              nestedScrollEnabled
            >
              <View style={styles.suggestionWrapper}>
                {suggestedWords.map((word, wordIndex) => (
                  <TouchableOpacity
                    key={wordIndex}
                    style={styles.suggestionTouchView}
                    onPress={() => {
                      Keyboard.dismiss();
                      const data = [...seedData];
                      data[onChangeIndex].name = word.trim();
                      setSeedData(data);
                      setSuggestedWords([]);
                    }}
                  >
                    <Text style={styles.suggestionWord}>{word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </View>
        <View style={styles.bottomContainerView}>
          <Text style={styles.seedDescText} color="light.GreyText">
            {seed.seedDescription}
          </Text>
          <View style={styles.bottomBtnsWrapper}>
            <Box style={styles.bottomBtnsWrapper02}>
              <View style={activePage === 0 ? styles.dash : styles.dot} />
              <View style={activePage === 1 ? styles.dash : styles.dot} />
            </Box>

            {isSoftKeyRecovery ? (
              <Buttons
                primaryCallback={onPressNextSoftReocvery}
                primaryText="Next"
                primaryLoading={recoveryLoading}
              />
            ) : (
              <Buttons
                primaryCallback={onPressNextSeedReocvery}
                primaryText="Next"
                secondaryCallback={() => {
                  navigation.navigate('LoginStack', { screen: 'OtherRecoveryMethods' });
                }}
                secondaryText="Other Methods"
                primaryLoading={recoveryLoading}
              />
            )}
          </View>
        </View>
        <KeeperModal
          visible={invalidSeedsModal}
          close={closeInvalidSeedsModal}
          title={seed.InvalidSeeds}
          subTitle={seed.seedDescription}
          buttonText="Retry"
          buttonTextColor="light.white"
          buttonCallback={closeInvalidSeedsModal}
          textColor="light.primaryText"
          Content={InValidSeedsScreen}
        />
        <KeeperModal
          visible={recoverySuccessModal}
          title="App Recovered"
          subTitle="Your Keeper App has successfully been recovered"
          buttonText="Ok"
          Content={SuccessModalContent}
          close={() => { }}
          showCloseIcon={false}
          buttonCallback={() => {
            setRecoverySuccessModal(false);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    marginHorizontal: 6,
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
    backgroundColor: 'rgba(247,242,236,1)',
    color: '#073E39',
    shadowOpacity: 0.4,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 6,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 10 },
    borderRadius: 10,
    fontSize: 11,
    height: 40,
    width: 120,
    marginLeft: 10,
    borderWidth: 1,
    paddingHorizontal: 5,
    fontFamily: Fonts.RobotoCondensedRegular,
    letterSpacing: 1.32,
    zIndex: 1,
  },
  inputListWrapper: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  indexText: {
    width: 22,
    fontSize: 16,
    color: '#00836A',
    marginTop: 8,
    letterSpacing: 1.23,
  },
  seedDescText: {
    fontWeight: '400',
    marginHorizontal: 30,
    marginVertical: hp(10),
    fontSize: 12,
    letterSpacing: 0.6,
  },
  bottomBtnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(375),
    alignItems: 'center',
    paddingHorizontal: wp(20),
  },
  bottomBtnsWrapper02: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    marginLeft: 25,
    marginTop: 6,
  },
  bottomContainerView: {
    position: 'absolute',
    bottom: 20,
  },
  checkWrapper: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginVertical: 25,
    alignItems: 'center',
  },
  checkText: {
    fontSize: 16,
  },
  suggestionScrollView: {
    zIndex: 999,
    position: 'absolute',
    // top: 50,
    height: hp(150),
    width: wp(330),
    alignSelf: 'center',
  },
  suggestionWrapper: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  suggestionTouchView: {
    backgroundColor: '#f2c693',
    padding: 5,
    borderRadius: 5,
    margin: 5,
  },
  suggestionWord: {
    color: 'black',
  },
});

export default EnterSeedScreen;
