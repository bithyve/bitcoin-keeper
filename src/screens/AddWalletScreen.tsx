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
      title={'Add Wallet Details'}
      subTitle={'Lorem Ipsum Dolor Amet'}
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
        style={{
          padding: 30,
          borderWidth: 0,
          color: '#073E39',
          backgroundColor: '#D8A57210',
          marginVertical: 10,
        }}
      />
      <BottomSheetTextInput
        placeholder="Account Name"
        value={accountName}
        onChangeText={(value) => setAccountName(value)}
        style={{
          padding: 30,
          borderWidth: 0,
          color: '#073E39',
          backgroundColor: '#D8A57210',
          marginVertical: 10,
        }}
      />
      <BottomSheetTextInput
        placeholder="Description"
        value={accountDescription}
        onChangeText={(value) => setAccountDescription(value)}
        style={{
          padding: 30,
          borderWidth: 0,
          color: '#073E39',
          backgroundColor: '#D8A57210',
          marginVertical: 10,
        }}
      />
    </HexaBottomSheet>
  );
};

const ImportWalletSheet = ({
  importWalletSheetRef,
  showQR,
  setShowQR,
  importWallet,
  importKey,
  setImportKey,
}) => {
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
          <Input
            style={{ aspectRatio: 1 }}
            multiline={true}
            w="100%"
            h="80%"
            value={importKey}
            onChangeText={(value) => setImportKey(value)}
            size={'lg'}
            backgroundColor={'#D8A57210'}
            color={'#073E39'}
            borderWidth={'0'}
            padding={3}
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
      text: 'Lorem ipsum dolor sit amet.',
    },
    {
      id: 2,
      text: 'Lorem ipsum dolor sit amet.',
    },
    {
      id: 3,
      text: 'Lorem ipsum dolor sit amet.',
    },
    {
      id: 4,
      text: 'Lorem ipsum dolor sit amet.',
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

const AddWalletScreen = () => {
  const [addWalletType, setAddWalletType] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountDescription, setAccountDescription] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [importWalletType, setImportWalletType] = useState('Blue Wallet');

  const createWalletSheetRef = useRef<BottomSheet>(null);
  const importWalletSheetRef = useRef<BottomSheet>(null);
  const addWalletSheetRef = useRef<BottomSheet>(null);
  const dispatch = useDispatch();

  const addWallet = useCallback(() => {
    const newAccountShellInfo: newAccountsInfo = {
      accountType: AccountType.CHECKING_ACCOUNT,
      accountDetails: {
        name: accountName,
        description: accountDescription,
      },
    };
    dispatch(addNewAccountShells([newAccountShellInfo]));
    closeAddWalletSheet();
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

  const Data = [
    {
      id: 1,
      heading: 'Hexa Wallets',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [
        {
          title: 'Single-sig Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: HardWare,
          onPress: expandAddWalletSheet,
        },
        {
          title: 'Multi-sig Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: MultiSigIcon,
          onPress: expandAddWalletSheet,
        },
        {
          title: 'Multi-sig Hardware Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: HardWare,
          onPress: expandAddWalletSheet,
        },
      ],
    },
    {
      id: 2,
      heading: 'Import a Wallet',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [
        {
          title: 'Trust Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: TrustIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Coinbase',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: CoinBaseIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Blue Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: BlueWalletIcon,
          onPress: expandImportWalletSheet,
        },
        // {
        //   title: 'BRD',
        //   description: 'Lorem ipsum dolor sit amet, consectetur',
        //   icon: HexagontileIcon,
        //   onPress: expandImportWalletSheet,
        // },
        {
          title: 'Munn Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: MuunIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: 'Blockchain.com',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: BlockhchainIcon,
          onPress: expandImportWalletSheet,
        },
      ],
    },
    {
      id: 3,
      heading: 'Add a Vault',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [],
    },
  ];

  const renderItem = ({ item }) => <AccordionsComponent item={item} />;
  const navigtaion = useNavigation();

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Add a Wallet"
        subtitle="Lorem ipsum dolor sit amet, consectetur"
        onPressHandler={() => navigtaion.goBack()}
      />
      <FlatList data={Data} renderItem={renderItem} keyExtractor={(item) => item.id} />
      <ImportWalletSheet
        importWalletSheetRef={importWalletSheetRef}
        showQR={showQR}
        setShowQR={setShowQR}
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
});
export default AddWalletScreen;
