import * as bip39 from 'bip39';
import { Box, Input, Pressable, ScrollView, View, useColorMode } from 'native-base';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import InvalidSeeds from 'src/assets/images/invalid-seed-illustration.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getAppImage, healthCheckSigner, healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { getPlaceholder, getPlaceholderSuperScripted } from 'src/utils/utilities';
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
import { SIGNTRANSACTION } from 'src/navigation/contants';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { ConciergeTag, goToConcierge } from 'src/store/sagaActions/concierge';
import RecoverySuccessModalContent from './RecoverySuccessModalContent';
import { resetSeedWords, setAppImageError, setSeedWord } from 'src/store/reducers/bhr';
import Fonts from 'src/constants/Fonts';
import { SEED_WORDS_12, SEED_WORDS_18, SEED_WORDS_24, seedWordItem } from './constants';

function EnterSeedScreen({ route, navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { seed, common } = translations;

  const {
    mode,
    signer,
    isMultisig,
    setupSeedWordsBasedSigner,
    mapUnknownSigner,
    isImport,
    importSeedCta,
    parentScreen,
    xfp,
    onSuccess,
    step = 1,
    selectedNumberOfWordsFromParams,
  } = route.params || {};
  const { appImageRecoverd, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );

  const { appId } = useAppSelector((state) => state.storage);
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const seedWords = useAppSelector((state) => state.bhr.seedWords);

  const ref = useRef<FlatList>(null);
  const [seedData, setSeedData] = useState<seedWordItem[]>();
  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [recoverySuccessModal, setRecoverySuccessModal] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [hcLoading, setHcLoading] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [onChangeIndex, setOnChangeIndex] = useState(-1);
  const [selectedNumberOfWords, setSelectedNumberOfWords] = useState(
    SEED_WORDS_12 || selectedNumberOfWordsFromParams
  );
  const [unsavedIndexes, setUnsavedIndexes] = useState(new Set());

  const options = [SEED_WORDS_12, SEED_WORDS_18, SEED_WORDS_24];
  const numberOfWordsToScreensMap = {
    [SEED_WORDS_12]: 1,
    [SEED_WORDS_18]: 2,
    [SEED_WORDS_24]: 2,
  };

  const inputRef = useRef<(typeof Input | null)[]>([]);

  const isHealthCheck = mode === InteracationMode.HEALTH_CHECK;
  const isSignTransaction = parentScreen === SIGNTRANSACTION;
  const isIdentification = mode === InteracationMode.IDENTIFICATION;

  const openInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    if (!isSignTransaction) setInvalidSeedsModal(true);
  };
  const closeInvalidSeedsModal = () => {
    dispatch(setAppImageError(false));
    setInvalidSeedsModal(false);
  };

  useEffect(() => {
    if (appId && recoveryLoading) {
      setRecoveryLoading(false);
      setRecoverySuccessModal(true);
      dispatch(resetSeedWords());
    }
  }, [appId]);

  useEffect(() => {
    if (appImageError) openInvalidSeedsModal();
  }, [appRecoveryLoading, appImageError, appImageRecoverd]);

  const generateSeedWordsArray = useCallback(() => {
    const seedArray = [];
    for (let i = 1; i <= 24; i++) {
      seedArray.push({
        id: i,
        name: '',
        invalid: true,
      });
    }
    return seedArray;
  }, []);

  useEffect(() => {
    if (seedWords && seedWords.length > 0) {
      const seedWordsMap = seedWords.reduce((acc, word) => {
        acc[word.id] = word;
        return acc;
      }, {});

      const updatedSeedData = generateSeedWordsArray().map((seedWord, index) => {
        const globalSeedWord = seedWordsMap[index + 1];
        return globalSeedWord
          ? {
              ...seedWord,
              name: globalSeedWord.name,
              invalid: !bip39.wordlists.english.includes(globalSeedWord.name),
            }
          : seedWord;
      });

      setSeedData(updatedSeedData);
    } else {
      setSeedData(generateSeedWordsArray());
    }
  }, [seedWords]);

  const isSeedFilled = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (seedData[i].invalid) {
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    const mnemonic = seedWords.map((word) => word.name).join(' ');

    unsavedIndexes.forEach((index) => {
      inputRef.current[index]?.blur();
    });

    setUnsavedIndexes(new Set());

    const areInputsFilled = () => {
      const requiredWordsCount = getRequiredWordsCount();
      return seedData.slice(0, requiredWordsCount).every((word) => word.name !== '');
    };

    if (!areInputsFilled()) {
      showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      return;
    }

    const handleHealthCheck = async () => {
      setHcLoading(true);
      try {
        if (step === 1 && [SEED_WORDS_18, SEED_WORDS_24].includes(selectedNumberOfWords)) {
          navigation.push('EnterSeedScreen', {
            step: 2,
            selectedNumberOfWordsFromParams: selectedNumberOfWords,
            mode,
            setupSeedWordsBasedSigner,
            signer,
          });
        } else {
          const derivedSigner = await generateDerivedSigner(mnemonic, signer, isMultisig);
          const isHealthy = await healthCheckSigner(derivedSigner);

          if (isHealthy) {
            updateHealthCheckStatus(hcStatusType.HEALTH_CHECK_SUCCESSFULL);
            showToast('Health check successful!', <TickIcon />);
            dispatch(resetSeedWords());
            navigateBack(step);
          } else {
            updateHealthCheckStatus(hcStatusType.HEALTH_CHECK_FAILED);
            showToast('Health check failed');
          }
        }
      } catch (err) {
        handleHealthCheckError(err);
      } finally {
        setHcLoading(false);
      }
    };

    const handleIdentification = async () => {
      try {
        const derivedSigner = await generateDerivedSigner(mnemonic, signer, isMultisig);
        const mapped = mapUnknownSigner({
          masterFingerprint: derivedSigner.masterFingerprint,
          type: SignerType.COLDCARD,
        });

        if (mapped) {
          updateHealthCheckStatus(hcStatusType.HEALTH_CHECK_SUCCESSFULL);
          showToast('Identification successful!', <TickIcon />);
          dispatch(resetSeedWords());
          navigateBack(step);
        } else {
          showToast('Identification failed');
        }
      } catch (err) {
        handleIdentificationError(err);
      }
    };

    const handleImport = () => {
      if (step === 1 && [SEED_WORDS_18, SEED_WORDS_24].includes(selectedNumberOfWords)) {
        navigation.push('EnterSeedScreen', {
          step: 2,
          selectedNumberOfWordsFromParams: selectedNumberOfWords,
          mode,
          isImport: true,
          importSeedCta,
        });
      } else if (bip39.validateMnemonic(mnemonic)) {
        importSeedCta(mnemonic);
        dispatch(resetSeedWords());
      } else {
        showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      }
    };

    const handleSignTransaction = () => {
      if (step === 1 && [SEED_WORDS_18, SEED_WORDS_24].includes(selectedNumberOfWords)) {
        navigation.push('EnterSeedScreen', {
          step: 2,
          selectedNumberOfWordsFromParams: selectedNumberOfWords,
          onSuccess,
          mode,
          xfp,
          parentScreen,
        });
      } else if (bip39.validateMnemonic(mnemonic)) {
        onSuccess({ xfp, seedBasedSingerMnemonic: mnemonic });
        dispatch(resetSeedWords());
        navigateBack(step);
      } else {
        Alert.alert('Invalid Mnemonic');
      }
    };

    const handleGetAppImage = async () => {
      setRecoveryLoading(true);
      try {
        const seedWord = seedWords.map((word) => word.name).join(' ');
        setRecoveryLoading(true);
        dispatch(getAppImage(seedWord));
      } catch (err) {
        console.error('getAppImage error:', err);
        showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      }
    };

    if (isHealthCheck) {
      await handleHealthCheck();
    } else if (mode === InteracationMode.IDENTIFICATION) {
      await handleIdentification();
    } else if (isImport) {
      handleImport();
    } else if (isSignTransaction) {
      handleSignTransaction();
    } else {
      await handleGetAppImage();
    }
  };

  const generateDerivedSigner = async (mnemonic, signer, isMultisig) => {
    if (signer?.type === SignerType.MY_KEEPER) {
      const details = await getCosignerDetails(mnemonic, signer.extraData?.instanceNumber - 1);
      return generateSignerFromMetaData({
        xpub: details.xpubDetails[XpubTypes.P2WSH].xpub,
        xpriv: details.xpubDetails[XpubTypes.P2WSH].xpriv,
        derivationPath: details.xpubDetails[XpubTypes.P2WSH].derivationPath,
        masterFingerprint: details.mfp,
        signerType: SignerType.MY_KEEPER,
        storageType: SignerStorage.WARM,
        isMultisig: true,
      }).signer;
    } else {
      const { signer: newSigner } = setupSeedWordsBasedSigner(mnemonic, isMultisig);
      return newSigner;
    }
  };

  const updateHealthCheckStatus = (status) => {
    dispatch(healthCheckStatusUpdate([{ signerId: signer.masterFingerprint, status }]));
  };

  const navigateBack = (step) => {
    step > 1
      ? navigation.dispatch((state) => {
          const routes = state.routes.slice(0, -step);
          return CommonActions.reset({
            ...state,
            routes,
            index: routes.length - 1,
          });
        })
      : navigation.goBack();
  };

  const handleHealthCheckError = (err) => {
    console.error('Health check error:', err);
    showToast(seed.SeedErrorToast, <ToastErrorIcon />);
  };

  const handleIdentificationError = (err) => {
    console.error('Identification error:', err);
    showToast(seed.SeedErrorToast, <ToastErrorIcon />);
  };

  function InValidSeedsScreen() {
    const { translations } = useContext(LocalizationContext);
    const { seed } = translations;
    return (
      <View>
        <Box style={styles.invalidSeedsIllustration}>
          <InvalidSeeds />
        </Box>
        <Text color={`${colorMode}.secondaryText`} fontSize={13}>
          {seed.InvalidSeedsDesc}
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
    return Math.floor(index / 2) + 1;
  };

  const selectNumberOfWords = (option: string) => {
    setSelectedNumberOfWords(option);
  };

  const handleInputChange = (text, index) => {
    const data = [...seedData];
    data[index].name = text.trim();
    data[index].invalid = false;
    setSeedData(data);

    setUnsavedIndexes((prev) => new Set(prev).add(index));

    if (text.length > 1) {
      setOnChangeIndex(index);
      getSuggestedWords(text.toLowerCase());
    } else {
      setSuggestedWords([]);
    }
  };

  const handleInputBlur = (index) => {
    const data = [...seedData];
    if (!bip39.wordlists.english.includes(data[index].name)) {
      data[index].invalid = true;
    }
    setSeedData(data);
    dispatch(setSeedWord({ index, wordItem: seedData[index] }));
  };

  const seedItem = (item: seedWordItem, index: number) => {
    if (
      (step === 1 && index < 12) ||
      (step === 2 &&
        (selectedNumberOfWords === SEED_WORDS_18 ||
          selectedNumberOfWordsFromParams === SEED_WORDS_18) &&
        index >= 12 &&
        index < 18) ||
      (step === 2 &&
        (selectedNumberOfWords === SEED_WORDS_24 ||
          selectedNumberOfWordsFromParams === SEED_WORDS_24) &&
        index >= 12 &&
        index < 24)
    ) {
      return (
        <Box style={styles.inputListWrapper}>
          <Input
            fontWeight={500}
            fontFamily={item.name === '' ? 'Arial' : Fonts.FiraSansSemiBold}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={item.invalid && item.name != '' ? '#F58E6F' : `${colorMode}.seashellWhite`}
            ref={(el) => (inputRef.current[index] = el)}
            style={styles.input}
            placeholder={`Enter ${getPlaceholderSuperScripted(index)} word`}
            placeholderTextColor={`${colorMode}.SlateGreen`}
            value={item?.name}
            textContentType="none"
            returnKeyType={isSeedFilled(12) ? 'done' : 'next'}
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
            keyboardType={Platform.OS === 'android' ? 'visible-password' : 'name-phone-pad'}
            onChangeText={(text) => handleInputChange(text, index)}
            onBlur={() => handleInputBlur(index)}
            onFocus={() => {
              const data = [...seedData];
              data[index].invalid = false;
              setSeedData(data);
              setSuggestedWords([]);
              setOnChangeIndex(index);
            }}
            onSubmitEditing={() => {
              dispatch(setSeedWord({ index, wordItem: seedData[index] }));

              setSuggestedWords([]);
              Keyboard.dismiss();
            }}
            testID={`input_seedWord${getPlaceholder(index)}`}
          />
        </Box>
      );
    } else {
      return null;
    }
  };

  const getRequiredWordsCount = () => {
    const wordsMap = {
      [SEED_WORDS_12]: 12,
      [SEED_WORDS_18]: step === 1 ? 12 : 18,
      [SEED_WORDS_24]: step === 1 ? 12 : 24,
    };
    return wordsMap[selectedNumberOfWordsFromParams || selectedNumberOfWords] || 0;
  };

  const requiredWordsCount = getRequiredWordsCount();

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
            isHealthCheck || isIdentification
              ? 'Seed key health check'
              : isImport
              ? 'Enter Seed Words'
              : isSignTransaction
              ? seed?.EnterSeed
              : seed?.enterRecoveryPhrase
          }
          subtitle={
            isHealthCheck || isIdentification
              ? 'Enter the seed key'
              : isImport
              ? 'To import enter the seed key'
              : isSignTransaction
              ? 'To sign transaction'
              : seed.enterRecoveryPhraseSubTitle
          }
          onPressHandler={() => {
            navigation.goBack();
            if (step === 1) {
              dispatch(resetSeedWords());
            }
          }}
          // To-Do-Learn-More
        />
        <Box
          style={{
            marginVertical: 20,
            flex: 1,
            gap: hp(20),
          }}
        >
          {(isImport || isSignTransaction || isHealthCheck || isIdentification) && step === 1 && (
            <Box style={styles.dropdownContainer}>
              <Dropdown
                label={selectedNumberOfWords}
                options={options}
                onOptionSelect={selectNumberOfWords}
              />
            </Box>
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
                      const updatedSeedData = [...seedData];
                      updatedSeedData[onChangeIndex].name = word.trim();
                      setSeedData(updatedSeedData);
                      setSuggestedWords([]);
                      if (onChangeIndex < (step === 1 ? 11 : requiredWordsCount - 1)) {
                        inputRef.current[onChangeIndex + 1]?.focus();
                      }
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
            totalScreens={numberOfWordsToScreensMap[selectedNumberOfWords] || 0}
            currentScreen={step}
          />

          <Buttons
            primaryCallback={handleNext}
            primaryText={common.next}
            secondaryText={common.needHelp}
            secondaryCallback={() => {
              dispatch(goToConcierge([ConciergeTag.VAULT], 'sign-transaction-seed-key'));
            }}
            primaryLoading={recoveryLoading}
          />
        </Box>

        <KeeperModal
          visible={invalidSeedsModal}
          close={closeInvalidSeedsModal}
          showCloseIcon={false}
          title={seed.InvalidSeeds}
          subTitle={seed.InvalidSeedsSubtitle}
          buttonText="Retry"
          buttonTextColor={`${colorMode}.white`}
          buttonCallback={closeInvalidSeedsModal}
          textColor={`${colorMode}.primaryText`}
          Content={InValidSeedsScreen}
        />
        <KeeperModal
          visible={recoverySuccessModal}
          title="App Recovered Successfully!"
          subTitle="All your wallets and data about your vault has been recovered"
          buttonText="Continue"
          modalBackground={`${colorMode}.modalWhiteBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.white`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          Content={RecoverySuccessModalContent}
          close={() => {
            setRecoverySuccessModal(false);
            navigation.replace('App', { screen: 'Home' });
          }}
          showCloseIcon={false}
          buttonCallback={() => {
            setRecoverySuccessModal(false);
            navigation.replace('App', { screen: 'Home' });
          }}
        />
      </KeyboardAvoidingView>
      <ActivityIndicatorView showLoader={true} visible={hcLoading || recoveryLoading} />
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
    zIndex: 99999,
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
  dropdownContainer: {
    zIndex: 9999,
  },
  invalidSeedsIllustration: {
    alignSelf: 'center',
    marginBottom: hp(30),
  },
});

export default EnterSeedScreen;
