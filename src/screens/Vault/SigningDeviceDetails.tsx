import { Box, HStack, Text, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  FlatList,
  InteractionManager,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';

import BackIcon from 'src/assets/icons/back.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import StatusBarComponent from 'src/components/StatusBarComponent';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import HealthCheckModal from 'src/components/HealthCheckModal';
import SuccessModal from 'src/components/SuccessModal';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import Illustration from 'src/assets/images/illustration.svg';

const Header = () => {
  const navigation = useNavigation();
  return (
    <Box flexDirection={'row'} justifyContent={'space-between'} px={'5%'}>
      <StatusBar barStyle={'light-content'} />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.knowMore}>
        <Text color={'light.white1'} fontSize={12} letterSpacing={0.84} fontWeight={100}>
          Learn More
        </Text>
      </TouchableOpacity>
    </Box>
  );
};

const SigningDevice = (SignerIcon, SignerName) => {
  const navigation = useNavigation();
  return (
    <Box flexDirection={'row'} px={'10%'} py={'5%'}>
      {SignerIcon.SignerIcon}
      <Box marginTop={2}>
        <Text fontSize={15}>{SignerIcon.SignerName}</Text>
        <Text fontSize={13}>Lorem ipsum dolor</Text>
      </Box>
    </Box>
  );
};

const SigningDeviceDetails = ({ route }) => {
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  const SignerIcon = route.params.SignerIcon;
  const SignerName = route.params.SignerName;
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [confirmHealthCheckModal, setconfirmHealthCheckModal] = useState(false);
  const [healthCheckView, setHealthCheckView] = useState(false);
  const [healthCheckSkipModal, setHealthCheckSkipModal] = useState(false);
  const [healthCheckSuccess, setHealthCheckSuccess] = useState(false);

  const closeHealthCheckSuccessView = () => setHealthCheckSuccess(false);

  const closeHealthCheck = () => {
    setHealthCheckModal(false);
  };

  const closeCVVModal = () => {
    setconfirmHealthCheckModal(false);
  };

  const closeHealthCheckView = () => setHealthCheckView(false);

  const healthCheckSkip = () => {
    setHealthCheckView(false);
    setHealthCheckSkipModal(true);
  };

  const closehealthCheckSkip = () => {
    setHealthCheckSkipModal(false);
  };

  const SkipHealthCheck = () => setHealthCheckSkipModal(false);

  const onPress = () => {
    setHealthCheckModal(false);
    setHealthCheckView(true);
  };

  const onPressCVV = () => {
    setconfirmHealthCheckModal(false);
    setHealthCheckSuccess(true);
  };

  const confirm = () => {
    setHealthCheckView(false);
    setconfirmHealthCheckModal(true);
  };

  const confirmHealthCheck = () => {
    setHealthCheckSuccess(false);
  };

  const HealthCheckContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>{/* <SuccessIcon /> */}</Box>
        <TapsignerSetupImage />
        <Text color={'#5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
        <Text color={'#5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
      </View>
    );
  };

  const HealthCheckSkipContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>{/* <SuccessIcon /> */}</Box>
        <Text color={'#5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
        <Text color={'#5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
      </View>
    );
  };

  const HealthCheckSuccessContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>{/* <SuccessIcon /> */}</Box>
        <Illustration />
        <Text color={'#5F6965'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {
            'You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing elit,'
          }
        </Text>
      </View>
    );
  };

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header />
        <SigningDevice SignerIcon={SignerIcon} SignerName={SignerName} />
      </Box>
      <ScrollView>
        <Box m={10}>
          <SigningDeviceChecklist />
        </Box>
      </ScrollView>
      <Box px={'10%'} py={'10%'}>
        <Text fontSize={13}>
          You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        </Text>
        <Box marginTop={10} flexDirection={'row'} justifyContent={'space-between'}>
          <Text
            marginTop={3}
            color={'light.greenText'}
            letterSpacing={0.8}
            fontWeight={300}
            fontSize={14}
          >
            Change Signing Device
          </Text>
          <LinearGradient
            colors={['#00836A', '#073E39']}
            style={styles.buttonContainer}
            start={{ x: -0.5, y: 1 }}
            end={{ x: 1, y: 1 }}
          >
            <Text
              justifyContent={'center'}
              color={'white'}
              textAlign={'center'}
              letterSpacing={0.8}
              fontWeight={300}
              fontSize={14}
              marginTop={3}
              onPress={() => {
                setHealthCheckModal(true);
              }}
            >
              Health Check
            </Text>
          </LinearGradient>
        </Box>
        <HealthCheckModal
          visible={healthCheckModal}
          closeHealthCheck={closeHealthCheck}
          title={vault.EditDescription}
          subTitle={vault.Description}
          SignerName={SignerName}
          SignerIcon={SignerIcon}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Proceed'}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
          onPress={onPress}
        />
        <SuccessModal
          visible={healthCheckView}
          close={closeHealthCheckView}
          title={'Health Check'}
          subTitle={'Keep your TAPSIGNER ready before proceeding'}
          buttonText={'Proceed'}
          buttonTextColor={'#FAFAFA'}
          cancelButtonText={'Skip'}
          cancelButtonColor={'#073E39'}
          cancelButtonPressed={healthCheckSkip}
          buttonPressed={confirm}
          Content={HealthCheckContent}
        />
        <SuccessModal
          visible={healthCheckSkipModal}
          close={closehealthCheckSkip}
          title={'Skipping Health Check'}
          subTitle={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
          }
          buttonText={'Confirm Now'}
          buttonTextColor={'#FAFAFA'}
          cancelButtonText={'Skip'}
          cancelButtonColor={'#073E39'}
          cancelButtonPressed={SkipHealthCheck}
          Content={HealthCheckSkipContent}
        />
        <HealthCheckModal
          visible={confirmHealthCheckModal}
          closeHealthCheck={closeCVVModal}
          title={'Setting up TapSigner'}
          subTitle={'Enter the CVV'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Proceed'}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
          onPress={onPressCVV}
        />
        <SuccessModal
          visible={healthCheckSuccess}
          close={closeHealthCheckSuccessView}
          title={'Health Check Successful'}
          subTitle={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
          }
          buttonText={'Confirm Now'}
          buttonTextColor={'#FAFAFA'}
          cancelButtonText={''}
          cancelButtonColor={'#073E39'}
          cancelButtonPressed={SkipHealthCheck}
          buttonPressed={confirmHealthCheck}
          Content={HealthCheckSuccessContent}
        />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    position: 'relative',
  },
  knowMore: {
    backgroundColor: '#725436',
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FAFCFC',
  },
  buttonContainer: {
    height: 50,
    width: 120,
    borderRadius: 10,
  },
});
export default SigningDeviceDetails;
