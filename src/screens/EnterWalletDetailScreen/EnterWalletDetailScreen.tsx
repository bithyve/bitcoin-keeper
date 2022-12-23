import React, { useCallback, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, View, Text } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Buttons from 'src/components/Buttons';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import { WalletType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/common/content/LocContext';
import BitcoinGreyIcon from 'src/assets/images/svgs/btc_grey.svg';

function EnterWalletDetailScreen({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const { common } = translations;
  const [walletName, setWalletName] = useState(`Wallet ${route?.params + 1}`);
  const [walletDescription, setWalletDescription] = useState(wallet.SinglesigWallet);
  const [transferPolicy, setTransferPolicy] = useState('1000000');
  const createNewWallet = useCallback(() => {
    const newWallet: NewWalletInfo = {
      walletType: WalletType.CHECKING,
      walletDetails: {
        name: walletName,
        description: walletDescription,
        transferPolicy: Number(transferPolicy),
      },
    };
    dispatch(addNewWallets([newWallet]));
    navigtaion.goBack();
  }, [walletName, walletDescription, transferPolicy]);

  const formatNumber = (value) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return (
    <View style={styles.Container} background="light.ReceiveBackground">
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={wallet.AddNewWallet}
        subtitle={wallet.AddNewWalletDescription}
        onPressHandler={() => navigtaion.goBack()}
        paddingTop={3}
      />
      <View marginX={4} marginY={4}>
        <Input
          placeholder={wallet.WalletNamePlaceHolder}
          placeholderTextColor="light.GreyText"
          backgroundColor="#fdf7f1"
          value={walletName}
          onChangeText={(value) => setWalletName(value)}
          style={styles.inputField}
          borderRadius={10}
          height={12}
          autoCorrect={false}
          marginY={2}
          borderWidth="1"
        />
        <Input
          placeholder={wallet.WalletDescriptionPlaceholder}
          placeholderTextColor="light.GreyText"
          backgroundColor="#fdf7f1"
          value={walletDescription}
          onChangeText={(value) => setWalletDescription(value)}
          style={styles.inputField}
          borderRadius={10}
          height={12}
          autoCorrect={false}
          borderWidth="1"
          marginY={2}
        />
        <Box marginTop={5}>
          <Text color={'light.GreyText'}
            style={styles.autoTransferText}>{wallet.AutoTransferInitiated}</Text>
          <Box style={styles.transferPolicyTextArea}>
            <Box style={styles.bitcoinLogo}>
              <BitcoinGreyIcon height="15" width="15" />
            </Box>
            <Text
              style={[styles.splitter]}>|</Text>
            <Input
              placeholderTextColor="light.GreyText"
              value={formatNumber(transferPolicy)}
              onChangeText={(value) => setTransferPolicy(formatNumber(value))}
              autoCorrect={false}
              fontSize={22}
              fontWeight="700"
              keyboardType='numeric'
              borderWidth="0"
            />
            <Box style={styles.sats}>
              <Text fontWeight='bold'>{common.sats}</Text>
            </Box>
          </Box>
          <Text
            color={'light.GreyText'}
            style={styles.autoTransferTextDesc}>{wallet.AutoTransferInitiatedDesc}</Text>
        </Box>
        <View marginY={5}>
          <Buttons
            secondaryText={common.cancel}
            secondaryCallback={() => {
              navigtaion.goBack();
            }}
            primaryText={common.create}
            primaryCallback={createNewWallet}
            primaryDisable={!walletName || !walletDescription}
          />
        </View>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  autoTransferText: {
    fontSize: 15,
  },
  autoTransferTextDesc: {
    fontSize: 12,
    paddingTop: 10
  },
  addWalletText: {
    fontSize: 22,
    lineHeight: '20@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  },
  inputField: {
    color: '#073E39',
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 13,
    letterSpacing: 0.96,
  },
  transferPolicyTextArea: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#fdf7f1",
    borderColor: '#f4eee9'
  },
  splitter: {
    fontSize: 30,
    color: '#eeefed',
    paddingTop: 18,
    paddingRight: 5,
  },
  bitcoinLogo: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 5,
    paddingBottom: 15,
  },
  sats: {
    paddingTop: 14,
    paddingRight: 5,
  }
});
export default EnterWalletDetailScreen;
