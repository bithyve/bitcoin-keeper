import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useCallback, useContext, useState, useEffect } from 'react';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import { Text, View, Box } from 'native-base';
import config, { APP_STAGE } from 'src/core/config';
import { RFValue } from 'react-native-responsive-fontsize';
import { CKTapCard } from 'coinkite-tap-protocol-js';
import DeleteIcon from 'src/assets/images/delete.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import LinearGradient from 'react-native-linear-gradient';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NetworkType, SignerType, VaultType } from 'src/core/wallets/enums';
import { addNewVault } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { newVaultInfo } from 'src/store/sagas/wallets';
import { generateMockExtendedKey } from 'src/core/wallets/factories/WalletFactory';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import CustomButton from 'src/components/CustomButton/CustomButton';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import WalletUtilities from 'src/core/wallets/operations/utils';
import DotView from 'src/components/DotView';

const StepState = ({ index, active, done }) => {
  const circleStyle = [
    styles.circle,
    active ? styles.activeCircle : done ? styles.doneCircle : styles.inactiveCircle,
  ];
  return (
    <View style={circleStyle}>
      <Text fontSize={14} fontFamily={'body'} fontWeight={'200'} color={'#073E39'}>
        {index}
      </Text>
    </View>
  );
};

const StepDescription = ({ item, cvc, setCvc, callback }) => {
  const { title, description, active, extraComponent: Extra } = item;
  return (
    <Animated.View style={styles.stepBodyContainer}>
      <Text
        fontSize={16}
        fontFamily={'body'}
        fontWeight={'200'}
        color={'#00715B'}
        pb={3}
        letterSpacing={1}
      >
        {title}
      </Text>
      {active && (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
          <Text
            fontSize={13}
            fontFamily={'body'}
            fontWeight={'200'}
            color={'#4F5955'}
            pb={3}
            letterSpacing={1}
            noOfLines={2}
            width={'90%'}
          >
            {description}
          </Text>
          {Extra && Extra({ cvc, setCvc, callback })}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const Step = ({ item, cvc, setCvc, callback }) => {
  return (
    <Animated.View style={styles.stepContainer} entering={FadeIn.delay(item.index * 150)}>
      <StepState index={item.index} active={item.active} done={item.done} />
      <StepDescription item={item} cvc={cvc} setCvc={setCvc} callback={callback} />
    </Animated.View>
  );
};

const InputCvc = ({ cvc, setCvc, callback }) => {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={cvc}
        onChangeText={setCvc}
        secureTextEntry={true}
        showSoftInputOnFocus={false}
      />
      <TouchableOpacity onPress={callback}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#00836A', '#073E39']}
          style={{ borderRadius: 10 }}
        >
          <Text color="#FAFAFA" fontSize="14" padding={3} px={8}>
            {'Proceed'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PinInputs = ({ passCode, passcodeFlag, backgroundColor, textColor, passCodeBox }) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (passCode.length == 6) {
      setTimeout(() => {
        setHide(true);
      }, 2000);
    } else {
      setHide(false);
    }
  }, [passCode]);

  return (
    <Box alignSelf={'baseline'} flex={1} mt={hp(90)}>
      <Box flexDirection={'row'} mt={hp(2)} marginBottom={hp(2.5)} width={'auto'} flex={1}>
        {/* 1st */}
        <Box
          height={wp(45)}
          width={wp(35)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 1 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[0]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 0 && passcodeFlag == true ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        {/* 2nd */}
        <Box
          height={wp(45)}
          width={wp(35)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 2 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[1]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 1 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        {/* 3rd */}
        <Box
          height={wp(45)}
          width={wp(35)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 3 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[2]}
              </Text>
            ) : passCode.length >= 3 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 2 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        {/* 4th */}
        <Box
          height={wp(45)}
          width={wp(35)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 4 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[2]}
              </Text>
            ) : passCode.length >= 4 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 3 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        {/* 5th */}
        <Box
          height={wp(45)}
          width={wp(35)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 5 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[2]}
              </Text>
            ) : passCode.length >= 5 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 4 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        {/* 6th */}
        <Box
          height={wp(45)}
          width={wp(35)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 5 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[2]}
              </Text>
            ) : passCode.length >= 5 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 4 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const SetupTapsigner = () => {
  // const steps = [
  //   {
  //     index: 1,
  //     title: 'Enter CVC Code',
  //     description: 'Please enter the CVC code on the back of your card',
  //     active: true,
  //     extraComponent: InputCvc,
  //     done: false,
  //   },
  //   {
  //     index: 2,
  //     title: 'Verifying Card',
  //     description: 'Checking if the card certificate is valid',
  //     active: false,
  //     extraComponent: null,
  //     done: false,
  //   },
  //   {
  //     index: 3,
  //     title: 'Setting & Accociating Tapsigner',
  //     description: 'Picking keys for your card and fetching xPub',
  //     active: false,
  //     extraComponent: null,
  //     done: false,
  //   },
  //   {
  //     index: 4,
  //     title: 'Setting up your Vault',
  //     description: 'Creating a new Vault with your card',
  //     active: false,
  //     extraComponent: null,
  //     done: false,
  //   },
  // ];

  // const [stepItems, setStepItems] = React.useState(steps);
  const [cvc, setCvc] = React.useState('');
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const { useRealm } = useContext(RealmWrapperContext);
  const [passcodeFlag] = useState(true);

  const realm = useRealm();
  const navigation = useNavigation();

  const card = React.useRef(new CKTapCard()).current;

  const withModal = (callback) => {
    return Platform.select({
      android: async () => {
        setNfcVisible(true);
        const resp = await card.nfcWrapper(callback);
        setNfcVisible(false);
        return resp;
      },
      ios: async () => card.nfcWrapper(callback),
    });
  };

  const onPressHandler = (digit) => {
    let temp = cvc;
    if (digit != 'x') {
      temp += digit;
      setCvc(temp);
    }
    if (cvc && digit == 'x') {
      setCvc(cvc.slice(0, -1));
    }
  };

  const updateStep = React.useCallback((currentStep, nextStep) => {
    const updatedSteps = stepItems.map((item) => {
      if (item.index === currentStep) {
        return { ...item, done: true, active: false };
      } else if (item.index === nextStep) {
        return { ...item, active: true };
      } else {
        return item;
      }
    });
    // setStepItems(updatedSteps);
  }, []);

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const dispatch = useDispatch();

  const createVault = useCallback((signers: VaultSigner[], scheme: VaultScheme) => {
    try {
      const newVaultInfo: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault(newVaultInfo));
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }, []);

  const integrateTapsigner = React.useCallback(() => {
    withModal(async () => {
      updateStep(1, 2);
      const status = await card.first_look();
      const isLegit = await card.certificate_check();
      if (isLegit) {
        await delay(1000);
        updateStep(2, 3);
        if (status.path) {
          const xpub = await card.get_xpub(cvc);
          await delay(1000);
          updateStep(3, 4);
          return { xpub, status };
        } else {
          await card.setup(cvc);
          const newCard = await card.first_look();
          const xpub = await card.get_xpub(cvc);
          return { xpub, status: newCard };
        }
      }
    })().then((resp) => {
      const { xpub, status } = resp;
      updateStep(4, 5);

      const networkType =
        config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
      const network = WalletUtilities.getNetworkByType(networkType);

      const signer: VaultSigner = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        type: SignerType.TAPSIGNER,
        signerName: 'Tapsigner',
        xpub,
        xpubInfo: {
          derivationPath: status.path,
        },
      };
      const scheme: VaultScheme = { m: 1, n: 1 };
      const isVaultCreated = createVault([signer], scheme);
      if (isVaultCreated) navigation.dispatch(CommonActions.navigate('NewHome'));
    });
  }, [cvc]);

  const MockVaultCreation = () => {
    if (config.APP_STAGE === APP_STAGE.DEVELOPMENT) {
      const networkType = NetworkType.TESTNET;
      const network = WalletUtilities.getNetworkByType(networkType);

      const { xpub, xpriv, derivationPath } = generateMockExtendedKey();
      const mockTapSigner: VaultSigner = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        type: SignerType.TAPSIGNER,
        signerName: 'Tapsigner',
        xpub: xpub,
        xpriv,
        xpubInfo: {
          derivationPath,
        },
      };

      const scheme: VaultScheme = { m: 1, n: 1 };
      const isVaultCreated = createVault([mockTapSigner], scheme);
      if (isVaultCreated) navigation.dispatch(CommonActions.navigate('NewHome'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Box flex={1}>
        <Box style={styles.header}>
          <HeaderTitle
            title="Setting up Tapsigner"
            subtitle="Enter the 6-digit code printed on back of your TAPSIGNER"
            onPressHandler={() => navigation.goBack()}
          />
        </Box>
        <TapGestureHandler numberOfTaps={3} onActivated={MockVaultCreation}>
          <ScrollView>
            {/* {stepItems.map((item) => (
            <Step item={item} cvc={cvc} setCvc={setCvc} callback={integrateTapsigner} />
          ))} */}
            <PinInputs
              passCode={cvc}
              passcodeFlag={passcodeFlag}
              passCodeBox={true}
              backgroundColor={'#FDF7F0'}
              textColor={'#041513'}
            />
          </ScrollView>
        </TapGestureHandler>
        <Text padding={5}>Lorem ipsum dolor sit amet, consectetur eiusmod tempor</Text>
        <Box flex={1} justifyContent={'flex-end'} flexDirection={'row'} mr={wp(15)}>
          <Buttons primaryText="Proceed" />
        </Box>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor={'#041513'}
          ClearIcon={<DeleteIcon />}
        />

        <NfcPrompt visible={nfcVisible} />
      </Box>
    </SafeAreaView>
  );
};

export default SetupTapsigner;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#F7F2EC',
    flex: 1,
    padding: 10,
  },
  header: {
    flex: 1,
    padding: '5%',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: '4%',
    marginHorizontal: '4%',
  },
  stepBodyContainer: {
    width: '80%',
  },
  circle: {
    margin: '5%',
    marginTop: 0,
    width: 25,
    height: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCircle: {
    backgroundColor: '#055146',
  },
  activeCircle: {
    backgroundColor: '#FAC48B',
  },
  inactiveCircle: {
    backgroundColor: '#E3E3E3',
  },
  input: {
    paddingHorizontal: 20,
    marginVertical: '3%',
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
});
