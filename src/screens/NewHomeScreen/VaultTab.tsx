import { Box, ScrollView, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
import React, { useState, useContext } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import Btc from 'src/assets/images/svgs/btcIcon.svg';
import ColdCardIcon from 'src/assets/images/svgs/coldcard_tile.svg';
import DevicesComponent from './DevicesComponent';
import Heading from './Heading';
import KeeperModal from 'src/components/KeeperModal';
import NavWallet from 'src/assets/images/svgs/nav_wallet.svg';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { ScaledSheet } from 'react-native-size-matters';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';

const { width } = Dimensions.get('window');

const VaultTab = ({ animate }) => {
  const [visible, setModalVisible] = useState(false);
  const open = () => setModalVisible(true);
  const close = () => setModalVisible(false);
  const navigation = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const Signers = useQuery(RealmSchema.VaultSigner);

  const Slider = () => {
    return (
      <TouchableOpacity onPress={animate} style={styles.slider}>
        <NavWallet />
      </TouchableOpacity>
    );
  };

  const SetupState = () => {
    return (
      <VStack alignItems={'center'} justifyContent={'space-evenly'} height={'60%'}>
        <View style={styles.logo} />
        <VStack alignItems={'center'}>
          <Text
            color={'light.lightBlack'}
            fontSize={18}
            fontFamily={'body'}
            fontWeight={'200'}
            letterSpacing={1.1}
          >
            {'Setup your Vault'}
          </Text>
          <Text
            color={'light.lightBlack'}
            fontSize={13}
            fontFamily={'body'}
            fontWeight={'100'}
            letterSpacing={0.65}
            textAlign={'center'}
          >
            {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
          </Text>
        </VStack>
        <TouchableOpacity style={styles.cta} onPress={open}>
          <Text fontSize={14} fontFamily={'body'} fontWeight={'300'} letterSpacing={1}>
            {'Setup Now'}
          </Text>
        </TouchableOpacity>
      </VStack>
    );
  };

  const DummyContent = () => {
    return (
      <View>
        <View style={styles.dummy} />
        <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={2}>
          {'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam'}
        </Text>
        <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={2}>
          {'incididunt ut labore et dolore magna aliqua'}
        </Text>
      </View>
    );
  };

  const renderBackupKeys = ({ item }) => {
    return (
      <DevicesComponent
        title={item.signerName}
        onPress={item.onPress}
        Icon={() => <ColdCardIcon />}
      />
    );
  };

  const VaultState = () => {
    return !Signers.length ? (
      <>
        <SetupState />
        <KeeperModal
          visible={visible}
          close={close}
          title="Setup Vault"
          subTitle="Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna"
          modalBackground={['#00836A', '#073E39']}
          buttonBackground={['#FFFFFF', '#80A8A1']}
          buttonText={'Add a signer'}
          buttonTextColor={'#073E39'}
          buttonCallback={addTapsigner}
          textColor={'#FFF'}
          Content={DummyContent}
        />
      </>
    ) : (
      <ScrollView
        marginBottom={windowHeight / 3.75}
        showsVerticalScrollIndicator={false}
        scrollEnabled={windowHeight < 780}
      >
        <VStack>
          <Heading title={'Vault'} subTitle={'Your super secure bitcoin'} />
          <Box
            width={width * 0.87}
            height={width * 0.55}
            bg={'light.vaultCard'}
            alignSelf={'center'}
            borderRadius={10}
            marginTop={5}
            padding={5}
          >
            <SettingIcon />

            <Box marginY={8}>
              <Text
                color={'light.lightYellow'}
                fontSize={14}
                letterSpacing={0.7}
                fontFamily={'body'}
                fontWeight={200}
              >
                Retirement
              </Text>
              <Text
                color={'light.white1'}
                fontSize={12}
                letterSpacing={0.6}
                fontFamily={'body'}
                fontWeight={100}
              >
                Beach and sunshine baby!
              </Text>
            </Box>
            <Text
              color={'light.white1'}
              fontSize={34}
              letterSpacing={1.7}
              fontFamily={'body'}
              fontWeight={200}
            >
              <Box marginBottom={2} marginX={1}>
                <Btc />
              </Box>
              0.000024
            </Text>
          </Box>

          <Box marginTop={3}>
            <Text
              color={'light.lightBlack'}
              letterSpacing={1.12}
              fontSize={14}
              fontFamily={'body'}
              fontWeight={'200'}
              paddingTop={5}
            >
              {'My Signers'}
            </Text>
            <Text
              color={'light.lightBlack'}
              fontSize={12}
              fontFamily={'body'}
              fontWeight={'100'}
              paddingBottom={5}
              letterSpacing={0.6}
            >
              {'Used for securing funds'}
            </Text>
          </Box>

          <FlatList
            data={Signers}
            renderItem={renderBackupKeys}
            keyExtractor={(item) => item?.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
          <Box flexDirection={'row'} marginY={3} justifyContent={'space-between'}>
            <Box>
              <Text
                color={'light.lightBlack'}
                letterSpacing={1.12}
                fontSize={14}
                fontFamily={'body'}
                fontWeight={'200'}
              >
                {'Inheritance'}
              </Text>
              <Text
                color={'light.lightBlack'}
                fontSize={12}
                fontFamily={'body'}
                fontWeight={'100'}
                paddingBottom={5}
              >
                {'Set up inheritance to your sats'}
              </Text>
            </Box>
            <Box justifyContent={'center'}>
              <TouchableOpacity style={styles.button}>
                <Text
                  color={'light.textDark'}
                  fontSize={11}
                  fontFamily={'body'}
                  fontWeight={'300'}
                  letterSpacing={0.88}
                >
                  {'Setup'}
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </VStack>
      </ScrollView>
    );
  };

  const addTapsigner = React.useCallback(() => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddTapsigner', params: {} }));
  }, []);
  return (
    <Box
      backgroundColor={'light.lightYellow'}
      borderLeftRadius={20}
      marginTop={10}
      padding={'6'}
      height={'100%'}
    >
      <Slider />
      <VaultState />
    </Box>
  );
};

const styles = ScaledSheet.create({
  slider: {
    position: 'absolute',
    zIndex: 1,
    right: 0,
    top: '3.7%',
  },
  logo: {
    height: width * 0.6,
    width: width * 0.6,
    borderRadius: width,
    backgroundColor: '#BBB',
  },
  cta: {
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#FAC48B',
  },
  dummy: {
    height: 200,
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#092C27',
    opacity: 0.15,
  },
  backgroundImage: {
    width: wp('100%'),
    height: hp('100%'),
    backgroundColor: 'red',
    borderRadius: 10,
  },
  button: {
    borderRadius: 10,
    marginTop: hp(1),
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAC48B',
  },
});

export default VaultTab;
