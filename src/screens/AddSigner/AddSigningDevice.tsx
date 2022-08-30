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
import { Ndef, NfcTech } from 'react-native-nfc-manager';
import React, { useContext, useEffect, useState } from 'react';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';

import Illustration from 'src/assets/images/Signerillustration.svg';
import BackIcon from 'src/assets/images/svgs/back.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { useDispatch } from 'react-redux';
import AddNewSigner from './AddNewSigner';

const Header = () => {
  const navigation = useNavigation();
  return (
    <Box flexDirection={'row'} justifyContent={'space-between'} px={'2%'}>
      <StatusBar barStyle={'light-content'} />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
    </Box>
  );
};

const SigningHeader = () => {
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  const navigation = useNavigation();

  return (
    <Box flexDirection={'column'} px={'5%'}>
      <Text color={'light.headerText'} fontSize={16}>
        {vault.AddSigningDevices}
      </Text>
      <Text color={'light.GreyText'}>{vault.torecoverVault}</Text>
      <Box alignItems={'center'} marginTop={'50%'}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AddNewSigner');
          }}
        >
          <Illustration />
        </TouchableOpacity>
      </Box>
      <Box marginTop={10} mx={'5'}>
        <Text color={'light.lightBlack'} fontSize={12}>
          {vault.Description}
        </Text>
      </Box>
    </Box>
  );
};

const SigningFooter = () => {
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];

  return (
    <Box justifyContent={'flex-end'} flex={1} mx={'5'} marginBottom={10}>
      <Text fontSize={14}>Note</Text>
      <Text color={'light.lightBlack'} fontSize={12}>
        {vault.Description}
      </Text>
      <Box bg={'transparent'} flexDirection={'row'} marginTop={6}>
        <View style={styles.dash}></View>
        <View style={styles.dot}></View>
      </Box>
    </Box>
  );
};

const AddSigningDevice = () => {
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <VStack m={'10%'}>
        <Header />
      </VStack>
      <VStack backgroundColor={'light.lightYellow'} px={wp(28)} borderTopLeftRadius={20} flex={1}>
        <SigningHeader />
        <SigningFooter />
      </VStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    position: 'relative',
  },
  knowMore: {
    backgroundColor: 'light.brownborder',
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'light.lightBlack',
  },
  buttonContainer: {
    height: 50,
    width: 120,
    borderRadius: 10,
  },
  dot: {
    backgroundColor: '#A7A7A7',
    width: 6,
    height: 4,
  },
  dash: {
    backgroundColor: '#676767',
    width: 26,
    height: 4,
    marginRight: 6,
  },
});
export default AddSigningDevice;
