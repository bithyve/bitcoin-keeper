import React, { useRef, useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { View } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import BottomSheet from '@gorhom/bottom-sheet';

import Fonts from 'src/common/Fonts';
import useBottomSheetUtils from 'src/hooks/useBottomSheetUtils';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import AccordionsComponent from 'src/screens/AddWallet/AccordionsComponent';
import { addNewWallets, importNewWallet } from 'src/store/sagaActions/wallets';
import { newWalletsInfo } from 'src/store/sagas/wallets';
import SuccessSheet from 'src/components/SuccessSheet';
import AddWalletSheet from 'src/screens/AddWallet/AddWalletSheet';
import ImportWalletSheet from 'src/components/ImportWalletSheet';
import CreateWalletSheet from 'src/screens/AddWallet/CreateWalletSheet';
import { processMapCreate, processMapImport } from 'src/common/data/messages/mesages';

import HardWare from 'src/assets/images/svgs/hardware.svg';
import MultiSigIcon from 'src/assets/images/svgs/multisig.svg';
import BlockhchainIcon from 'src/assets/images/svgs/blockchain.svg';
import BlueWalletIcon from 'src/assets/images/svgs/bluewallet.svg';
import CoinBaseIcon from 'src/assets/images/svgs/coinbase.svg';
import MuunIcon from 'src/assets/images/svgs/muun.svg';
import TrustIcon from 'src/assets/images/svgs/trust.svg';
import { WalletType } from 'src/core/wallets/interfaces/enum';

const AddWalletScreen = () => {
  const dispatch = useDispatch();
  const navigtaion = useNavigation();

  const createWalletSheetRef = useRef<BottomSheet>(null);
  const importWalletSheetRef = useRef<BottomSheet>(null);
  const addWalletSheetRef = useRef<BottomSheet>(null);
  const successSheetRef = useRef<BottomSheet>(null);
  const successSheetImportRef = useRef<BottomSheet>(null);
  const importProcessWalletSheetRef = useRef<BottomSheet>(null);

  const [addWalletType, setAddWalletType] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const [importKey, setImportKey] = useState('');
  const [importWalletType, setImportWalletType] = useState('Blue Wallet');
  const [walletDetails, setWalletDetails] = useState({});
  const { openSheet: openImportProcessWalletSheet, closeSheet: closeImportProcessWalletSheet } =
    useBottomSheetUtils(importProcessWalletSheetRef);

  const addWallet = useCallback(() => {
    const newWalletsInfo: newWalletsInfo = {
      walletType: WalletType.CHECKING,
      walletDetails: {
        name: walletName,
        description: walletDescription,
      },
    };
    dispatch(addNewWallets([newWalletsInfo]));
    setWalletDetails({
      name: walletName,
      description: walletDescription,
    });
    closeAddWalletSheet();
    expandCreateWalletSheet();
    setTimeout(() => {
      createWalletSheetRef?.current.close();
      expandSuccessSheet();
    }, 500 * 7);
  }, [walletName, walletDescription]);

  const importWallet = useCallback(() => {
    const mnemonic = importKey.trim();
    if (mnemonic) {
      const walletDetails = {
        name: importWalletType,
      };
      dispatch(importNewWallet(mnemonic, walletDetails));
      closeImportWalletSheet();
      openImportProcessWalletSheet();
      setTimeout(() => {
        closeImportProcessWalletSheet();
        expandSuccessImportSheet();
      }, 500 * 7);
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
      description: 'Start stacking sats',
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

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Add a Wallet"
        subtitle="Set up a wallet for you bitcoin"
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
        walletName={walletName}
        setWalletName={setWalletName}
        walletDescription={walletDescription}
        setWalletDescription={setWalletDescription}
        addWallet={addWallet}
      />
      <CreateWalletSheet
        createWalletSheetRef={createWalletSheetRef}
        title={'Creating your wallet'}
        processMap={processMapCreate}
      />
      <CreateWalletSheet
        createWalletSheetRef={importProcessWalletSheetRef}
        title={'Importing Wallet'}
        processMap={processMapImport}
      />
      <SuccessSheet
        Icon={MultiSigIcon}
        sheetTitle={'Wallet Creation Successful'}
        title={walletDetails?.name}
        subTitle={walletDetails?.description}
        successSheetRef={successSheetRef}
        primaryText="View Wallet"
      />
      <SuccessSheet
        Icon={BlueWalletIcon}
        sheetTitle={'Wallet Imported Successfully'}
        title={importWalletType}
        subTitle={'Daily Spend'}
        successSheetRef={successSheetImportRef}
        primaryText="View Wallet"
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
