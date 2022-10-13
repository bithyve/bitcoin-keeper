import { Box, HStack, Pressable, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Instabug, { BugReporting } from 'instabug-reactnative';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import Arrow from 'src/assets/images/svgs/arrow.svg';
import BTC from 'src/assets/images/svgs/btc.svg';
import Chain from 'src/assets/icons/illustration_homescreen.svg';
import DiamondHandsFocused from 'src/assets/images/svgs/ic_diamond_hands_focused.svg';
import FileViewer from 'react-native-file-viewer';
import Hidden from 'src/assets/images/svgs/hidden.svg';
import HodlerFocused from 'src/assets/images/svgs/ic_hodler_focused.svg';
import Inheritance from 'src/assets/images/svgs/inheritance.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'react-native-linear-gradient';
import LinkedWallet from 'src/assets/images/svgs/linked_wallet.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import NewWalletModal from 'src/components/NewWalletModal';
import PlebFocused from 'src/assets/images/svgs/ic_pleb_focused.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import SigningDevicesIllustration from 'src/assets/images/svgs/illustration_SD.svg';
import UaiDisplay from './UaiDisplay';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultImage from 'src/assets/images/Vault.png';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { WalletMap } from '../Vault/WalletMap';
import { addToUaiStack } from 'src/store/sagaActions/uai';
import { getAmount, getUnit } from 'src/common/constants/Bitcoin';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { identifyUser } from 'src/core/services/sentry';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { useDispatch } from 'react-redux';
import { useUaiStack } from 'src/hooks/useUaiStack';

const InheritanceComponent = () => {
  const navigation = useNavigation();

  const navigateBack = () => {
    close();
  };
  const [visible, setVisible] = useState(false);

  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];
  const seed = translations['seed'];
  const onPress = () => {
    // open();
    navigation.navigate('InheritanceSetup');
  };

  const close = () => setVisible(false);
  const open = () => setVisible(true);

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
              Upgrade to secure your Vault
            </Text>
          </Box>
        </Box>
        <NextIcon pressHandler={() => onPress()} />
        <>
          <NewWalletModal
            visible={visible}
            close={close}
            title={wallet.AddNewWallet}
            createTitle={wallet.CreateNewwallet}
            createSubTitle={wallet.WalletDesc}
            newButton={wallet.CreateNew}
            newButtonDesc={wallet.WalletDesc}
            existingButtonTitle={wallet.Recoverexisting}
            existingButtonSubTitle={wallet.WalletDesc}
            seedButton={wallet.UsingSeed}
            seedButtonDesc={wallet.WalletDesc}
            cloudButton={wallet.FromCloud}
            cloudButtonDesc={wallet.WalletDesc}
            mainDesc={wallet.XPubSubTitle}
            modalBackground={['#F7F2EC', '#F7F2EC']}
            buttonBackground={['#00836A', '#073E39']}
            buttonCancel={'Cancel'}
            buttonText={'Next'}
            buttonTextColor={'#FAFAFA'}
            buttonCancelColor={'#073E39'}
            buttonCallback={navigateBack}
            textColor={'#041513'}
          />
        </>
      </LinearGradient>
    </Box>
  );
};

const LinkedWallets = (props) => {
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
          <LinkedWallet />
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
              Linked Wallet{wallets?.length > 1 && 's'}
            </Text>
          </Box>
        </Box>
        <Pressable onPress={() => props.onAmountPress()} marginRight={wp(15)}>
          {props.showHideAmounts ? (
            <Box flexDirection={'row'} alignItems={'center'}>
              <Box padding={1} marginBottom={-1}>
                <BTC />
              </Box>
              <Text color={'light.white1'} letterSpacing={0.6} fontSize={hp(30)} fontWeight={200}>
                {getAmount(netBalance)}
                <Text
                  color={'light.white1'}
                  letterSpacing={0.6}
                  fontSize={hp(12)}
                  fontWeight={200}
                >
                  {getUnit()}
                </Text>
              </Text>
            </Box>
          ) : (
            <Box flexDirection={'row'} alignItems={'center'}>
              <BTC />
              &nbsp;
              <Hidden />
            </Box>
          )}
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
};

const VaultSetupContent = () => {
  return (
    <View>
      <Box alignSelf={'center'}>
        <SigningDevicesIllustration />
      </Box>
      <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={1}>
        {`For the Pleb tier, you need to select one Signing Device to activate your Vault. This can be upgraded to three Signing Devices and five Signing Devices on Hodler and Diamond Hands tiers\n\nIf a particular Signing Device is not supported, it will be indicated.`}
      </Text>
    </View>
  );
};

const VaultStatus = (props) => {
  const [visible, setModalVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const navigation = useNavigation();
  const vaultTranslations = translations['vault'];
  const wallet = translations['wallet'];
  const common = translations['common'];
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const Vault: Vault =
    useQuery(RealmSchema.Vault)
      .map(getJSONFromRealmObject)
      .filter((vault) => !vault.archived)[0] || [];
  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
    signers = [],
  } = Vault;
  const vaultBalance = confirmed + unconfirmed;

  const open = () => {
    if (signers.length) {
      navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails', params: {} }));
    } else {
      setModalVisible(true);
    }
  };
  const close = () => setModalVisible(false);

  const navigateToHardwareSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddSigningDevice', params: {} }));
  };

  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());
  const dispatch = useAppDispatch();

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status);
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    identifyUser(keeper.appID);
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  const getTorStatusText = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return 'Tor disabled';
      case TorStatus.CONNECTING:
        return 'Connecting to Tor';
      case TorStatus.CONNECTED:
        return 'Tor enabled';
      case TorStatus.ERROR:
        return 'Tor error';
      default:
        return torStatus;
    }
  }, [torStatus]);

  const getTorStatusColor = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return '#fac48b';
      case TorStatus.CONNECTING:
        return '#fac48b';
      case TorStatus.CONNECTED:
        return '#c6ecae';
      case TorStatus.ERROR:
        return 'red.400';
      default:
        return '#fac48b';
    }
  }, [torStatus]);

  return (
    <Box marginTop={-hp(100)} alignItems={'center'}>
      <TouchableOpacity onPress={open} activeOpacity={0.75}>
        <ImageBackground resizeMode="contain" style={styles.vault} source={VaultImage}>
          <Box
            backgroundColor={getTorStatusColor}
            height={hp(16)}
            borderRadius={hp(14)}
            justifyContent={'center'}
            alignItems={'center'}
            marginTop={hp(30)}
            paddingX={2}
          >
            <Text
              color={'light.lightBlack'}
              letterSpacing={1}
              fontSize={11}
              fontWeight={300}
              textAlign={'center'}
              textTransform="uppercase"
            >
              {getTorStatusText}
            </Text>
          </Box>
          <Box marginTop={hp(windowHeight > 700 ? 60.5 : 25)} alignItems={'center'}>
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
              {
                !signers.length
                  ? 'Add Signers to upgrade '
                  : `Secured by ${signers.length} signer${signers.length === 1 ? '' : 's'}`
              }
            </Text>


            {!signers.length ?
              <Box marginTop={hp(11.5)}>
                <Chain />
              </Box>
              : (
                <Box flexDirection={'row'} marginTop={hp(10)}>
                  {signers.map((signer) => (
                    <Box
                      width={30}
                      height={30}
                      borderRadius={30}
                      bg={'#FAC48B'}
                      justifyContent={'center'}
                      alignItems={'center'}
                      marginX={1}
                    >
                      {WalletMap(signer.type).Icon}
                    </Box>
                  ))}
                </Box>
              )}

          </Box>

          <HStack alignItems={'center'} marginTop={hp(windowHeight > 700 ? 20 : 10)}>
            <BTC style={{ height: '20%' }} />
            <Pressable>
              {props.showHideAmounts ? (
                <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
                  <Text
                    p={1}
                    color={'light.white1'}
                    letterSpacing={0.8}
                    fontSize={hp(30)}
                    fontWeight={200}
                  >
                    {getAmount(vaultBalance)}

                  </Text>
                  <Text
                    color={'light.white1'}
                    letterSpacing={0.6}
                    fontSize={hp(12)}
                    fontWeight={200}
                  >
                    {getUnit()}
                  </Text>
                </Box>
              ) : (
                <Box marginY={5}>
                  <Hidden />
                </Box>
              )}
            </Pressable>
          </HStack>
          <Pressable
            backgroundColor={'light.yellow1'}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={hp(10)}
            style={{
              height: hp(22),
              width: wp(90)
            }}
            onPress={() => props.onAmountPress()}
          >
            <Text
              color={'light.sendMax'}
              fontWeight={300}
              fontSize={11}
              letterSpacing={0.88}
            >
              {!props.showHideAmounts ? 'Show Balances' : 'Hide Balances'}
            </Text>

          </Pressable>
        </ImageBackground>
      </TouchableOpacity>
      <KeeperModal
        visible={visible}
        close={close}
        title={'Signing Devices'}
        subTitle={
          'A Signing Device is a piece of hardware or software that stores one of the private keys needed for your Vault'
        }
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={vaultTranslations.AddNow}
        buttonTextColor={'#073E39'}
        buttonCallback={navigateToHardwareSetup}
        textColor={'#FFF'}
        Content={VaultSetupContent}
        DarkCloseIcon={true}
        learnMore={true}
      />
    </Box>
  );
};

const VaultInfo = () => {
  const navigation = useNavigation();
  const { uaiStack } = useUaiStack();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const addtoDb = () => {
    dispatch(
      addToUaiStack(
        'A new version of the app is available',
        true,
        uaiType.RELEASE_MESSAGE,
        50,
        'Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      )
    );
    dispatch(
      addToUaiStack(
        'Your Keeper request was rejected',
        true,
        uaiType.ALERT,
        40,
        'Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      )
    );
    dispatch(
      addToUaiStack(
        'Wallet restore was attempted on another device',
        true,
        uaiType.ALERT,
        40,
        'Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      )
    );
  };

  function getPlanIcon() {
    if (subscription.name.toLowerCase().includes('diamond')) {
      return <DiamondHandsFocused />;
    } else if (subscription.name.toLowerCase().includes('hodler')) {
      return <HodlerFocused />;
    } else {
      return <PlebFocused />;
    }
  }

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
          <Pressable
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            onPress={() => navigation.navigate('ChoosePlan')}
          >
            {getPlanIcon()}
            <Box
              backgroundColor="#015A53"
              borderWidth={0.8}
              borderRightRadius={15}
              paddingX={1}
              marginX={-2}
              zIndex={-10}
              borderColor="light.white1"
            >
              <Text p={1} color={'light.white1'} fontSize={hp(14)} fontWeight={200}>
                {subscription.name}
              </Text>
            </Box>
          </Pressable>
          <Pressable onPress={() => navigation.dispatch(CommonActions.navigate('AppSettings'))}>
            <SettingIcon />
          </Pressable>
        </Box>
        <UaiDisplay uaiStack={uaiStack} />
      </Box>
    </LinearGradient>
  );
};

export const NextIcon = ({ pressHandler }) => {
  const navigation = useNavigation();
  return (
    <Pressable onPress={pressHandler}>
      <Box
        backgroundColor={'light.yellow1'}
        height={hp(37.352)}
        width={hp(37.352)}
        borderRadius={20}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Arrow />
      </Box>
    </Pressable>
  );
};

const HomeScreen = ({ navigation }) => {
  const [showHideAmounts, setShowHideAmounts] = useState(false);

  useEffect(() => {
    try {
      Instabug.start('d68ca4d54b1cccbf5916086af360edec', [
        Instabug.invocationEvent.shake,
        Instabug.invocationEvent.screenshot,
      ]);
      BugReporting.setOptions([BugReporting.option.emailFieldHidden]);
      BugReporting.setInvocationEvents([
        Instabug.invocationEvent.shake,
        Instabug.invocationEvent.screenshot,
      ]);
      BugReporting.setReportTypes([BugReporting.reportType.bug, BugReporting.reportType.feedback]);
      BugReporting.setShakingThresholdForiPhone(1.0);
      BugReporting.setShakingThresholdForAndroid(100);
      Instabug.setPrimaryColor('rgb(7, 62, 57)');
    } catch (error) {
      console.log(error);
    }
  }, []);

  const data = {
    name: 'Tonny Hill',
    address: '101 E. Chapman Ave<br>Orange, CA 92866',
    phone: '98273-***11',
    company: 'Xyz Company',
    amount: '46899.50',
    amt: '53100.50',
  };
  const htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Invoice</title>
              <link rel="license" href="https://www.opensource.org/licenses/mit-license/">
              <style>
                ${htmlStyles}
              </style>
            </head>
            <body>
              <header>
                <h1>Invoice</h1>
                <address>
                  <p>${data.name}</p>
                  <p>${data.address}</p>
                  <p>${data.phone}</p>
                </address>
              </header>
              <article>
                <h1>Recipient</h1>
                <address>
                  <p>${data.company}<br>c/o ${data.name}</p>
                </address>
                <table class="meta">
                  <tr>
                    <th><span>Invoice #</span></th>
                    <td><span>101138</span></td>
                  </tr>
                  <tr>
                    <th><span>Date</span></th>
                    <td><span>${new Date()}</span></td>
                  </tr>
                  <tr>
                    <th><span>Amount Due</span></th>
                    <td><span id="prefix">$</span><span>${data.amount}</span></td>
                  </tr>
                </table>
                <table class="inventory">
                  <thead>
                    <tr>
                      <th><span>Item</span></th>
                      <th><span>Description</span></th>
                      <th><span>Rate</span></th>
                      <th><span>Quantity</span></th>
                      <th><span>Price</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span>Front End Consultation</span></td>
                      <td><span>Experience Review</span></td>
                      <td><span data-prefix>$</span><span>${data.amt}</span></td>
                      <td><span>4</span></td>
                      <td><span data-prefix>$</span><span>${data.amt}</span></td>
                    </tr>
                  </tbody>
                </table>
                <table class="balance">
                  <tr>
                    <th><span>Total</span></th>
                    <td><span data-prefix>$</span><span>${data.amt}</span></td>
                  </tr>
                  <tr>
                    <th><span>Amount Paid</span></th>
                    <td><span data-prefix>$</span><span>0.00</span></td>
                  </tr>
                  <tr>
                    <th><span>Balance Due</span></th>
                    <td><span data-prefix>$</span><span>${data.amount}</span></td>
                  </tr>
                </table>
              </article>
              <aside>
                <h1><span>Additional Notes</span></h1>
                <div>
                  <p>A finance charge of 1.5% will be made on unpaid balances after 30 days.</p>
                </div>
              </aside>
            </body>
          </html>
        `;
  const askPermission = () => {
    async function requestExternalWritePermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Pdf creator needs External Storage Write Permission',
            message: 'Pdf creator needs access to Storage data in your SD Card',
            buttonPositive: '',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          createPDF();
        } else {
          console.log('WRITE_EXTERNAL_STORAGE permission denied');
        }
      } catch (err) {
        console.log('Write permission err', err);
        console.warn(err);
      }
    }
    if (Platform.OS === 'android') {
      requestExternalWritePermission();
    } else {
      createPDF();
    }
  };
  const createPDF = async () => {
    let options = {
      //Content to print
      html: htmlContent,
      //File Name
      fileName: 'my-test',
      //File directory
      directory: 'Download',

      base64: true,
    };

    let file = await RNHTMLtoPDF.convert(options);
    // console.log(file.filePath);
    // Alert.alert('Successfully Exported', 'Path:' + file.filePath, [
    //   { text: 'Cancel', style: 'cancel' },
    //   { text: 'Open', onPress: () => openFile(file.filePath) }
    // ], { cancelable: true });
    openFile(file.filePath);
  };

  const openFile = (filepath) => {
    const path = filepath; // absolute-path-to-my-local-file.
    FileViewer.open(path)
      .then(() => {
        // success
      })
      .catch((error) => {
        // error
      });
  };

  return (
    <Box flex={1} backgroundColor={'light.lightYellow'}>
      <VaultInfo />
      <VaultStatus
        onAmountPress={() => {
          setShowHideAmounts(!showHideAmounts);
        }}
        showHideAmounts={showHideAmounts}
      />
      <Pressable
        onPress={() => {
          navigation.navigate('InheritanceSetup');
        }}
      >
        <InheritanceComponent />
      </Pressable>
      <LinkedWallets
        onAmountPress={() => {
          // setShowHideAmounts(!showHideAmounts);
        }}
        showHideAmounts={showHideAmounts}
      />
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
    height: hp(95),
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

const htmlStyles = `
*{
  border: 0;
  box-sizing: content-box;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
  list-style: none;
  margin: 0;
  padding: 0;
  text-decoration: none;
  vertical-align: top;
}
h1 { font: bold 100% sans-serif; letter-spacing: 0.5em; text-align: center; text-transform: uppercase; }
/* table */
table { font-size: 75%; table-layout: fixed; width: 100%; }
table { border-collapse: separate; border-spacing: 2px; }
th, td { border-width: 1px; padding: 0.5em; position: relative; text-align: left; }
th, td { border-radius: 0.25em; border-style: solid; }
th { background: #EEE; border-color: #BBB; }
td { border-color: #DDD; }
/* page */
html { font: 16px/1 'Open Sans', sans-serif; overflow: auto; }
html { background: #999; cursor: default; }
body { box-sizing: border-box;margin: 0 auto; overflow: hidden; padding: 0.25in; }
body { background: #FFF; border-radius: 1px; box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5); }
/* header */
header { margin: 0 0 3em; }
header:after { clear: both; content: ""; display: table; }
header h1 { background: #000; border-radius: 0.25em; color: #FFF; margin: 0 0 1em; padding: 0.5em 0; }
header address { float: left; font-size: 75%; font-style: normal; line-height: 1.25; margin: 0 1em 1em 0; }
header address p { margin: 0 0 0.25em; }
header span, header img { display: block; float: right; }
header span { margin: 0 0 1em 1em; max-height: 25%; max-width: 60%; position: relative; }
header img { max-height: 100%; max-width: 100%; }
/* article */
article, article address, table.meta, table.inventory { margin: 0 0 3em; }
article:after { clear: both; content: ""; display: table; }
article h1 { clip: rect(0 0 0 0); position: absolute; }
article address { float: left; font-size: 125%; font-weight: bold; }
/* table meta & balance */
table.meta, table.balance { float: right; width: 36%; }
table.meta:after, table.balance:after { clear: both; content: ""; display: table; }
/* table meta */
table.meta th { width: 40%; }
table.meta td { width: 60%; }
/* table items */
table.inventory { clear: both; width: 100%; }
table.inventory th { font-weight: bold; text-align: center; }
table.inventory td:nth-child(1) { width: 26%; }
table.inventory td:nth-child(2) { width: 38%; }
table.inventory td:nth-child(3) { text-align: right; width: 12%; }
table.inventory td:nth-child(4) { text-align: right; width: 12%; }
table.inventory td:nth-child(5) { text-align: right; width: 12%; }
/* table balance */
table.balance th, table.balance td { width: 50%; }
table.balance td { text-align: right; }
/* aside */
aside h1 { border: none; border-width: 0 0 1px; margin: 0 0 1em; }
aside h1 { border-color: #999; border-bottom-style: solid; }
`;
export default HomeScreen;
