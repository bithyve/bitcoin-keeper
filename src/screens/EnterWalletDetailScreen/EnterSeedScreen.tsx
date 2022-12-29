import * as bip39 from 'bip39';

import { Box, View } from 'native-base';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, TextInput } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

import Buttons from 'src/components/Buttons';
import Fonts from 'src/common/Fonts';
import Illustration from 'src/assets/images/illustration.svg';
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
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { getPlaceholder } from 'src/common/utilities';

function EnterSeedScreen() {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;

  const ref = useRef<FlatList>(null);
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
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const [walletRecoverySuccessModal, setWalletRecoverySuccessModal] = useState(false);

  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const openInvalidSeedsModal = () => setInvalidSeedsModal(true);
  const closeInvalidSeedsModal = () => {
    setRecoveryLoading(false);
    setInvalidSeedsModal(false);
  };

  const openLoaderModal = () => setCreateCloudBackupModal(true);
  const closeLoaderModal = () => setCreateCloudBackupModal(false);
  const closeRecovery = () => setWalletRecoverySuccessModal(false);

  const closeWalletSuccessModal = () => {
    setWalletRecoverySuccessModal(false);
  };

  const { showToast } = useToastMessage();

  const dispatch = useDispatch();
  const { appImageRecoverd, appRecreated, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );

  useEffect(() => {
    if (appImageError) openInvalidSeedsModal();

    if (appRecoveryLoading) {
      setRecoveryLoading(true);
      openLoaderModal();
    }
  }, [appRecoveryLoading, appImageError, appImageRecoverd]);

  useEffect(() => {
    if (appRecreated) {
      setTimeout(() => {
        closeLoaderModal();
        setRecoveryLoading(false);
        navigation.navigate('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appRecreated]);

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

  const onPressNext = async () => {
    if (isSeedFilled(6)) {
      if (isSeedFilled(12)) {
        const seedWord = getSeedWord();
        dispatch(getAppImage(seedWord));
      } else {
        ref.current.scrollToIndex({ index: 5, animated: true });
      }
    } else {
      showToast('Enter correct seedwords', <ToastErrorIcon />);
    }
  };

  function RecoverWalletScreen() {
    return (
      <View>
        <Illustration />
        <Text color="light.greenText" fontSize={13}>
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
        <Text color="light.greenText" fontSize={13} padding={2}>
          Make sure the words are entered in the correct sequence
        </Text>
      </View>
    );
  }

  const getFormattedNumber = (number) => {
    if (number < 9) return `0${number + 1}`;
    return number + 1;
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
          <SeedWordsView
            title={seed?.enterRecoveryPhrase}
            subtitle={seed.recoverWallet}
            onPressHandler={() => navigation.navigate('NewKeeperApp')}
          />
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
            scrollEnabled={false}
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
                  placeholder={`Enter ${getPlaceholder(index)} phrase`}
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
                  }}
                />
              </View>
            )}
          />
        </View>
        <View style={styles.bottomContainerView}>
          <Text style={styles.seedDescText} color="light.GreyText">
            {seed.seedDescription}
          </Text>
          <View style={styles.bottomBtnsWrapper}>
            <Box style={styles.bottomBtnsWrapper02}>
              <View style={styles.dot} />
              <View style={styles.dash} />
            </Box>
            <Buttons
              primaryCallback={onPressNext}
              primaryText="Next"
              primaryLoading={recoveryLoading}
            />
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
          visible={walletRecoverySuccessModal}
          close={closeRecovery}
          title={seed.walletRecoverySuccessful}
          subTitle={seed.seedDescription}
          buttonText="View Wallet"
          buttonTextColor="light.white"
          buttonCallback={closeWalletSuccessModal}
          textColor="light.primaryText"
          Content={RecoverWalletScreen}
        />
        {/* <ModalWrapper
            visible={createCloudBackupModal}
            onSwipeComplete={() => setCreateCloudBackupModal(false)}
          >
            <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
          </ModalWrapper> */}
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
});

export default EnterSeedScreen;
