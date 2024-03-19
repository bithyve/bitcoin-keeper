import * as bip39 from 'bip39';
import { Box, Input, Pressable, ScrollView, View, useColorMode } from 'native-base';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import SuccessSvg from 'src/assets/images/successSvg.svg';
import Buttons from 'src/components/Buttons';
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getAppImage, healthCheckSigner } from 'src/store/sagaActions/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { getPlaceholder } from 'src/utils/utilities';
import { SignerStorage, SignerType, XpubTypes } from 'src/services/wallets/enums';
import { generateSignerFromMetaData } from 'src/hardware';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import Breadcrumbs from 'src/components/Breadcrumbs';
import Dropdown from 'src/components/Dropdown';

const seedArray = [
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
  {
    id: 13,
    name: '',
    invalid: true,
  },
  {
    id: 14,
    name: '',
    invalid: true,
  },
  {
    id: 15,
    name: '',
    invalid: true,
  },
  {
    id: 16,
    name: '',
    invalid: true,
  },
  {
    id: 17,
    name: '',
    invalid: true,
  },
  {
    id: 18,
    name: '',
    invalid: true,
  },
  {
    id: 19,
    name: '',
    invalid: true,
  },
  {
    id: 20,
    name: '',
    invalid: true,
  },
  {
    id: 21,
    name: '',
    invalid: true,
  },
  {
    id: 22,
    name: '',
    invalid: true,
  },
  {
    id: 23,
    name: '',
    invalid: true,
  },
  {
    id: 24,
    name: '',
    invalid: true,
  },
];

function EnterSeedScreen({ route, navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;

  const {
    type,
    mode,
    signer,
    isMultisig,
    setupSeedWordsBasedSigner,
    mapUnknownSigner,
    isImport,
    importSeedCta,
  } = route.params || {};
  const { appImageRecoverd, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );
  const { appId } = useAppSelector((state) => state.storage);
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  const ref = useRef<FlatList>(null);
  const [activePage, setActivePage] = useState(0);
  const [seedData, setSeedData] = useState(seedArray);
  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [recoverySuccessModal, setRecoverySuccessModal] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [hcLoading, setHcLoading] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [onChangeIndex, setOnChangeIndex] = useState(-1);
  const [selectedNumberOfWords, setSelectedNumberOfWords] = useState('12 Seed Words');

  const options = ['12 Seed Words', '18 Seed Words', '24 Seed Words'];

  const inputRef = useRef([]);

  const isHealthCheck = mode === InteracationMode.HEALTH_CHECK;

  const openInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    setInvalidSeedsModal(true);
  };
  const closeInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    setInvalidSeedsModal(false);
  };

  useEffect(() => {
    if (appImageError) openInvalidSeedsModal();
  }, [appRecoveryLoading, appImageError, appImageRecoverd]);

  useEffect(() => {
    if (appId && recoveryLoading) {
      setRecoveryLoading(false);
      setRecoverySuccessModal(true);
      navigation.replace('App', { screen: 'Home' });
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
    const index =
      selectedNumberOfWords === '12 Seed Words'
        ? 12
        : selectedNumberOfWords === '18 Seed Words'
        ? 18
        : 24;
    for (let i = 0; i < index; i++) {
      seedWord += `${seedData[i].name} `;
    }
    return seedWord.trim();
  };

  const onPressNextSeedReocvery = async () => {
    if (isSeedFilled(6)) {
      if (isSeedFilled(12)) {
        const seedWord = getSeedWord();
        setRecoveryLoading(true);
        dispatch(getAppImage(seedWord));
      } else {
        setActivePage(1);
      }
    } else {
      showToast('Enter correct seedwords', <ToastErrorIcon />);
    }
  };

  const onPressImportNewKey = async () => {
    if (activePage === 3) {
      const seedWord = getSeedWord();
      importSeedCta(seedWord);
    }
    if (activePage === 2) {
      if (!(selectedNumberOfWords === '18 Seed Words')) {
        if (isSeedFilled(18)) setActivePage(3);
        else showToast('Enter correct seedwords', <ToastErrorIcon />);
      } else {
        const seedWord = getSeedWord();
        importSeedCta(seedWord);
      }
    }
    if (activePage === 1) {
      if (!(selectedNumberOfWords === '12 Seed Words')) {
        if (isSeedFilled(12)) setActivePage(2);
        else showToast('Enter correct seedwords', <ToastErrorIcon />);
      } else {
        const seedWord = getSeedWord();
        importSeedCta(seedWord);
      }
    }
    if (activePage === 0) {
      if (isSeedFilled(6)) setActivePage(1);
      else showToast('Enter correct seedwords', <ToastErrorIcon />);
    }
  };

  const onPressHealthCheck = async () => {
    setHcLoading(true);

    const handleSuccess = () => {
      dispatch(healthCheckSigner([signer]));
      showToast('Seed Key health check successfull', <TickIcon />);
      navigation.dispatch(CommonActions.goBack());
    };

    const handleFailure = () => {
      showToast('Health check failed');
    };

    try {
      if (isSeedFilled(6)) {
        if (isSeedFilled(12)) {
          let derivedSigner;
          const seedWord = getSeedWord();
          if (signer.type === SignerType.MY_KEEPER) {
            const details = await getCosignerDetails(
              seedWord,
              signer.extraData?.instanceNumber - 1
            );
            const hw = generateSignerFromMetaData({
              xpub: details.xpubDetails[XpubTypes.P2WSH].xpub,
              xpriv: details.xpubDetails[XpubTypes.P2WSH].xpriv,
              derivationPath: details.xpubDetails[XpubTypes.P2WSH].derivationPath,
              masterFingerprint: details.mfp,
              signerType: SignerType.MY_KEEPER,
              storageType: SignerStorage.WARM,
              isMultisig: true,
            });
            derivedSigner = hw.signer;
          } else {
            const { signer } = setupSeedWordsBasedSigner(seedWord, isMultisig);
            derivedSigner = signer;
          }
          if (mode === InteracationMode.IDENTIFICATION) {
            const mapped = mapUnknownSigner({
              masterFingerprint: derivedSigner.masterFingerprint,
              type: SignerType.COLDCARD,
            });
            if (mapped) {
              handleSuccess();
            } else {
              handleFailure();
            }
          } else if (signer) {
            if (derivedSigner.masterFingerprint === signer.masterFingerprint) {
              handleSuccess();
            } else {
              handleFailure();
            }
          }
        }
      }
    } catch (err) {
      console.log('Error Soft Key HC', err);
    } finally {
      setHcLoading(false);
    }
  };

  function InValidSeedsScreen() {
    return (
      <View>
        <Box alignSelf="center">
          <InvalidSeeds />
        </Box>
        <Text color={`${colorMode}.greenText`} fontSize={13}>
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
        <Text color={`${colorMode}.greenText`} fontSize={13}>
          The BIP-85 wallets and vault in the app are recovered.
        </Text>
      </View>
    );
  }

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

  const selectNumberOfWords = (option: string) => {
    setSelectedNumberOfWords(option);
  };

  const seedItem = (item, index) => {
    if (
      activePage === 3
        ? index >= 18 && index < 24
        : activePage === 2
        ? index >= 12 && index < 18
        : activePage === 1
        ? index >= 6 && index < 12
        : index < 6
    )
      return (
        <Box style={styles.inputListWrapper}>
          <Input
            fontWeight={500}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={item.invalid && item.name != '' ? '#F58E6F' : `${colorMode}.seashellWhite`}
            ref={(el) => (inputRef.current[index] = el)}
            style={styles.input}
            placeholder={`Enter ${getPlaceholder(index)} word`}
            placeholderTextColor={`${colorMode}.SlateGreen`}
            value={item?.name}
            textContentType="none"
            returnKeyType={isSeedFilled(12) ? 'done' : 'next'}
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
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
              Keyboard.dismiss();
            }}
            testID={`input_seedWord${getPlaceholder(index)}`}
          />
        </Box>
      );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.container}
      >
        <KeeperHeader
          title={
            isHealthCheck
              ? 'Seed key health check'
              : isImport
              ? 'Enter Seed Words'
              : seed?.enterRecoveryPhrase
          }
          subtitle={
            isHealthCheck
              ? 'Enter the seed key'
              : isImport
              ? 'To import enter the seed key'
              : seed.enterRecoveryPhraseSubTitle
          }
          // To-Do-Learn-More
        />
        <Box
          style={{
            marginVertical: 20,
            flex: 1,
            gap: hp(20),
          }}
        >
          {isImport && (
            <Dropdown
              label={selectedNumberOfWords}
              options={options}
              onOptionSelect={selectNumberOfWords}
            />
          )}
          <FlatList
            ref={ref}
            keyExtractor={(item) => item.id}
            data={seedData}
            extraData={seedData}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}
            pagingEnabled
            renderItem={({ item, index }) => seedItem(item, index)}
          />
          {suggestedWords?.length > 0 ? (
            <ScrollView
              style={[
                styles.suggestionScrollView,
                {
                  marginTop: getPosition(onChangeIndex) * hp(60),
                  height: onChangeIndex === 4 || onChangeIndex === 5 ? hp(90) : null,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              testID="view_suggestionView"
            >
              <Box style={styles.suggestionWrapper}>
                {suggestedWords.map((word, wordIndex) => (
                  <Pressable
                    testID={`btn_suggested_${word}`}
                    key={word ? `${word + wordIndex}` : wordIndex}
                    style={styles.suggestionTouchView}
                    onPress={() => {
                      Keyboard.dismiss();
                      const data = [...seedData];
                      data[onChangeIndex].name = word.trim();
                      setSeedData(data);
                      setSuggestedWords([]);
                      if (onChangeIndex !== 11) inputRef.current[onChangeIndex + 1].focus();
                    }}
                  >
                    <Text>{word}</Text>
                  </Pressable>
                ))}
              </Box>
            </ScrollView>
          ) : null}
        </Box>
        <Box style={styles.bottomContainerView}>
          <Breadcrumbs
            totalScreens={
              selectedNumberOfWords === '12 Seed Words'
                ? 2
                : selectedNumberOfWords === '18 Seed Words'
                ? 3
                : selectedNumberOfWords === '24 Seed Words'
                ? 4
                : 0
            }
            currentScreen={activePage + 1}
          />
          {isHealthCheck ? (
            <Buttons primaryCallback={onPressHealthCheck} primaryText="Next" />
          ) : (
            <Buttons
              primaryCallback={isImport ? onPressImportNewKey : onPressNextSeedReocvery}
              primaryText="Next"
              primaryLoading={recoveryLoading}
            />
          )}
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
          visible={recoverySuccessModal}
          title="App Recovered"
          subTitle="Your Keeper App has successfully been recovered"
          buttonText="Ok"
          Content={SuccessModalContent}
          close={() => {}}
          showCloseIcon={false}
          buttonCallback={() => {
            setRecoverySuccessModal(false);
          }}
        />
      </KeyboardAvoidingView>
      <ActivityIndicatorView showLoader={true} visible={hcLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderRadius: 10,
    fontSize: 13,
    letterSpacing: 0.39,
    height: hp(50),
    width: wp(150),
    zIndex: 1,
  },
  inputListWrapper: {
    width: '50%',
    paddingHorizontal: 10,
  },
  bottomContainerView: {
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionScrollView: {
    zIndex: 999,
    position: 'absolute',
    height: hp(150),
    width: '100%',
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
});

export default EnterSeedScreen;
