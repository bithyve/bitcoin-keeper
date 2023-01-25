import { ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import Text from 'src/components/KeeperText';
import React, { useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import App from 'src/assets/images/app.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import Inheritance from 'src/assets/images/inheritanceKeeper.svg';
import KeeperModal from 'src/components/KeeperModal';
import Recover from 'src/assets/images/recover.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import messaging from '@react-native-firebase/messaging';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import useToastMessage from 'src/hooks/useToastMessage';
import { isTestnet } from 'src/common/constants/Bitcoin';
import { updateFCMTokens } from '../../store/sagaActions/notifications';
import { Box, Image, Pressable } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import Note from 'src/components/Note/Note';

export function Tile({ title, subTitle, onPress, Icon = null, loading = false }) {
  return (
    <Pressable
      onPress={onPress}
      backgroundColor="light.primaryBackground"
      flexDirection="row"
      alignItems="center"
      width="90%"
      testID="btn_startNew"
      style={{ marginTop: hp(10), height: hp(110) }}
      marginLeft="5%"
      paddingX={2}
    >
      {Icon && <Box style={{ marginLeft: wp(20) }}>{Icon}</Box>}
      <Box
        backgroundColor="light.primaryBackground"
        style={{
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          borderRadius: hp(10),
          width: '80%',
        }}
      >
        <Text color="light.primaryText" fontSize={14} letterSpacing={1.12}>
          {title}
        </Text>
        <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
          {subTitle}
        </Text>
      </Box>
      <Box style={styles.iconContainer}>
        {loading ? (
          <Box marginRight="10">
            <ActivityIndicator />
          </Box>
        ) : (
          <ArrowIcon />
        )}
      </Box>
    </Pressable>
  );
}

function NewKeeperApp({ navigation }: { navigation }) {
  const dispatch = useAppDispatch();
  const { appImageRecoverd, appRecreated, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );
  const appCreated = useAppSelector((state) => state.storage.appId);
  const { showToast } = useToastMessage();
  const [keeperInitiating, setInitiating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (appCreated) {
      setInitiating(false);
      updateFCM();
    }
  }, [appCreated]);

  async function updateFCM() {
    try {
      const token = await messaging().getToken();
      dispatch(updateFCMTokens([token]));
    } catch (error) {
      //
    }
  }

  useEffect(() => {
    if (appImageError) {
      showToast('Failed to get app image');
    }
  }, [appImageRecoverd, appImageError]);

  useEffect(() => {
    if (appRecreated) {
      setTimeout(() => {
        navigation.replace('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appRecreated]);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (keeperInitiating) {
      setModalVisible(true);
      dispatch(setupKeeperApp());
    }
  }, [keeperInitiating]);

  const getSignUpModalContent = () => {
    if (!isTestnet() && false) {
      return {
        title: 'Multisig security for your sats',
        subTitle:
          'The Vault, BIP85 wallets and Inheritance tools provide you with all you need to secure your sats',
        assert: {
          loader: require('src/assets/video/Loader.gif'),
          height: 180,
        },
        message:
          'The app is currently in trial and may not support all the features. Please reach out to the team for any questions or feedback.',
      };
    }
    return {
      title: 'Shake to send feedback',
      subTitle: 'Shake your device to send us a bug report or a feature request',
      assert: {
        loader: require('src/assets/video/test-net.gif'),
        height: 200,
      },
      message:
        'This feature is *only* for the beta app. The developers will get your message along with other information from the app.',
    };
  };

  function SignUpModalContent() {
    return (
      <Box>
        <Image
          source={getSignUpModalContent().assert.loader}
          style={{
            width: wp(270),
            height: hp(getSignUpModalContent().assert.height),
            alignSelf: 'center',
          }}
        />
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65} width={wp(240)}>
          {getSignUpModalContent().message}
        </Text>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <Box>
        <HeaderTitle
          title={'New Keeper App'}
          subtitle={
            'Recover the Keeper app with a 12-word Recovery Phrase, or use other methods to restore the Vault'
          }
          paddingTop={3}
          enableBack={false}
          headerTitleColor={'black'}
        />
        <Tile
          title="Start New"
          subTitle="New vault and wallets"
          Icon={<App />}
          onPress={() => {
            setInitiating(true);
          }}
          loading={keeperInitiating}
        />
      </Box>

      <Box style={styles.titleWrapper02}>
        <HeaderTitle
          title={'Restore'}
          subtitle={'If you previously had a Keeper wallet you can recover it'}
          paddingTop={3}
          enableBack={false}
          headerTitleColor={'black'}
        />
        <Tile
          title="Recover Existing App"
          subTitle="For self or inherited Vault"
          Icon={<Recover />}
          onPress={() => {
            navigation.navigate('LoginStack', { screen: 'EnterSeedScreen' });
          }}
        />
        {/* <Tile
          title="Inheritance Keeper vault"
          subTitle="Using signing devices"
          onPress={() => {
            navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
          }}
          Icon={<Inheritance />} 
        />*/}
      </Box>
      <Box style={styles.note}>
        <Note
          subtitle="When you use signing devices to restore Keeper, only the vault is restored and the app has
        new wallets"
        />
      </Box>

      <KeeperModal
        dismissible={false}
        close={() => {}}
        visible={modalVisible}
        title={getSignUpModalContent().title}
        subTitle={getSignUpModalContent().subTitle}
        Content={SignUpModalContent}
        buttonText={appCreated ? 'Next' : null}
        buttonCallback={() => {
          setModalVisible(false);
          navigation.replace('App', { screen: 'NewHome' });
        }}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  titleWrapper02: {
    marginTop: hp(70),
  },
  note: {
    position: 'absolute',
    bottom: hp(35),
    marginLeft: 26,
    width: '90%',
    paddingTop: hp(10),
  },
  iconContainer: {
    padding: 10,
    flex: 1,
    flexDirection: 'row-reverse',
  },
});

export default NewKeeperApp;
