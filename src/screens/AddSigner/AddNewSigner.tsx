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

import Add from 'src/assets/images/svgs/add.svg';
import TapSigner from 'src/assets/images/svgs/icon_tapsigner.svg';
import BackIcon from 'src/assets/images/svgs/back.svg';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { useDispatch } from 'react-redux';

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

  return (
    <Box flexDirection={'column'} px={'5%'}>
      <Text color={'light.headerText'} fontSize={16}>
        {vault.AddSigningDevices}
      </Text>
      <Text color={'light.GreyText'}>{vault.torecoverVault}</Text>
    </Box>
  );
};

const SigningFooter = () => {
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];

  return (
    <Box justifyContent={'flex-end'} flex={1} mx={'5'} marginBottom={10}>
      <Box bg={'transparent'} flexDirection={'row'} marginTop={4}>
        <View style={styles.dash}></View>
        <View style={styles.dot}></View>
      </Box>
    </Box>
  );
};

const SignersList = () => {
  const navigation = useNavigation();

  return (
    <Box my={10}>
      <Box flexDirection={'row'}>
        <TapSigner />
        <Box my={1}>
          <Text color={'light.lightBlack'} fontSize={14}>
            TapSigner
          </Text>
          <Text color={'light.GreyText'} fontSize={12}>
            Added on 12 January 2022
          </Text>
        </Box>
      </Box>
      <Box my={5} backgroundColor={'light.GreyText'} width={'100%'} height={0.3}></Box>
      <Box my={5} mx={3} flexDirection={'row'} justifyContent={'space-between'}>
        <Box flexDirection={'row'}>
          <Box my={1}>
            <Add />
          </Box>
          <Box mx={3}>
            <Text color={'light.lightBlack'} fontSize={14}>
              2nd Signer
            </Text>
            <Text color={'light.GreyText'} fontSize={12}>
              Lorem ipsum dolor sit amet
            </Text>
          </Box>
        </Box>
        <Box my={3}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ListSigningDevice');
            }}
          >
            <ArrowIcon />
          </TouchableOpacity>
        </Box>
      </Box>
      <Box my={5} mx={3} flexDirection={'row'} justifyContent={'space-between'}>
        <Box flexDirection={'row'}>
          <Box my={1}>
            <Add />
          </Box>
          <Box mx={3}>
            <Text color={'light.lightBlack'} fontSize={14}>
              3rd Signer
            </Text>
            <Text color={'light.GreyText'} fontSize={12}>
              Lorem ipsum dolor sit amet
            </Text>
          </Box>
        </Box>
        <Box my={3}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ListSigningDevice');
            }}
          >
            <ArrowIcon />
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
};

const AddNewSigner = () => {
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
        <SignersList />
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
export default AddNewSigner;
