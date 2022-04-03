import React, { useRef, useCallback, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { CheckIcon, Heading, HStack, Input, Spinner, View, VStack } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import BottomSheet, { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import HexaBottomSheet from 'src/components/BottomSheet';
import QRscanner from 'src/components/QRscanner';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import AccordionsComponent from 'src/components/AccordionsComponent';
import { addNewAccountShells, importNewAccount } from 'src/store/actions/accounts';
import { newAccountsInfo } from 'src/store/sagas/accounts';
import { AccountType } from 'src/bitcoin/utilities/Interface';

import HardWare from 'src/assets/images/svgs/hardware.svg';
import MultiSigIcon from 'src/assets/images/svgs/multisig.svg';
import BlockhchainIcon from 'src/assets/images/svgs/blockchain.svg';
import BlueWalletIcon from 'src/assets/images/svgs/bluewallet.svg';
import CoinBaseIcon from 'src/assets/images/svgs/coinbase.svg';
import HexagontileIcon from 'src/assets/images/svgs/hexagontile3.svg';
import MuunIcon from 'src/assets/images/svgs/muun.svg';
import TrustIcon from 'src/assets/images/svgs/trust.svg';
import HexaPayComponent from 'src/components/HexaPayComponent';
import Fonts from 'src/common/Fonts';

const LoadingText = ({ text, timeOut }) => {
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, timeOut * 500);

  return (
    <HStack space={2} justifyContent="center" minHeight={16} alignItems={'center'}>
      {loading ? (
        <Spinner accessibilityLabel="Loading posts" color={'#D8A572'} />
      ) : (
        <CheckIcon size="5" mt="0.5" color="emerald.500" />
      )}
      <Text>{text}</Text>
    </HStack>
  );
};

const AddWalletSheet = ({
  addWalletSheetRef,
  closeAddWalletSheet,
  addWalletType,
  setAddWalletType,
  accountName,
  setAccountName,
  accountDescription,
  setAccountDescription,
  addWallet,
}) => {
  return (
    <HexaBottomSheet
      title={"Amy's Wallet"}
      subTitle={''}
      snapPoints={['60%']}
      bottomSheetRef={addWalletSheetRef}
      primaryText={'Create'}
      secondaryText={'Cancel'}
      primaryCallback={addWallet}
      secondaryCallback={closeAddWalletSheet}
    >
      <BottomSheetTextInput
        placeholder={addWalletType}
        value={addWalletType}
        onChangeText={(value) => setAddWalletType(value)}
        style={styles.inputField}
      />
      <BottomSheetTextInput
        placeholder="Account Name"
        value={accountName}
        onChangeText={(value) => setAccountName(value)}
        style={styles.inputField}
      />
      <BottomSheetTextInput
        placeholder="Description"
        value={accountDescription}
        onChangeText={(value) => setAccountDescription(value)}
        style={styles.inputField}
      />
    </HexaBottomSheet>
  );
};

export const ImportWalletSheet = ({
  importWalletSheetRef,
  importWallet,
  importKey,
  setImportKey,
}) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <HexaBottomSheet
      title={'Import Wallet'}
      subTitle={'Insert a seed to import your existing wallet'}
      snapPoints={['70%']}
      bottomSheetRef={importWalletSheetRef}
      primaryText={'Import'}
      primaryCallback={importWallet}
      secondaryText={showQR ? 'Text' : 'Scan'}
      secondaryCallback={showQR ? () => setShowQR(false) : () => setShowQR(true)}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {showQR ? (
          <QRscanner />
        ) : (
          <BottomSheetTextInput
            multiline={true}
            value={importKey}
            onChangeText={(value) => setImportKey(value)}
            style={{ backgroundColor: '#D8A57210', padding: 4, aspectRatio: 1 }}
          />
        )}
      </View>
    </HexaBottomSheet>
  );
};

const CreateWalletSheet = ({ createWalletSheetRef }) => {
  const processMap = [
    {
      id: 1,
      text: 'Create multiple accounts',
    },
    {
      id: 2,
      text: 'Your bitcoin secured with distributed backup',
    },
    {
      id: 3,
      text: 'Backup health checked automatically',
    },
    {
      id: 4,
      text: 'Multiple customization options available',
    },
  ];
  return (
    <HexaBottomSheet
      title={'Creating your wallet'}
      subTitle={'This may take sometime'}
      snapPoints={['50%']}
      bottomSheetRef={createWalletSheetRef}
    >
      <VStack alignItems="flex-start">
        {processMap.map((process, index) => {
          const timeOut = (index + 1) * 2;
          return <LoadingText key={process.id} text={process.text} timeOut={timeOut} />;
        })}
      </VStack>
    </HexaBottomSheet>
  );
};

export const SucccessSheet = ({ title, subTitle, sheetTitle, successSheetRef, Icon, data = undefined, primaryText }) => {
  const navigation = useNavigation();

  return (
    <HexaBottomSheet
      title={sheetTitle}
      snapPoints={['50%']}
      bottomSheetRef={successSheetRef}
      primaryText={primaryText}
      primaryCallback={() => navigation.navigate('Home', data)}
    >
      <HexaPayComponent Icon={<Icon />} title={title} subtitle={subTitle} />
    </HexaBottomSheet>
  );
};

const AddWalletScreen = () => {
  const [addWalletType, setAddWalletType] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountDescription, setAccountDescription] = useState('');
  const [importKey, setImportKey] = useState('');
  const [importWalletType, setImportWalletType] = useState('Blue Wallet');

  const createWalletSheetRef = useRef<BottomSheet>(null);
  const importWalletSheetRef = useRef<BottomSheet>(null);
  const addWalletSheetRef = useRef<BottomSheet>(null);
  const successSheetRef = useRef<BottomSheet>(null);
  const successSheetImportRef = useRef<BottomSheet>(null);

  const dispatch = useDispatch();

  const addWallet = useCallback(() => {
    // const newAccountShellInfo: newAccountsInfo = {
    //   accountType: AccountType.CHECKING_ACCOUNT,
    //   accountDetails: {
    //     name: accountName,
    //     description: accountDescription,
    //   },
    // };
    // dispatch(addNewAccountShells([newAccountShellInfo]));
    setWalletDetails({
      name: accountName,
      description: accountDescription,
    });
    closeAddWalletSheet();
    expandSuccessSheet();
  }, [accountName, accountDescription]);

  const importWallet = useCallback(() => {
    const mnemonic = importKey.trim();
    if (mnemonic) {
      const accountDetails = {
        name: importWalletType,
      };
      dispatch(importNewAccount(mnemonic, accountDetails));
      closeImportWalletSheet();
      expandCreateWalletSheet();
      setTimeout(() => {
        createWalletSheetRef?.current.close();
        expandSuccessImportSheet();
      }, 500 * 9);
    }
  }, [importKey]);

  const closeAddWalletSheet = useCallback(() => {
    addWalletSheetRef.current?.close();
  }, []);

  const expandAddWalletSheet = useCallback((addWalletType) => {
    setAddWalletType(addWalletType);
    addWalletSheetRef.current?.expand();
  }, []);

  const closeImportWalletSheet = useCallback(() => {
    importWalletSheetRef.current?.close();
  }, []);

  const expandImportWalletSheet = useCallback(() => {
    importWalletSheetRef.current?.expand();
  }, []);

  const expandCreateWalletSheet = useCallback(() => {
    createWalletSheetRef.current?.expand();
  }, []);

  const closeCreateWalletShhet = useCallback(() => {
    createWalletSheetRef.current?.close();
  }, []);

  const expandSuccessSheet = useCallback(() => {
    successSheetRef.current?.expand();
  }, []);

  const closeSuccessSheet = useCallback(() => {
    successSheetRef.current?.close();
  }, []);

  const expandSuccessImportSheet = useCallback(() => {
    successSheetImportRef.current?.expand();
  }, []);

  const closeSuccessSheetImport = useCallback(() => {
    successSheetImportRef.current?.close();
  }, []);

  const Data = [
    {
      id: 1,
      heading: 'Create a wallet',
      description: 'Hodl. Gift. Orange Pill',
      items: [
        {
          title: 'Single-sig Wallet',
          description: 'For your day to day spends',
          icon: HardWare,
          onPress: expandAddWalletSheet,
        },
        {
          title: 'Multi-sig Wallet',
          description: 'For long term hodling',
          icon: MultiSigIcon,
          onPress: expandAddWalletSheet,
        },
        {
          title: 'Multi-sig Hardware Wallet',
          description: 'The ultimate long term bitcoin security',
          icon: HardWare,
          onPress: expandAddWalletSheet,
        },
      ],
    },
    {
      id: 2,
      heading: 'Import a Wallet',
      description: 'Backup another bitcoin wallet',
      items: [
        {
          title: 'Trust Wallet',
          description: '',
          icon: TrustIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Coinbase',
          description: '',
          icon: CoinBaseIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Blue Wallet',
          description: '',
          icon: BlueWalletIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Munn Wallet',
          description: '',
          icon: MuunIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Blockchain.com',
          description: '',
          icon: BlockhchainIcon,
          onPress: expandImportWalletSheet,
        },
      ],
    },
    {
      id: 3,
      heading: 'Add a Vault',
      description: 'Backup another bitcoin wallet',
      items: [],
    },
  ];

  const renderItem = ({ item }) => <AccordionsComponent item={item} />;
  const navigtaion = useNavigation();

  const [walletDetails, setWalletDetails] = useState({});

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Add a Wallet"
        subtitle="Secure your bitcoin across wallets"
        onPressHandler={() => navigtaion.goBack()}
      />
      <FlatList data={Data} renderItem={renderItem} keyExtractor={(item) => item.id} />
      <ImportWalletSheet
        importWalletSheetRef={importWalletSheetRef}
        importWallet={importWallet}
        importKey={importKey}
        setImportKey={setImportKey}
      />
      <AddWalletSheet
        addWalletSheetRef={addWalletSheetRef}
        closeAddWalletSheet={closeAddWalletSheet}
        addWalletType={addWalletType}
        setAddWalletType={setAddWalletType}
        accountName={accountName}
        setAccountName={setAccountName}
        accountDescription={accountDescription}
        setAccountDescription={setAccountDescription}
        addWallet={addWallet}
      />
      <CreateWalletSheet createWalletSheetRef={createWalletSheetRef} />
      <SucccessSheet
        Icon={HardWare}
        sheetTitle={'Wallet Creation Successful'}
        title={walletDetails?.name}
        subTitle={walletDetails?.description}
        successSheetRef={successSheetRef}
        primaryText='View Wallet'
      />
      <SucccessSheet
        Icon={BlueWalletIcon}
        sheetTitle={'Wallet Creation Successful'}
        title={importWalletType}
        subTitle={'Daily Spend'}
        successSheetRef={successSheetImportRef}
        primaryText='View Wallet'
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: RFValue(22),
    lineHeight: '20@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  },
  inputField: {
    padding: 30,
    borderWidth: 0,
    color: '#073E39',
    backgroundColor: '#D8A57210',
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: RFValue(13),
    letterSpacing: 0.65,
    borderRadius: 10,
  },
});
export default AddWalletScreen;
