import { Platform, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { CKTapCard } from 'cktap-protocol-react-native';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { changePin, handleTapsignerError } from 'src/hardware/tapsigner';
import Buttons from 'src/components/Buttons';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useEffect, useState } from 'react';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Text from 'src/components/KeeperText';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import { ScrollView } from 'react-native-gesture-handler';
import KeeperModal from 'src/components/KeeperModal';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import SuccessIllustration from 'src/assets/images/illustration.svg';
import { hp, wp } from 'src/constants/responsive';
import { KeeperPasswordInput } from 'src/components/KeeperPasswordInput';
import WalletHeader from 'src/components/WalletHeader';

const INPUTS = {
  CVC: 'CVC',
  NEW_CVC: 'NEW_CVC',
  CONFIRM_CVC: 'CONFIRM_CVC',
};

function ChangeTapsignerPin() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);
  const [CVC, setCVC] = useState('');
  const [newCVC, setNewCVC] = useState('');
  const [confCVC, setConfCVC] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showActivatedModal, setShowActivatedModal] = useState(false);
  // const activeInput = React.useRef(null);
  const [activeInput, setActiveInput] = useState(null);

  const [ctaDisabled, setCtaDisabled] = useState(true);

  const { showToast } = useToastMessage();

  const onPressHandler = (digit) => {
    const temp =
      (activeInput === INPUTS.CVC ? CVC : activeInput === INPUTS.NEW_CVC ? newCVC : confCVC) || '';
    const newTemp = digit === 'x' ? temp.slice(0, -1) : temp + digit;
    switch (activeInput) {
      case INPUTS.CVC:
        setCVC(newTemp);
        break;
      case INPUTS.NEW_CVC:
        setNewCVC(newTemp);
        break;
      case INPUTS.CONFIRM_CVC:
        setConfCVC(newTemp);
        break;
      default:
        break;
    }
  };

  const onDeletePressed = () => {
    const currentInput = activeInput;
    if (currentInput) {
      const inputVal =
        currentInput === INPUTS.CVC ? CVC : currentInput === INPUTS.NEW_CVC ? newCVC : confCVC;
      const newInputVal = inputVal.slice(0, inputVal.length - 1);
      if (currentInput === INPUTS.CVC) setCVC(newInputVal);
      else if (currentInput === INPUTS.NEW_CVC) setNewCVC(newInputVal);
      else setConfCVC(newInputVal);
    }
  };

  const activatePinAction = React.useCallback(async () => {
    try {
      const res = await withModal(async () => changePin(card, CVC, newCVC))();
      if (res) {
        navigation.dispatch(CommonActions.goBack());
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Changed CVC successfully!`);
        showToast('Tapsigner CVC changed successfully', <TickIcon />);
      } else {
        if (Platform.OS === 'ios')
          NFC.showiOSErrorMessage(`Error while changing Tapsigner pin. Please try again`);
        else showToast(`Error while changing Tapsigner pin. Please try again`);
      }
    } catch (error) {
      const errorMessage = handleTapsignerError(error, navigation);
      if (errorMessage) {
        showToast(errorMessage, <ToastErrorIcon />, IToastCategory.DEFAULT, 3000, true);
      }
    } finally {
      closeNfc();
      card.endNfcSession();
    }
  }, [CVC, newCVC]);

  function ActivatePinContent() {
    return (
      <>
        <Box style={styles.modalIllustration}>
          <TapsignerSetupImage />
        </Box>
        <Box style={styles.modalTextCtr}>
          <Box style={styles.dot} backgroundColor={`${colorMode}.primaryText`} />
          <Text color={`${colorMode}.greenText`} style={styles.modalText}>
            Click continue and scan your TAPSIGNER to activate the new PIN.
          </Text>
        </Box>
      </>
    );
  }
  function PinActivatedContent() {
    return (
      <Box style={styles.modalIllustration}>
        <SuccessIllustration />
      </Box>
    );
  }

  useEffect(() => {
    setCtaDisabled(
      !(
        CVC?.length > 5 &&
        newCVC?.length > 5 &&
        confCVC?.length > 5 &&
        newCVC !== CVC &&
        newCVC === confCVC
      )
    );
  }, [CVC, newCVC, confCVC]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title="Change PIN"
        subTitle="Make sure to back up your TAPSIGNER before setting a new PIN"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.btnContainer}>
          <FieldWithLabel
            label={'Existing PIN'}
            placeholder="Existing PIN"
            value={CVC}
            onPress={() => setActiveInput(INPUTS.CVC)}
            isActive={activeInput === INPUTS.CVC}
          />
          <FieldWithLabel
            label={'New PIN'}
            placeholder="New PIN"
            value={newCVC}
            onPress={() => setActiveInput(INPUTS.NEW_CVC)}
            isActive={activeInput === INPUTS.NEW_CVC}
          />
          <FieldWithLabel
            label={'Confirm PIN'}
            placeholder="Confirm PIN"
            value={confCVC}
            onPress={() => setActiveInput(INPUTS.CONFIRM_CVC)}
            isActive={activeInput === INPUTS.CONFIRM_CVC}
          />
        </Box>
      </ScrollView>

      <KeyPadView
        onPressNumber={onPressHandler}
        onDeletePressed={onDeletePressed}
        keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      <Box style={styles.ctaContainer}>
        <Buttons
          primaryText="Continue"
          primaryCallback={() => setShowPinModal(true)}
          primaryDisable={ctaDisabled}
          fullWidth
        />
      </Box>
      <KeeperModal
        visible={showPinModal}
        close={() => setShowPinModal(false)}
        showCloseIcon={false}
        title="Activate New PIN"
        subTitle="Get your TAPSIGNER ready before proceeding"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText="Continue"
        secondaryButtonText="Cancel"
        secondaryCallback={() => setShowPinModal(false)}
        buttonCallback={() => {
          setShowPinModal(false);
          activatePinAction();
          //   setShowActivatedModal(true);
        }}
        Content={ActivatePinContent}
      />
      <KeeperModal
        visible={showActivatedModal}
        close={() => setShowActivatedModal(false)}
        showCloseIcon={false}
        title="Pin Activated"
        subTitle="Your TAPSIGNER new pin has been activated"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText="Okay"
        buttonCallback={() => {
          console.log('Pressed pin activated btn');
          setShowActivatedModal(false);
          navigation.dispatch(CommonActions.goBack());
        }}
        Content={PinActivatedContent}
      />
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
    </ScreenWrapper>
  );
}

const FieldWithLabel = ({ label, value, onPress, isActive, placeholder }) => {
  return (
    <Box marginTop={4}>
      <Text>{label}</Text>
      <KeeperPasswordInput
        value={value}
        onPress={onPress}
        isActive={isActive}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default ChangeTapsignerPin;

const styles = StyleSheet.create({
  btnContainer: {
    marginHorizontal: 15,
    marginTop: 6,
  },
  modalIllustration: {
    alignSelf: 'center',
    marginBottom: hp(20),
    marginRight: wp(40),
  },
  modalTextCtr: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5 / 2,
    alignSelf: 'center',
  },
  modalText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
  ctaContainer: {
    marginHorizontal: 15,
    marginTop: '3%',
  },
});
