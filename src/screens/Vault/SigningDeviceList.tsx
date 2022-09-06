import { TouchableOpacity } from 'react-native';
import { Box, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import nfcManager from 'react-native-nfc-manager';
import { ScaledSheet } from 'react-native-size-matters';
import { ScrollView } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
//components
import HardwareModalMap from './HardwareModalMap';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import { SignerType } from 'src/core/wallets/enums';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { WalletMap } from './WalletMap';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
//asserts
import Alert from 'src/assets/images/alert_illustration.svg'
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';

type HWProps = {
  type: SignerType;
  first?: boolean;
  last?: boolean;
};

const SigningDeviceList = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const [nfcAlert, setNfcAlert] = useState(false);
  const [visible, setVisible] = useState(false);
  const vault = translations['vault'];

  useEffect(() => {
    getNfcSupport()
  }, [])

  const getNfcSupport = async () => {
    const isSupported = await nfcManager.isSupported()
    setNfcAlert(!isSupported)
  }

  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {

    const onPress = () => {
      open();
    };


    const open = () => setVisible(true);
    const close = () => setVisible(false);

    return (
      <>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <Box
            backgroundColor={'light.lightYellow'}
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box
              alignItems={'center'}
              height={windowHeight * 0.08}
              flexDirection={'row'}
              style={{
                paddingVertical: hp(25),
                paddingLeft: wp(40),
              }}
            >
              <Box
                style={{
                  marginRight: wp(20),
                  width: wp(15),
                }}
              >
                {WalletMap(type).Icon}
              </Box>
              <Box opacity={0.3} backgroundColor={'light.divider'} height={hp(24)} width={0.5} />
              <Box
                style={{
                  marginLeft: wp(23),
                }}
              >
                {WalletMap(type).Logo}
              </Box>
            </Box>
            <Box
              opacity={0.1}
              backgroundColor={'light.divider'}
              width={windowWidth * 0.8}
              height={0.5}
            />
          </Box>
        </TouchableOpacity>
        <HardwareModalMap visible={visible} close={close} type={type} />
      </>
    );
  };

  const nfcAlertConternt = () => {
    return (
      <Box>
        <Box
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Alert />
        </Box>
        <Text
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          width={wp(260)}
          color={'light.modalText'}
          marginY={4}

        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        </Text>
      </Box>
    )
  }

  const BulletPoint = ({ description }: { description: string }) => {
    return (
      <Box
        flexDirection={'row'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Box
          width={2}
          height={2}
          borderRadius={10}
          backgroundColor={'light.modalText'}
        />
        <Text
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          width={wp(260)}
          color={'light.modalText'}
          marginY={2}
          marginLeft={3}
        >
          {description}
        </Text>
      </Box>
    )
  }

  const settingSigningServer = () => {
    return (
      <Box>
        {/* { this assert needs to be updated  } */}
        <Alert />
        <BulletPoint description={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'} />
        <BulletPoint description={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'} />
      </Box>
    )
  }

  const setUpMobileKey = () => {
    return (
      <Box>
        {/* { this assert needs to be updated  } */}
        <Alert />
        <BulletPoint description={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'} />
        <BulletPoint description={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'} />
      </Box>
    )
  }
  const otpContent = () => {
    const [otp, setOtp] = useState('')

    console.log(otp);

    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text != 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text == 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = (text) => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(280)} >
        <Box>
          <CVVInputsView
            passCode={otp}
            passcodeFlag={false}
            backgroundColor={true}
            textColor={true}

          />
          <Text
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            width={wp(290)}
            color={'light.modalText'}
            marginTop={2}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
          </Text>
          <Box mt={10} alignSelf={'flex-end'} mr={2}>
            <Box>
              <CustomGreenButton onPress={() => { }} value={'proceed'} />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={'light.lightBlack'}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    )
  }
  const passwordEnter = () => {
    const [password, setPassword] = useState('')

    console.log(password);

    const onPressNumber = (text) => {
      let tmpPasscode = password;
      if (password.length < 6) {
        if (text != 'x') {
          tmpPasscode += text;
          setPassword(tmpPasscode);
        }
      }
      if (password && text == 'x') {
        setPassword(password.slice(0, -1));
      }
    };

    const onDeletePressed = (text) => {
      setPassword(password.slice(0, password.length - 1));
    };

    return (
      <Box width={hp(280)} >
        <Box>
          <CVVInputsView
            passCode={password}
            passcodeFlag={false}
            backgroundColor={true}
            textColor={true}

          />
          <Text
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            width={wp(290)}
            color={'light.modalText'}
            marginTop={2}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
          </Text>
          <Box mt={10} alignSelf={'flex-end'} mr={2}>
            <Box>
              <CustomGreenButton onPress={() => { }} value={'proceed'} />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={'light.lightBlack'}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    )
  }
  return (
    <Box style={styles.container}>
      <StatusBarComponent padding={50} />
      <Box marginX={10}>
        <HeaderTitle
          title={vault.SelectSigner}
          subtitle={vault.ForVault}
          onPressHandler={() => navigation.navigate('NewHome')}
          headerTitleColor={'light.headerTextTwo'}
        />
      </Box>
      <Box alignItems={'center'} justifyContent={'center'}>
        <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
          <Box paddingY={'4'}>
            {[
              'COLDCARD',
              'TAPSIGNER',
              'LEDGER',
              'TREZOR',
              'KEYSTONE',
              'PASSPORT',
              'JADE',
              // 'KEEPER',
              'POLICY_SERVER',
              'MOBILE_KEY',
            ].map((type: SignerType, index: number) => (
              <HardWareWallet type={type} first={index === 0} last={index === 9} />
            ))}
          </Box>
        </ScrollView>
        <Text
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          fontWeight={100}
          color={'light.lightBlack'}
          width={wp(300)}
          lineHeight={20}
          marginTop={hp(20)}
        >
          {vault.VaultInfo}{' '}
          <Text fontStyle={'italic'} fontWeight={'bold'}>
            Contact Us
          </Text>
        </Text>
        <KeeperModal
          visible={nfcAlert}
          close={() => { setNfcAlert(false) }}
          title={'NFC Not supported'}
          subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'  CTA  '}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
          butt
          Content={nfcAlertConternt}
        />
        <KeeperModal
          visible={false}
          close={() => { }}
          title={'Setting up a Signing Server'}
          subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Continue'}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
          Content={settingSigningServer}
        />
        <KeeperModal
          visible={false}
          close={() => { }}
          title={'Set up a Mobile Key'}
          subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Continue'}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
          Content={setUpMobileKey}
        />
        <KeeperModal
          visible={false}
          close={() => { }}
          title={'Confirm OTP to setup 2FA'}
          subTitle={'Lorem ipsum dolor sit amet, '}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor={'#041513'}
          Content={otpContent}
        />
        <KeeperModal
          visible={false}
          close={() => { }}
          title={'Enter your password'}
          subTitle={'Lorem ipsum dolor sit amet, '}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor={'#041513'}
          Content={passwordEnter}
        />
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
});

export default SigningDeviceList;
