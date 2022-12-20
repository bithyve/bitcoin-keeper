import { Box, Text } from 'native-base';
import { StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import DeleteIcon from 'src/assets/images/delete.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import useToastMessage from 'src/hooks/useToastMessage';
import { wp } from 'src/common/data/responsiveness/responsive';

function SignWithTapsigner() {
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;

  const { params = { signTransaction: () => {}, signer: null } as any } = useRoute();
  const { signTransaction, textRef } = params;

  const onPressHandler = (digit) => {
    let temp = cvc;
    if (digit != 'x') {
      temp += digit;
      setCvc(temp);
      textRef.current = temp;
    }
    if (cvc && digit == 'x') {
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
      let message;
      if (err.toString().includes('401')) {
        message = 'Please check the cvc entered and try again!';
      } else if (err.toString().includes('429')) {
        message = 'You have exceed the cvc retry limit. Please unlock the card and try again!';
      } else if (err.toString().includes('205')) {
        message = 'Something went wrong, please try again!';
      } else {
        message = err.toString();
      }
      NFC.showiOSMessage(message);
      showToast(message, null, 2000, true);
      setNfcVisible(false);
      card.endNfcSession();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Box flex={1}>
        <Box style={styles.header}>
          <HeaderTitle
            title="Sign with Tapsigner"
            subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
            onPressHandler={() => navigation.goBack()}
          />
        </Box>
        <ScrollView>
          <TextInput
            style={styles.input}
            secureTextEntry
            showSoftInputOnFocus={false}
            value={cvc}
            onChangeText={setCvc}
          />
          <Text
            padding={5}
            fontWeight={200}
            width={wp(250)}
            fontSize={13}
            letterSpacing={0.65}
            color="light.greenText"
          >
            You will be scanning the TAPSIGNER after this step
          </Text>
          <Box flex={1} justifyContent="flex-end" flexDirection="row" mr={wp(15)}>
            <Buttons primaryText="Sign" primaryCallback={sign} />
          </Box>
        </ScrollView>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor="#041513"
          ClearIcon={<DeleteIcon />}
          onDeletePressed={onDeletePressed}
        />
        <NfcPrompt visible={nfcVisible} />
      </Box>
    </SafeAreaView>
  );
}

export default SignWithTapsigner;

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
    margin: '5%',
    width: wp(305),
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
});
