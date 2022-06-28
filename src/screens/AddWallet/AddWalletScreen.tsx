import React, { useRef, useCallback, useState, useContext } from 'react';
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
import { WalletType } from 'src/core/wallets/enums';
import { LocalizationContext } from 'src/common/content/LocContext';

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

  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];

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
      heading: wallet.Createwallet,
      description: wallet.Startstackingsats,
      items: [
        {
          title: wallet.SinglesigWallet,
          description: wallet.Foryourdaytodayspends,
          icon: HardWare,
          onPress: expandAddWalletSheet,
        },
        {
          title: wallet.MultisigWallet,
          description: wallet.Forlongtermholding,
          icon: MultiSigIcon,
          onPress: expandAddWalletSheet,
        },
        {
          title: wallet.MultisigHardwareWallet,
          description: wallet.Theultimatelongtermbitcoinsecurity,
          icon: HardWare,
          onPress: expandAddWalletSheet,
        },
      ],
    },
    {
      id: 2,
      heading: wallet.ImportWallet,
      description: wallet.Backupanotherbitcoinwallet,
      items: [
        {
          title: wallet.TrustWallet,
          description: '',
          icon: TrustIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: wallet.Coinbase,
          description: '',
          icon: CoinBaseIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: wallet.BlueWallet,
          description: '',
          icon: BlueWalletIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: wallet.MunnWallet,
          description: '',
          icon: MuunIcon,
          onPress: expandImportWalletSheet,
        },
        {
          title: wallet.Blockchain,
          description: '',
          icon: BlockhchainIcon,
          onPress: expandImportWalletSheet,
        },
      ],
    },
    {
      id: 3,
      heading: wallet.AddVault,
      description: wallet.Backupanotherbitcoinwallet,
      items: [],
    },
  ];

  const renderItem = ({ item }) => <AccordionsComponent item={item} />;

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={wallet.AddWallet}
        subtitle={wallet.Setupawalletforyoubitcoin}
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
        title={wallet.Creatingyourwallet}
        processMap={processMapCreate}
      />
      <CreateWalletSheet
        createWalletSheetRef={importProcessWalletSheetRef}
        title={wallet.ImportingWallet}
        processMap={processMapImport}
      />
      <SuccessSheet
        Icon={MultiSigIcon}
        sheetTitle={wallet.WalletCreationSuccessful}
        title={walletDetails?.name}
        subTitle={walletDetails?.description}
        successSheetRef={successSheetRef}
        primaryText={wallet.ViewWallet}
      />
      <SuccessSheet
        Icon={BlueWalletIcon}
        sheetTitle={wallet.WalletImportedSuccessfully}
        title={importWalletType}
        subTitle={wallet.DailySpend}
        successSheetRef={successSheetImportRef}
        primaryText={wallet.ViewWallet}
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
