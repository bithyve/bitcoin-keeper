import { Box, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import KeeperModal from 'src/components/KeeperModal';
import NavWallet from 'src/assets/images/svgs/nav_wallet.svg';
import { ScaledSheet } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const Vaults = ({ animate }) => {
  const [visible, setModalVisible] = useState(false);
  const open = () => setModalVisible(true);
  const close = () => setModalVisible(false);
  const navigation = useNavigation();
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
});

export default Vaults;
