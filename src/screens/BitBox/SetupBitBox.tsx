import { Alert, Platform, StyleSheet, TextInput } from 'react-native';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { ScrollView, TapGestureHandler } from 'react-native-gesture-handler';
import { getMockTapsignerDetails, getTapsignerDetails } from 'src/hardware/tapsigner';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import config, { APP_STAGE } from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { isTestnet } from 'src/common/constants/Bitcoin';
import { checkSigningDevice } from '../Vault/AddSigningDevice';

function SetupBitBox() {
  const [cvc, setCvc] = React.useState('');
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  //const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);

  const onPressHandler = (digit) => {
    let temp = cvc;
    if (digit !== 'x') {
      temp += digit;
      setCvc(temp);
    }
    if (cvc && digit === 'x') {
      setCvc(cvc.slice(0, -1));
    }
  };
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const onDeletePressed = () => {
    setCvc(cvc.slice(0, cvc.length - 1));
  };

  const isAMF = isTestnet();


  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle
          title="Setting up TAPSIGNER"
          subtitle="Enter the 6-32 digit code printed on back of your TAPSIGNER"
          onPressHandler={() => navigation.goBack()}
        />
        <TapGestureHandler numberOfTaps={3}>
          <ScrollView>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              secureTextEntry
              showSoftInputOnFocus={false}
            />
            <Text style={styles.heading} color="light.greenText">
              You will be scanning the TAPSIGNER after this step
            </Text>
            <Box style={styles.btnContainer}>
              <Buttons primaryText="Proceed" />
            </Box>
          </ScrollView>
        </TapGestureHandler>
        <KeyPadView
          onPressNumber={onPressHandler}
          keyColor="#041513"
          onDeletePressed={onDeletePressed}
        />
        {/* <NfcPrompt visible={nfcVisible} /> */}
      </Box>
    </ScreenWrapper>
  );
}

export default SetupBitBox;

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
