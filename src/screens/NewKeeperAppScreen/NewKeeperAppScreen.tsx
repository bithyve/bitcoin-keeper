import React, { useContext, useEffect } from 'react';
import { Box, Text, ScrollView, StatusBar, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import { useDispatch } from 'react-redux';
import { setupKeeperApp, SETUP_KEEPER_APP } from 'src/store/sagaActions/storage';
import { useAppSelector } from 'src/store/hooks';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import { getAppImage } from 'src/store/sagaActions/bhr';

const Tile = ({ title, subTitle, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      backgroundColor={'light.lightYellow'}
      flexDirection={'row'}
      alignItems={'center'}
      width={'100%'}
      style={{ marginTop: hp(10) }}
    >
      <Box
        backgroundColor={'light.lightYellow'}
        style={{
          marginLeft: wp(12),
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          borderRadius: hp(10),
          width: wp(275),
        }}
      >
        <Text
          color={'light.inheritanceTitle'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(13)}
          letterSpacing={0.65}
          width={wp(233)}
        >
          {title}
        </Text>
        <Text
          color={'light.GreyText'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          width={wp(240)}
          marginTop={hp(5)}
        >
          {subTitle}
        </Text>
      </Box>
    </Pressable>
  );
};

const NewKeeperApp = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const inheritence = translations['inheritence'];
  const dispatch = useDispatch();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
      }}
    >
      <StatusBar backgroundColor={'light.ReceiveBackground'} barStyle="dark-content" />
      <ScrollView>
        <Box mx={10} my={10}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackIcon />
          </TouchableOpacity>
        </Box>
        <Box mx={3}>
          <Text color={'light.headerText'} fontSize={RFValue(16)} fontFamily={'heading'} pl={10}>
            New Keeper App
          </Text>
          <Tile
            title={'Start New'}
            subTitle={'New Vault and Wallets'}
            onPress={() => {
              dispatch(setupKeeperApp());
              navigation.replace('App');
            }}
          />
          <Text
            color={'light.headerText'}
            fontSize={RFValue(16)}
            style={{ marginTop: 50 }}
            fontFamily={'heading'}
            pl={10}
          >
            Exsisting Keeper App
          </Text>
          <Tile
            title={'Recover for myself'}
            subTitle={'Using Cloud'}
            onPress={() => console.log('Using Cloud')}
          />
          <Tile
            title={'Recover for myself'}
            subTitle={'Using Seed'}
            onPress={() => {
              navigation.navigate('LoginStack', { screen: 'RecoveryFromSeed' });
              dispatch(
                getAppImage(
                  'violin material have toddler bomb cake awful left earth goose occur receive'
                )
              );
              console.log('using Seed');
            }}
          />
          <Tile
            title={'Inheritance Keeper Vault'}
            subTitle={'Using Signing Devices'}
            onPress={() => console.log('using Signing Devices')}
          />
          {/* <TouchableOpacity
            onPress={() => {
              dispatch(setupKeeperApp());
              navigation.replace('App');
            }}
          >
            <Text>New App</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Backup From Seed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Backup From Cloud</Text>
          </TouchableOpacity> */}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
export default NewKeeperApp;
