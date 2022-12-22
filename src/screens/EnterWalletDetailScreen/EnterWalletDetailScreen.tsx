import React, { useCallback, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import { Box, Input, View } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { newWalletInfo } from 'src/store/sagas/wallets';
import { WalletType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/common/content/LocContext';

function EnterWalletDetailScreen({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const { common } = translations;

  const [walletName, setWalletName] = useState(`Wallet ${route?.params + 1}`);
  const [walletDescription, setWalletDescription] = useState(wallet.SinglesigWallet);
  const [transferPolicy, setTransferPolicy] = useState('5000');
  const createNewWallet = useCallback(() => {
    const newWallet: newWalletInfo = {
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

  return (
    <View style={styles.Container} background="light.ReceiveBackground">
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={wallet.AddNewWallet}
        subtitle={wallet.Setupawalletforyoubitcoin}
        onPressHandler={() => navigtaion.goBack()}
        paddingTop={3}
      />
      <View marginX={4} marginY={windowHeight / 12}>
        <Input
          placeholder={wallet.WalletName}
          placeholderTextColor="light.greenText"
          backgroundColor="light.primaryBackground"
          value={walletName}
          onChangeText={(value) => setWalletName(value)}
          style={styles.inputField}
          borderRadius={10}
          marginY={2}
          borderWidth="0"
        />
        <Input
          placeholder={wallet.SinglesigWallet}
          placeholderTextColor="light.greenText"
          backgroundColor="light.primaryBackground"
          value={walletDescription}
          onChangeText={(value) => setWalletDescription(value)}
          style={styles.inputField}
          borderRadius={10}
          borderWidth="0"
          marginY={2}
        />
        <Box marginTop={10}>
          <Text fontWeight="200">Transfer Policy</Text>
          <Input
            placeholder={wallet.TransferPolicy}
            placeholderTextColor="light.greenText"
            backgroundColor="light.primaryBackground"
            value={transferPolicy}
            onChangeText={(value) => setTransferPolicy(value)}
            style={styles.inputField}
            borderRadius={10}
            borderWidth="0"
            marginY={2}
          />
        </Box>
        <View marginY={20}>
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
    padding: 30,
    color: '#073E39',
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 13,
    letterSpacing: 0.96,
  },
});
export default EnterWalletDetailScreen;
