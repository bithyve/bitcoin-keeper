import { Box, Modal, Input } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Close from 'src/assets/icons/modal_close.svg';
import LinearGradient from 'react-native-linear-gradient';
import React, { useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocalizationContext } from 'src/common/content/LocContext';
import BTC from 'src/assets/images/btc_white.svg';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { setInvalidPassword } from 'src/store/reducers/bhr';
import Text from 'src/components/KeeperText';
import KeeperModal from './KeeperModal';

function PasswordModal(props) {
  const {
    visible,
    closePasswordModal,
    title = 'Title',
    subTitle = null,
    dscription = 'Description',
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
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
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={buttonBackground}
          style={styles.ctabutton}
        >
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
        </LinearGradient>
        <Text color="#073B36" fontSize={13} p={2}>
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
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={modalBackground}
          style={styles.container}
        >
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
            backgroundColor="#FDF7F0"
            placeholder="Enter Password"
            w="90%"
            marginY={2}
            height="10"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (invalidPassword) {
                dispatch(setInvalidPassword(false));
              }
            }}
          />
          {invalidPassword && (
            <Text alignSelf="flex-start" mx={4} color="red.400">
              Invalid password
            </Text>
          )}
          <Text style={styles.subTitle} width="90%" light color={textColor}>
            Hint: {backup ? backup.hint : ''}
          </Text>
          <Box alignSelf="flex-end" flexDirection="row" bg="transparent">
            <TouchableOpacity
              disabled={password.trim() === ''}
              onPress={() => props.onPressNext(password)}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={buttonBackground}
                style={styles.cta}
              >
                <Text fontSize={13} bold letterSpacing={1} color={buttonTextColor}>
                  {buttonText}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Box>
        </LinearGradient>
        <KeeperModal
          visible={recoverySuccessModal}
          close={closeRecovery}
          title={seed.walletRecoverySuccessful}
          subTitle={seed.seedDescription}
          buttonBackground={['#00836A', '#073E39']}
          buttonText="View Wallet"
          buttonTextColor="#FAFAFA"
          buttonCallback={passwordScreen}
          textColor="#041513"
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
