import { Box, HStack, Text, VStack } from 'native-base';
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
  const wallet = translations['wallet'];
  const SignerIcon = route.params.SignerIcon;
  const SignerName = route.params.SignerName;

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
            >
              Health Check
            </Text>
          </LinearGradient>
        </Box>
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
