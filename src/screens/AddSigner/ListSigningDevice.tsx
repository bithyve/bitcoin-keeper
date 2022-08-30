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
import LinearGradient from 'react-native-linear-gradient';
import Add from 'src/assets/images/svgs/add.svg';
import TapSigner from 'src/assets/images/svgs/icon_tapsigner.svg';
import BackIcon from 'src/assets/images/svgs/back.svg';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { useDispatch } from 'react-redux';
import Tapsigner from 'src/assets/images/svgs/icon_tapsigner.svg';
import Coldcard from 'src/assets/images/svgs/icon_coldcard.svg';
import Trezor from 'src/assets/images/svgs/icon_trezor.svg';
import VaultIllustration from 'src/assets/images/vault_illustration.svg';
import KeeperModal from 'src/components/KeeperModal';

const signers = [
  {
    Icon: Tapsigner,
    name: 'Tap Signer',
    date: 'Added on 20 January 2022',
  },
  {
    Icon: Coldcard,
    name: 'ColdCard',
    date: 'Added on 20 July 2022',
  },
  {
    Icon: Trezor,
    name: 'Trezor',
    date: 'Added on 20 July 2022',
  },
];

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

const VaultSuccessContent = () => {
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  return (
    <View>
      <Box marginY={5} alignSelf={'center'}>
        <VaultIllustration />
      </Box>
      <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
        {vault.Description}
      </Text>
    </View>
  );
};

const SigningFooter = () => {
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);

  const close = () => {
    setModalVisible(false);
  };

  const onClick = () => {
    setModalVisible(false);
  };

  return (
    <Box justifyContent={'flex-end'} flex={1} mx={'5'} marginBottom={10}>
      <Box flexDirection={'row'}>
        <View style={styles.dash}></View>
        <View style={styles.dot}></View>
      </Box>
      <Box alignSelf={'flex-end'} flexDirection={'row'}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('NewHome');
          }}
        >
          <Text
            fontSize={13}
            fontFamily={'body'}
            fontWeight={'300'}
            letterSpacing={1}
            marginTop={2}
            color={'black'}
            marginRight={5}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#00836A', '#073E39']}
            style={styles.cta}
          >
            <Text
              fontSize={13}
              fontFamily={'body'}
              fontWeight={'300'}
              letterSpacing={1}
              color={'white'}
            >
              Next
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Box>
      <KeeperModal
        visible={modalVisible}
        close={close}
        title={vault.vaultRecovered}
        subTitle={vault.Description}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'View Vault'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={onClick}
        textColor={'#041513'}
        Content={VaultSuccessContent}
      />
    </Box>
  );
};

const SignersList = () => {
  return (
    <Box my={10}>
      <FlatList
        data={signers}
        keyExtractor={(item) => item}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
    </Box>
  );
};

const renderSigner = ({ item }) => {
  return <DisplaySigners title={item?.name} description={item?.date} Icon={item?.Icon} />;
};

const DisplaySigners = ({ title, description, Icon }) => {
  return (
    <Box flexDir={'row'} alignItems={'center'} marginBottom={hp(30)}>
      <Icon />
      <Box style={{ marginLeft: wp(2) }}>
        <Text color={'light.lightBlack'} fontSize={12} numberOfLines={2} alignItems={'center'}>
          {title}
        </Text>
        <Text color={'light.GreyText'} fontSize={12}>
          {description}
        </Text>
      </Box>
    </Box>
  );
};

const ListSigningDevice = () => {
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
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
});
export default ListSigningDevice;
