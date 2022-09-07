import { Box, HStack, Pressable, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import Arrow from 'src/assets/images/svgs/arrow.svg';
import BTC from 'src/assets/images/svgs/btc.svg';
import Basic from 'src/assets/images/svgs/basic.svg';
import CustomPriorityModal from '../Send/CustomPriorityModal';
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
import Pleb from 'src/assets/images/svgs/pleb.svg';
import PlebFocused from 'src/assets/images/svgs/ic_pleb_focused.svg';
// import Elite from 'src/assets/images/svgs/elite.svg';
// import Pro from 'src/assets/images/svgs/pro.svg';
// import ColdCard from 'src/assets/images/svgs/coldcard_home.svg';
// import Ledger from 'src/assets/images/svgs/ledger_home.svg';
// import Trezor from 'src/assets/images/svgs/trezor_home.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import TapsignerIcon from 'src/assets/images/tapsigner.svg';
import UaiDisplay from './UaiDisplay';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultImage from 'src/assets/images/Vault.png';
import VaultSetupIcon from 'src/assets/icons/vault_setup.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { WalletMap } from '../Vault/WalletMap';
import WhaleFocused from 'src/assets/images/svgs/ic_whale_focused.svg';
import { addToUaiStack } from 'src/store/sagaActions/uai';
import dbManager from 'src/storage/realm/dbManager';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { identifyUser } from 'src/core/services/sentry';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { useDispatch } from 'react-redux';
import { useUaiStack } from 'src/hooks/useUaiStack';
import { walletData } from 'src/common/data/defaultData/defaultData';

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
    open();
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
        <NextIcon pressHandler={() => navigation.navigate('SetupInheritance')} />
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
              Linked Wallet
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
                {netBalance}
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
        <VaultSetupIcon />
      </Box>
      <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
        {
          'For the Basic tier, you need to select one Signer to activate your Vault. This can be upgraded to 3 Signers and 5 Signers when on Expert or Elite tier respectively'
        }
      </Text>
      <Text color={'white'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
        {
          'To get started, you need to add a Signing Device (hardware wallet or a signer device) to Keeper'
        }
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
        return 'Tor connecting...';
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
        return 'yellow.400';
      case TorStatus.CONNECTING:
        return 'orange.400';
      case TorStatus.CONNECTED:
        return 'green.400';
      case TorStatus.ERROR:
        return 'red.400';
      default:
        return 'yellow.400';
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
            paddingX={1}
          >
            <Text
              color={'light.lightBlack'}
              letterSpacing={1}
              fontSize={hp(11)}
              fontWeight={300}
              textAlign={'center'}
            >
              {getTorStatusText}
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
              {!signers.length
                ? 'Activate Now '
                : `Secured by ${signers.length} signer${signers.length === 1 ? '' : 's'}`}
            </Text>
            {!signers.length ? null : (
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
          {!signers.length ? (
            <Box marginTop={hp(31.5)}>
              <Image
                source={require('src/assets/images/illustration.png')}
                style={{ width: wp(123.95), height: hp(122.3) }}
                resizeMode="contain"
              />
            </Box>
          ) : null}
          {signers.length ? (
            <HStack alignItems={'center'} marginTop={'10%'}>
              <BTC style={{ height: '20%' }} />
              <Pressable onPress={() => props.onAmountPress()}>
                {props.showHideAmounts ? (
                  <Text
                    p={1}
                    color={'light.white1'}
                    letterSpacing={0.8}
                    fontSize={hp(34)}
                    fontWeight={200}
                  >
                    {vaultBalance}
                  </Text>
                ) : (
                  <Hidden />
                )}
              </Pressable>
            </HStack>
          ) : null}
        </ImageBackground>
      </TouchableOpacity>
      {/* Vault creation successful modal */}
      {/* <KeeperModal
        visible={visible}
        close={close}
        title={vaultTranslations.VaultCreated}
        subTitle={vaultTranslations.VaultCreationDesc}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={vaultTranslations.ViewVault}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToHardwareSetup}
        textColor={'#5F6965'}
        Content={VaultCreationContent}
      /> */}
      <KeeperModal
        visible={visible}
        close={close}
        title={vaultTranslations.SetupyourVault}
        subTitle={vaultTranslations.VaultDesc}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={vaultTranslations.AddNow}
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
    if (subscription.name.toLowerCase().includes('whale')) {
      return <WhaleFocused />;
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
              borderWidth={0.4}
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

const HomeScreen = () => {
  const [showHideAmounts, setShowHideAmounts] = useState(false);

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
      <Pressable onPress={askPermission}>
        <InheritanceComponent />
      </Pressable>
      <LinkedWallets
        onAmountPress={() => {
          setShowHideAmounts(!showHideAmounts);
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
