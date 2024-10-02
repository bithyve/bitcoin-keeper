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
import SuccessSvg from 'src/assets/images/successSvg.svg';
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
import { setAppImageError } from 'src/store/reducers/bhr';

type seedWordItem = {
  id: number;
  name: string;
  invalid: boolean;
};

const SEED_WORDS_12 = '12 Seed Words';
const SEED_WORDS_18 = '18 Seed Words';
const SEED_WORDS_24 = '24 Seed Words';

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
  const [seedData, setSeedData] = useState<seedWordItem[]>();
  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [recoverySuccessModal, setRecoverySuccessModal] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [hcLoading, setHcLoading] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [onChangeIndex, setOnChangeIndex] = useState(-1);
  const [selectedNumberOfWords, setSelectedNumberOfWords] = useState(SEED_WORDS_12);

  const options = [SEED_WORDS_12, SEED_WORDS_18, SEED_WORDS_24];

  const inputRef = useRef([]);

  const isHealthCheck = mode === InteracationMode.HEALTH_CHECK;
  const isSignTransaction = parentScreen === SIGNTRANSACTION;
  const isIdentification = mode === InteracationMode.IDENTIFICATION;

  const openInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    if (!isSignTransaction) setInvalidSeedsModal(true);
  };
  const closeInvalidSeedsModal = () => {
    dispatch(setAppImageError(false));
    setRecoveryLoading(false);
    setInvalidSeedsModal(false);
  };

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
    setSeedData(generateSeedWordsArray());
  }, []);

  useEffect(() => {
    if (appId && recoveryLoading) {
      setRecoveryLoading(false);
      setRecoverySuccessModal(true);
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
      selectedNumberOfWords === SEED_WORDS_12
        ? 12
        : selectedNumberOfWords === SEED_WORDS_18
        ? 18
        : 24;
    for (let i = 0; i < index; i++) {
      seedWord += `${seedData[i].name} `;
    }
    return seedWord.trim();
  };

  const onPressNextSeedReocvery = async () => {
    const startIndex = activePage * 6;
    const endIndex = (activePage + 1) * 6;

    if (isSeedFilled(endIndex)) {
      if (activePage === 1 && isSeedFilled(12)) {
        const seedWord = getSeedWord();
        setRecoveryLoading(true);
        dispatch(getAppImage(seedWord));
      } else if (activePage === 0) {
        setActivePage(1);
      }
    } else {
      showToast(seed.SeedErrorToast, <ToastErrorIcon />);
    }
  };

  const onPressImportNewKey = async () => {
    if (activePage === 3) {
      const seedWord = getSeedWord();
      importSeedCta(seedWord);
    }
    if (activePage === 2) {
      if (!(selectedNumberOfWords === SEED_WORDS_18)) {
        if (isSeedFilled(18)) setActivePage(3);
        else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      } else {
        const seedWord = getSeedWord();
        importSeedCta(seedWord);
      }
    }
    if (activePage === 1) {
      if (!(selectedNumberOfWords === SEED_WORDS_12)) {
        if (isSeedFilled(12)) setActivePage(2);
        else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      } else {
        const seedWord = getSeedWord();
        importSeedCta(seedWord);
      }
    }
    if (activePage === 0) {
      if (isSeedFilled(6)) setActivePage(1);
      else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
    }
  };

  const onPressHealthCheck = async () => {
    setHcLoading(true);

    const handleSuccess = () => {
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
          },
        ])
      );
      showToast('Health check successful!', <TickIcon />);
      navigation.dispatch(CommonActions.goBack());
    };

    const handleFailure = () => {
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_FAILED,
          },
        ])
      );
      showToast('Health check failed');
    };

    try {
      if (isSeedFilled(6)) {
        if (isSeedFilled(12)) {
          let derivedSigner;
          const seedWord = getSeedWord();
          if (signer?.type === SignerType.MY_KEEPER) {
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
        } else {
          setActivePage(1);
        }
      } else {
        showToast('Enter all seedwords', <ToastErrorIcon />);
      }
    } catch (err) {
      console.log('Error Soft Key HC', err);
    } finally {
      setHcLoading(false);
    }
  };

  const onPressSignTransaction = async () => {
    if (activePage === 3) {
      const seedWord = getSeedWord();
      importSeedCta(seedWord);
    }
    if (activePage === 2) {
      if (!(selectedNumberOfWords === SEED_WORDS_18)) {
        if (isSeedFilled(18)) setActivePage(3);
        else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      } else {
        const seedWord = getSeedWord();
        importSeedCta(seedWord);
      }
    }
    if (activePage === 1) {
      if (!(selectedNumberOfWords === SEED_WORDS_12)) {
        if (isSeedFilled(12)) setActivePage(2);
        else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      } else {
        const seedWord = getSeedWord();
        importSeedCta(seedWord);
      }
    }
    if (activePage === 0) {
      if (isSeedFilled(6)) setActivePage(1);
      else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
    }
  };

  const onPressHandleHealthCheck = async () => {
    if (activePage === 3) {
      onPressHealthCheck();
    }
    if (activePage === 2) {
      if (!(selectedNumberOfWords === SEED_WORDS_18)) {
        if (isSeedFilled(18)) setActivePage(3);
        else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      } else {
        onPressHealthCheck();
      }
    }
    if (activePage === 1) {
      if (!(selectedNumberOfWords === SEED_WORDS_12)) {
        if (isSeedFilled(12)) setActivePage(2);
        else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
      } else {
        onPressHealthCheck();
      }
    }
    if (activePage === 0) {
      if (isSeedFilled(6)) setActivePage(1);
      else showToast(seed.SeedErrorToast, <ToastErrorIcon />);
    }
  };

  const onPressNext = async () => {
    const mnemonic = getSeedWord();
    if (bip39.validateMnemonic(mnemonic)) {
      onSuccess({ xfp, seedBasedSingerMnemonic: mnemonic });
      navigation.goBack();
    } else Alert.alert('Invalid Mnemonic');
  };

  const handleNext = () => {
    const isLastPage =
      (selectedNumberOfWords === SEED_WORDS_12 && activePage === 1) ||
      (selectedNumberOfWords === SEED_WORDS_18 && activePage === 2) ||
      (selectedNumberOfWords === SEED_WORDS_24 && activePage === 3);

    if (isLastPage) {
      if (isHealthCheck || isIdentification) onPressHandleHealthCheck();
      else onPressNext();
    } else {
      onPressSignTransaction();
    }
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

  const seedItem = (item: seedWordItem, index: number) => {
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
            placeholder={`Enter ${getPlaceholderSuperScripted(index)} word`}
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
    else return null;
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
          onPressHandler={
            activePage >= 0 ? () => setActivePage(activePage - 1) : navigation.goBack()
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
          {(isImport || isSignTransaction || isHealthCheck || isIdentification) && (
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
                      Keyboard.dismiss();
                      const data = [...seedData];
                      data[onChangeIndex].name = word.trim();
                      setSeedData(data);
                      setSuggestedWords([]);
                      if (onChangeIndex < (activePage + 1) * 6 - 1)
                        inputRef.current[onChangeIndex + 1].focus();
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
              selectedNumberOfWords === SEED_WORDS_12
                ? 2
                : selectedNumberOfWords === SEED_WORDS_18
                ? 3
                : selectedNumberOfWords === SEED_WORDS_24
                ? 4
                : 0
            }
            currentScreen={activePage + 1}
          />
          {isHealthCheck || isIdentification ? (
            <Buttons
              primaryCallback={handleNext}
              primaryText={common.next}
              secondaryText={common.needHelp}
              secondaryCallback={() => {
                dispatch(goToConcierge([ConciergeTag.VAULT], 'sign-transaction-seed-key'));
              }}
            />
          ) : isSignTransaction ? (
            <Buttons
              primaryCallback={handleNext}
              primaryText={common.next}
              secondaryText={common.needHelp}
              secondaryCallback={() => {
                dispatch(goToConcierge([ConciergeTag.VAULT], 'sign-transaction-seed-key'));
              }}
              primaryLoading={recoveryLoading}
            />
          ) : (
            <Buttons
              primaryCallback={isImport ? onPressImportNewKey : onPressNextSeedReocvery}
              primaryText={common.next}
              secondaryText={common.needHelp}
              secondaryCallback={() => {
                dispatch(goToConcierge([ConciergeTag.VAULT], 'sign-transaction-seed-key'));
              }}
              primaryLoading={recoveryLoading}
            />
          )}
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
  dropdownContainer: {
    zIndex: 9999,
  },
  invalidSeedsIllustration: {
    alignSelf: 'center',
    marginBottom: hp(30),
  },
});

export default EnterSeedScreen;
