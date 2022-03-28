import React, { useRef, useCallback, useState } from 'react';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Input, View } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { FlatList, Text } from 'react-native';
import StatusBarComponent from 'src/components/StatusBarComponent';
import AccordionsComponent from 'src/components/AccordionsComponent';
import HardWare from 'src/assets/images/svgs/hardware.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import { useNavigation } from '@react-navigation/native';
import HexaBottomSheet from 'src/components/BottomSheet';
import QRscanner from 'src/components/QRscanner';
import { useDispatch } from 'react-redux';
import { addNewAccountShells } from 'src/store/actions/accounts';
import { newAccountsInfo } from 'src/store/sagas/accounts';
import { AccountType } from 'src/bitcoin/utilities/Interface';
import BottomSheet from '@gorhom/bottom-sheet';

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
      snapPoints={['50%']}
      bottomSheetRef={addWalletSheetRef}
      primaryText={'Create'}
      secondaryText={'Cancel'}
      primaryCallback={addWallet}
      secondaryCallback={closeAddWalletSheet}
    >
      <Input
        w="100%"
        placeholder={addWalletType}
        value={addWalletType}
        onChangeText={(value) => setAddWalletType(value)}
        style={{ padding: 30 }}
        size={'lg'}
        backgroundColor={'#D8A57210'}
        color={'#073E39'}
        borderWidth={'0'}
        padding={3}
      />
      <Input
        w="100%"
        placeholder="Account Name"
        value={accountName}
        onChangeText={(value) => setAccountName(value)}
        size={'lg'}
        backgroundColor={'#D8A57210'}
        color={'#073E39'}
        borderWidth={'0'}
        padding={3}
      />
      <Input
        w="100%"
        placeholder="Description"
        value={accountDescription}
        onChangeText={(value) => setAccountDescription(value)}
        size={'lg'}
        backgroundColor={'#D8A57210'}
        color={'#073E39'}
        borderWidth={'0'}
        padding={3}
      />
    </HexaBottomSheet>
  );
};

const AddVaultSheet = ({ addVaultSheetRef, closeAddVaultSheet }) => {
  return (
    <HexaBottomSheet
      title={'Import Vault Key'}
      subTitle={'Insert a seed to import your exsisting Vault Key'}
      snapPoints={['70%']}
      bottomSheetRef={addVaultSheetRef}
      primaryText={'Import'}
      secondaryText={'Scan'}
      secondaryCallback={closeAddVaultSheet}
    >
      <QRscanner />
    </HexaBottomSheet>
  );
};

const AddWalletScreen = () => {
  const [addWalletType, setAddWalletType] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountDescription, setAccountDescription] = useState('');

  const addVaultSheetRef = useRef<BottomSheet>(null);
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
  }, []);

  const closeAddWalletSheet = useCallback(() => {
    addWalletSheetRef.current?.close();
  }, []);

  const expandAddWalletSheet = useCallback((addWalletType) => {
    setAddWalletType(addWalletType);
    addWalletSheetRef.current?.expand();
  }, []);

  const closeAddVaultSheet = useCallback(() => {
    addWalletSheetRef.current?.close();
  }, []);

  const expandAddVaultSheet = useCallback(() => {
    addVaultSheetRef.current?.expand();
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
      ],
    },
    {
      id: 2,
      heading: 'Import a Wallet',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [],
    },
    {
      id: 3,
      heading: 'Add a Vault',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [],
      onPress: expandAddVaultSheet,
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
      <AddVaultSheet addVaultSheetRef={addVaultSheetRef} closeAddVaultSheet={addVaultSheetRef} />
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
