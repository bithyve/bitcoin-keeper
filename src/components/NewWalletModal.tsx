import { Box, Modal } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Close from 'src/assets/icons/modal_close.svg';
import LinearGradient from 'react-native-linear-gradient';
import React, { useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import GoogleDrive from 'src/assets/images/drive.svg';
import ICloud from 'src/assets/images/icloud.svg';
import Text from 'src/components/KeeperText';
import KeeperModal from './KeeperModal';
import CheckBox from './Checkbox';

function NewWalletModal(props) {
  const {
    visible,
    close,
    title = 'Title',
    createTitle = 'create Title',
    createSubTitle = 'create Sub Title',
    newButton = 'new Button',
    newButtonDesc = 'new Button Desc',
    existingButtonTitle = 'existing Button Title',
    existingButtonSubTitle = 'existing Button SubTitle',
    seedButton = 'seed Button',
    seedButtonDesc = 'seed Button Desc',
    cloudButton = 'cloud Button',
    cloudButtonDesc = 'cloud Button Desc',
    mainDesc = 'main Desc',
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = 'Button text',
    buttonCancel = 'Button Cancel',
    buttonTextColor = 'white',
    buttonCancelColor = 'buttonCancel',
    buttonCallback = props.close || null,
    textColor = '#000',
    checkBoxColor = '#D8A572',
  } = props;
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();

  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;

  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [newValue, setNewValue] = useState(false);
  const [seedValue, setSeedValue] = useState(false);
  const [cloudValue, setCloudValue] = useState(false);

  const openModal = () => setModalVisible(true);

  const onPress = () => {
    if (newValue === true) {
      close();
    } else if (seedValue === true) {
      buttonCallback();
      navigation.navigate('EnterSeedScreen');
    } else if (cloudValue === true) {
      buttonCallback();
      openModal();
    } else {
      close();
    }
  };
  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });

  const passwordScreen = () => {
    setModalVisible(false);
    setPasswordModal(true);
  };

  const closePassword = () => {
    setPasswordModal(false);
  };

  function RecoverWalletScreen() {
    const IconName = Platform.OS == 'ios' ? <ICloud /> : <GoogleDrive />;

    return (
      <View>
        <View style={{ backgroundColor: '#FDF7F0', marginVertical: 20 }}>
          <Box flexDirection="row" marginY={5} alignSelf="center">
            {IconName}
            <Text color="#4F5955" marginLeft={5} marginTop={1}>
              dastanp@gmail.com
            </Text>
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            <View>
              <Text fontSize={12} color="#4F5955">
                Folder: Blue Wallet Backup
              </Text>
              <Text fontSize={12} color="#4F5955">
                Pro Tier Backup
              </Text>
            </View>
            <View>
              <Text fontSize={12} color="#4F5955">
                Backed Up
              </Text>
              <Text fontSize={12} color="#4F5955">
                July 15, 2021
              </Text>
            </View>
          </Box>
        </View>
        <Text color="#073B36" fontSize={13} fontFamily="body" p={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, iqua
        </Text>
      </View>
    );
  }

  return (
    <Modal
      isOpen={visible}
      onClose={close}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      justifyContent="flex-end"
    >
      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={modalBackground}
          style={styles.container}
        >
          <TouchableOpacity style={styles.close} onPress={buttonCallback}>
            <Close />
          </TouchableOpacity>
          <Modal.Header
            alignSelf="flex-start"
            borderBottomWidth={0}
            backgroundColor="transparent"
            width="90%"
          >
            <Text style={styles.title} fontFamily="body" color={textColor} paddingBottom={1}>
              {title}
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Text style={styles.subTitle} fontFamily="body" color={textColor}>
              {createTitle}
            </Text>
            <Text style={styles.subTitle2} fontFamily="body" color={textColor}>
              {createSubTitle}
            </Text>
          </Modal.Body>
          <Modal.Body>
            <CheckBox
              onPress={() => {
                setNewValue(!newValue);
                setCloudValue(false);
                setSeedValue(false);
              }}
              title={newButton}
              subTitle={newButtonDesc}
              isChecked={newValue}
            />
          </Modal.Body>
          <Modal.Body>
            <Text style={styles.subTitle} fontFamily="body" color={textColor}>
              {existingButtonTitle}
            </Text>
            <Text style={styles.subTitle2} fontFamily="body" color={textColor}>
              {existingButtonSubTitle}
            </Text>
          </Modal.Body>
          <Modal.Body>
            <CheckBox
              onPress={() => {
                setSeedValue(!seedValue);
                setCloudValue(false);
                setNewValue(false);
              }}
              title={seedButton}
              subTitle={seedButtonDesc}
              isChecked={seedValue}
            />
          </Modal.Body>
          <Modal.Body>
            <CheckBox
              onPress={() => {
                setCloudValue(!cloudValue);
                setSeedValue(false);
                setNewValue(false);
              }}
              title={cloudButton}
              subTitle={cloudButtonDesc}
              isChecked={cloudValue}
            />
          </Modal.Body>
          <Modal.Body>
            <Text style={styles.subTitle2} fontFamily="body" color={textColor}>
              {mainDesc}
            </Text>
          </Modal.Body>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Box bg="transparent" flexDirection="row" marginLeft={5} marginTop={4}>
              <View style={styles.dot} />
              <View style={styles.dash} />
            </Box>
            <Box bg="transparent" flexDirection="row" marginRight={5}>
              <TouchableOpacity onPress={buttonCallback}>
                <Text
                  fontSize={13}
                  fontFamily="body"
                  bold
                  letterSpacing={1}
                  marginTop={2}
                  color={buttonCancelColor}
                  marginRight={5}
                >
                  {buttonCancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPress}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={buttonBackground}
                  style={styles.cta}
                >
                  <Text
                    fontSize={13}
                    fontFamily="body"
                    bold
                    letterSpacing={1}
                    color={buttonTextColor}
                  >
                    {buttonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
          </View>
        </LinearGradient>
        <KeeperModal
          visible={modalVisible}
          close={close}
          title={Platform.OS == 'ios' ? 'Recover wallet from iCloud' : 'Recover wallet from Drive'}
          subTitle={seed.seedDescription}
          buttonBackground={['#00836A', '#073E39']}
          buttonText="Next"
          buttonTextColor="#FAFAFA"
          buttonCallback={passwordScreen}
          textColor="#041513"
          Content={RecoverWalletScreen}
        />
        {/* <PasswordModal
          visible={passwordModal}
          closePasswordModal={closePassword}
          title={'Confirm Password'}
          subTitle={seed.seedDescription}
          dscription={seed.seedDescription}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Next'}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
        /> */}
      </Modal.Content>
    </Modal>
  );
}

export default NewWalletModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    // alignItems: 'center',
    padding: '4%',
    paddingVertical: '5%',
  },
  title: {
    fontSize: 23,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 14,
    // letterSpacing: 1,
  },
  subTitle2: {
    color: '#5F6965',
    fontSize: 15,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  close: {
    alignSelf: 'flex-end',
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
});
