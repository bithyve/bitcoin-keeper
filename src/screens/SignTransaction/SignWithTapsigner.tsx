import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { Platform, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import useToastMessage from 'src/hooks/useToastMessage';
import { windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { getTapsignerErrorMessage } from 'src/hardware/tapsigner';

function SignWithTapsigner() {
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;

  const { params = { signTransaction: () => {}, signer: null } as any } = useRoute();
  const { signTransaction, textRef } = params;

  const onPressHandler = (digit) => {
    let temp = cvc;
    if (digit !== 'x') {
      temp += digit;
      setCvc(temp);
      textRef.current = temp;
    }
    if (cvc && digit === 'x') {
      const temp = cvc.slice(0, -1);
      setCvc(temp);
      textRef.current = temp;
    }
  };

  const { showToast } = useToastMessage();

  const onDeletePressed = () => {
    const temp = cvc.slice(0, -1);
    setCvc(temp);
    textRef.current = temp;
  };

  const sign = async () => {
    try {
      signTransaction();
      navigation.goBack();
    } catch (err) {
      const errorMessage = getTapsignerErrorMessage(err);
      if (errorMessage) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(errorMessage);
        showToast(errorMessage, null, 2000, true);
      } else if (err.toString() === 'Error') {
        // do nothing when nfc is dismissed by the user
      } else {
        showToast('Something went wrong, please try again!', null, 2000, true);
      }
      setNfcVisible(false);
      card.endNfcSession();
    }
  };

  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle
          title="Sign with TAPSIGNER"
          subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
          onPressHandler={() => navigation.goBack()}
        />
        <ScrollView>
          <TextInput
            style={styles.input}
            secureTextEntry
            showSoftInputOnFocus={false}
            value={cvc}
            onChangeText={setCvc}
          />
          <Text style={styles.heading} color="light.greenText">
            You will be scanning the TAPSIGNER after this step
          </Text>
          <Box flex={1} justifyContent="flex-end" flexDirection="row" mr={wp(15)}>
            <Buttons primaryText="Sign" primaryCallback={sign} />
          </Box>
        </ScrollView>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor="#041513"
          onDeletePressed={onDeletePressed}
        />
        <NfcPrompt visible={nfcVisible} close={() => setNfcVisible(false)} />
      </Box>
    </ScreenWrapper>
  );
}

export default SignWithTapsigner;

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: '5%',
    marginBottom: windowHeight > 850 ? 0 : '25%',
  },
  input: {
    margin: '5%',
    paddingHorizontal: 15,
    width: wp(305),
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
  heading: {
    margin: '5%',
    padding: 5,
    width: windowWidth * 0.8,
    fontSize: 13,
    letterSpacing: 0.65,
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginRight: wp(15),
  },
});
