import Text from 'src/components/KeeperText';
import { Box, View, ScrollView } from 'native-base';
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
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import * as bip39 from 'bip39';

import StatusBarComponent from 'src/components/StatusBarComponent';
import SeedWordsView from 'src/components/SeedWordsView';
import { LocalizationContext } from 'src/common/content/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import Illustration from 'src/assets/images/illustration.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { getPlaceholder } from 'src/common/utilities';

function InputSeedWordSigner({ route }) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;
  const { common } = translations;
  const { onSuccess } = route.params;
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

  const { showToast } = useToastMessage();

  const isSeedFilled = () => {
    for (let i = 0; i < 12; i++) {
      if (seedData[i].invalid === true) {
        showToast('Enter correct seedwords', <TickIcon />);
        return true;
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
    const mnemonic = getSeedWord();
    if (bip39.validateMnemonic(mnemonic)) {
      onSuccess({ seedBasedSingerMnemonic: mnemonic });
      navigation.goBack();
    } else Alert.alert('Invalid Mnemonic');
  };

  function RecoverWalletScreen() {
    return (
      <View>
        <Illustration />
        <Text color="#073B36" fontSize={13} fontFamily="body">
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
        <Text color="#073B36" fontSize={13} fontFamily="body" p={2}>
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
                      item.invalid == true
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
                      setSeedData(data);
                    }}
                    onBlur={() => {
                      if (!bip39.wordlists.english.includes(seedData[index].name)) {
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
          <Text color="#4F5955" marginX={10} marginY={10} fontSize={12}>
            {seed.seedDescription}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Box bg="transparent" flexDirection="row" marginLeft={10} marginTop={4}>
              <View style={styles.dot} />
              <View style={styles.dash} />
            </Box>
            <Box bg="transparent" flexDirection="row" marginRight={10}>
              <TouchableOpacity>
                <Text
                  fontSize={13}
                  fontFamily="body"
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
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={['#00836A', '#073E39']}
                  style={styles.cta}
                >
                  <Text fontSize={13} fontFamily="body" bold letterSpacing={1} color="white">
                    {common.next}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
            <KeeperModal
              visible={invalidSeedsModal}
              close={closeInvalidSeedsModal}
              title={seed.InvalidSeeds}
              subTitle={seed.seedDescription}
              buttonBackground={['#00836A', '#073E39']}
              buttonText="Retry"
              buttonTextColor="#FAFAFA"
              buttonCallback={closeInvalidSeedsModal}
              textColor="#041513"
              Content={InValidSeedsScreen}
            />
            <KeeperModal
              visible={walletRecoverySuccessModal}
              close={closeRecovery}
              title={seed.walletRecoverySuccessful}
              subTitle={seed.seedDescription}
              buttonBackground={['#00836A', '#073E39']}
              buttonText="View Wallet"
              buttonTextColor="#FAFAFA"
              buttonCallback={closeWalletSuccessModal}
              textColor="#041513"
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
