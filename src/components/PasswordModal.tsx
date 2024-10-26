import { Box, Modal, Input, useColorMode } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Close from 'src/assets/images/modal_close.svg';
import React, { useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BTC from 'src/assets/images/btc_white.svg';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { setInvalidPassword } from 'src/store/reducers/bhr';
import Text from 'src/components/KeeperText';
import KeeperModal from './KeeperModal';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function PasswordModal(props) {
  const { colorMode } = useColorMode();
  const {
    visible,
    closePasswordModal,
    title = 'Title',
    subTitle = null,
    dscription = 'Description',
    modalBackground = [`${colorMode}.secondaryBackground`, `${colorMode}.secondaryBackground`],
    buttonBackground = [`${colorMode}.gradientStart`, `${colorMode}.gradientEnd`],
    buttonText = 'Button text',
    buttonTextColor = 'white',
    buttonCallback = props.closePasswordModal || null,
    textColor = '#000',
    backup,
  } = props;
  const dispatch = useAppDispatch();
  const { invalidPassword } = useAppSelector((state) => state.bhr);
  const { bottom } = useSafeAreaInsets();
  const [recoverySuccessModal, setrecoverySuccessModal] = useState(false);
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const closeRecovery = () => setrecoverySuccessModal(false);
  const openRecovery = () => {
    closePasswordModal();
    setrecoverySuccessModal(true);
  };

  const passwordScreen = () => {
    setrecoverySuccessModal(false);
  };

  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;

  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });

  function RecoverWalletScreen() {
    return (
      <View>
        <Box style={styles.ctabutton} backgroundColor={`${colorMode}.greenButtonBackground`}>
          <Text textAlign="right" fontSize={12} color={buttonTextColor}>
            Last Backup: July 15, 2021
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ marginTop: 10, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text fontSize={16} bold color={buttonTextColor}>
                Blue Wallet
              </Text>
              <Text fontSize={14} color={buttonTextColor}>
                Lorem Ipsum
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <BTC style={{ marginTop: 15, marginRight: 5 }} />
                <Text textAlign="right" marginBottom={15} fontSize={28} color={buttonTextColor}>
                  0.000090
                </Text>
              </View>
            </View>
          </View>
        </Box>
        <Text color={`${colorMode}.greenText`} fontSize={13} padding={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, iqua
        </Text>
      </View>
    );
  }

  return (
    <Modal
      isOpen={visible}
      onClose={closePasswordModal}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      marginTop="20%"
      //   justifyContent={'flex-end'}
    >
      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        <Box style={styles.container} backgroundColor={`${colorMode}.modalWhiteBackground`}>
          <TouchableOpacity style={styles.close} onPress={closePasswordModal}>
            <Close />
          </TouchableOpacity>
          <Modal.Header
            alignSelf="flex-start"
            borderBottomWidth={0}
            backgroundColor="transparent"
            width="90%"
          >
            <Text style={styles.title} color={textColor} paddingBottom={1}>
              {title}
            </Text>
            <Text style={styles.subTitle} light color={textColor}>
              {subTitle}
            </Text>
          </Modal.Header>
          <Input
            placeholderTextColor="grey"
            backgroundColor={`${colorMode}.primaryBackground`}
            placeholder="Enter Password"
            width="90%"
            marginY={2}
            height="10"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (invalidPassword) {
                dispatch(setInvalidPassword(false));
              }
            }}
            _input={
              colorMode === 'dark' && {
                selectionColor: Colors.SecondaryWhite,
                cursorColor: Colors.SecondaryWhite,
              }
            }
          />
          {invalidPassword && (
            <Text alignSelf="flex-start" mx={4} color="red.400">
              Invalid password
            </Text>
          )}
          <Text style={styles.subTitle} light color={textColor}>
            Hint: {backup ? backup.hint : ''}
          </Text>
          <Box alignSelf="flex-end" flexDirection="row" backgroundColor="transparent">
            <TouchableOpacity
              disabled={password.trim() === ''}
              onPress={() => props.onPressNext(password)}
            >
              <Box style={styles.cta} backgroundColor={`${colorMode}.greenButtonBackground`}>
                <Text fontSize={13} bold letterSpacing={1} color={buttonTextColor}>
                  {buttonText}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
        <KeeperModal
          visible={recoverySuccessModal}
          close={closeRecovery}
          title={seed.walletRecoverySuccessful}
          subTitle={seed.seedDescription}
          buttonText="View Wallet"
          buttonTextColor={`${colorMode}.buttonText`}
          buttonCallback={passwordScreen}
          textColor={`${colorMode}.primaryText`}
          Content={RecoverWalletScreen}
        />
      </Modal.Content>
    </Modal>
  );
}

export default PasswordModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    padding: '4%',
    paddingVertical: '5%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 1,
    width: '90%',
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  ctabutton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  close: {
    alignSelf: 'flex-end',
  },
});
