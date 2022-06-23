import { Box, Pressable, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Image, ImageBackground, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Arrow from 'src/assets/images/svgs/arrow.svg';
import BTC from 'src/assets/images/svgs/btc.svg';
import Basic from 'src/assets/images/svgs/basic.svg';
import Inheritance from 'src/assets/images/svgs/inheritance.svg';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'react-native-linear-gradient';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScannerIcon from 'src/assets/images/svgs/scan.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import TapsignerIcon from 'src/assets/images/tapsigner.svg';
import VaultImage from 'src/assets/images/Vault.png';
import { Wallet } from 'src/core/wallets/interfaces/interface';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useAppSelector } from 'src/store/hooks';

const InheritanceComponent = () => {
  return (
    <Box alignItems={'center'} marginTop={hp(19.96)}>
      <LinearGradient
        colors={['#00836A', '#073E39']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bottomCard}
      >
        <Box marginLeft={wp(9.75)} flexDirection={'row'} alignItems={'center'}>
          <Inheritance />
          <Box marginLeft={wp(18)}>
            <Text
              color={'light.white1'}
              letterSpacing={0.8}
              fontSize={RFValue(16)}
              fontWeight={200}
            >
              Inheritance
            </Text>
            <Text
              color={'light.white1'}
              letterSpacing={0.6}
              fontSize={RFValue(12)}
              fontWeight={100}
              marginTop={-1}
            >
              Upgrade to secure your Vaul
            </Text>
          </Box>
        </Box>
        <NextIcon />
      </LinearGradient>
    </Box>
  );
};

const LinkedWallets = () => {
  const navigation = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const netBalance = useAppSelector((state) => state.wallet.netBalance);

  return (
    <Pressable
      alignItems={'center'}
      marginTop={hp(8)}
      onPress={() => navigation.dispatch(CommonActions.navigate('WalletDetails'))}
    >
      <LinearGradient
        colors={['#00836A', '#073E39']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bottomCard}
      >
        <Box marginLeft={wp(9.75)} flexDirection={'row'} alignItems={'center'}>
          <Inheritance />
          <Box marginLeft={wp(18)} flexDirection={'row'} alignItems={'center'}>
            <Text
              color={'light.white1'}
              letterSpacing={1.76}
              fontSize={RFValue(22)}
              fontWeight={200}
            >
              {wallets?.length}
            </Text>
            <Text
              color={'light.white1'}
              letterSpacing={0.7}
              fontSize={RFValue(14)}
              fontWeight={200}
              marginLeft={'1'}
            >
              Linked Wallet
            </Text>
          </Box>
        </Box>
        <Text color={'light.white1'} letterSpacing={0.6} fontSize={RFValue(30)} fontWeight={200}>
          <Box padding={1} marginBottom={0.5}>
            <BTC />
          </Box>
          {netBalance}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

const VaultSetupContent = () => {
  return (
    <View>
      <View style={styles.dummy} />
      <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={2}>
        {
          'For the Basic tier, you need to select one Signer to activate your Vault. This can be upgraded to 3 Signers and 5 Signers when on Expert or Elite tier respectively'
        }
      </Text>
      <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={2}>
        {'To get started, you need to add a Signer (hardware wallet or a signer device) to Keeper'}
      </Text>
    </View>
  );
};

const VaultStatus = () => {
  const [visible, setModalVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const navigation = useNavigation();
  const vault = translations['vault'];

  const { useQuery } = useContext(RealmWrapperContext);
  const Signers = useQuery(RealmSchema.VaultSigner);

  const open = () => {
    if (Signers.length) {
      return;
    }
    setModalVisible(true);
  };
  const close = () => setModalVisible(false);

  const navigateToHardwareSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'HardwareWallet', params: {} }));
  };
  return (
    <Box marginTop={-hp(97.44)} alignItems={'center'}>
      <TouchableOpacity onPress={open} activeOpacity={1}>
        <ImageBackground resizeMode="contain" style={styles.vault} source={VaultImage}>
          <Box
            backgroundColor={'light.TorLable'}
            height={hp(13.804)}
            width={wp(60)}
            borderRadius={hp(14)}
            justifyContent={'center'}
            alignItems={'center'}
            marginTop={hp(30)}
          >
            <Text
              color={'light.lightBlack'}
              letterSpacing={0.9}
              fontSize={RFValue(9)}
              fontWeight={300}
            >
              Tor Enabled
            </Text>
          </Box>
          <Box marginTop={hp(64.5)} alignItems={'center'}>
            <Text
              color={'light.white1'}
              letterSpacing={0.8}
              fontSize={RFValue(16)}
              fontWeight={300}
            >
              Your Vault
            </Text>

            <Text
              color={'light.white1'}
              letterSpacing={0.9}
              fontSize={RFValue(12)}
              fontWeight={100}
              opacity={0.8}
              paddingBottom={1}
            >
              {!Signers.length
                ? 'Pending Activation'
                : `Secured by ${Signers.length} signer${Signers.length === 1 ? '' : 's'}`}
            </Text>
            {!Signers.length ? null : <TapsignerIcon />}
          </Box>
          {!Signers.length ? (
            <Box marginTop={hp(31.5)}>
              <Image
                source={require('src/assets/images/illustration.png')}
                style={{ width: wp(123.95), height: hp(122.3) }}
                resizeMode="contain"
              />
            </Box>
          ) : null}
        </ImageBackground>
      </TouchableOpacity>
      <KeeperModal
        visible={visible}
        close={close}
        title={vault.SetupyourVault}
        subTitle={vault.VaultDesc}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={vault.Addsigner}
        buttonTextColor={'#073E39'}
        buttonCallback={navigateToHardwareSetup}
        textColor={'#FFF'}
        Content={VaultSetupContent}
      />
    </Box>
  );
};

const VaultInfo = () => {
  const navigation = useNavigation();
  return (
    <LinearGradient
      colors={['#00836A', '#073E39']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.linearGradient}
    >
      <Box paddingX={10} alignItems={'center'}>
        <Box
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          width={'100%'}
        >
          <Pressable>
            <ScannerIcon />
          </Pressable>
          <Pressable>
            <Basic />
          </Pressable>
          <Pressable onPress={() => navigation.dispatch(CommonActions.navigate('AppSettings'))}>
            <SettingIcon />
          </Pressable>
        </Box>
        <Box
          backgroundColor={'light.AddSignerCard'}
          height={hp(60)}
          width={wp(259)}
          borderRadius={hp(20)}
          marginTop={hp(44)}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          paddingX={4}
        >
          <Text
            noOfLines={2}
            width={wp(170)}
            color={'light.white1'}
            letterSpacing={0.6}
            fontSize={RFValue(12)}
            fontWeight={200}
            lineHeight={14}
          >
            Add Signers to Secure your Vault
          </Text>
          <NextIcon />
        </Box>
      </Box>
    </LinearGradient>
  );
};

const NextIcon = () => {
  const navigation = useNavigation();
  return (
    <Box
      backgroundColor={'light.yellow1'}
      height={hp(37.352)}
      width={hp(37.352)}
      borderRadius={20}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <Pressable onPress={() => navigation.dispatch(CommonActions.navigate('InheritanceSetup'))}>
        <Arrow />
      </Pressable>
    </Box>
  );
};

const HomeScreen = () => {
  return (
    <Box flex={1} backgroundColor={'light.lightYellow'}>
      <VaultInfo />
      <VaultStatus />
      <InheritanceComponent />
      <LinkedWallets />
    </Box>
  );
};

const styles = ScaledSheet.create({
  linearGradient: {
    justifyContent: 'space-between',
    paddingTop: hp(57),
    height: hp(325),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  vault: {
    width: wp(271.28),
    height: hp(346.04),
    alignItems: 'center',
  },
  bottomCard: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(100),
    width: wp(335),
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: wp(10),
  },
  dummy: {
    height: 200,
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#092C27',
    opacity: 0.15,
  },
});

export default HomeScreen;
