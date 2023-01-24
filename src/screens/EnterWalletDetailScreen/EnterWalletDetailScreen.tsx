import React, { useCallback, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, View } from 'native-base';
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
import BitcoinGreyIcon from 'src/assets/images/btc_grey.svg';
import KeeperText from 'src/components/KeeperText';
import { isTestnet } from 'src/common/constants/Bitcoin';

function EnterWalletDetailScreen({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const { common } = translations;
  const [walletName, setWalletName] = useState(`Wallet ${route?.params + 1}`);
  const [walletDescription, setWalletDescription] = useState(wallet.SinglesigWallet);
  const [transferPolicy, setTransferPolicy] = useState(isTestnet() ? '5000' : '1000000');

  const createNewWallet = useCallback(() => {
    const newWallet: NewWalletInfo = {
      walletType: WalletType.DEFAULT,
      walletDetails: {
        name: walletName,
        description: walletDescription,
        transferPolicy: Number(transferPolicy),
      },
    };
    dispatch(addNewWallets([newWallet]));
    navigtaion.goBack();
  }, [walletName, walletDescription, transferPolicy]);

  // Format number with comma
  // Example: 1000000 => 1,000,000
  const formatNumber = (value: string) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <View style={styles.Container} background="light.mainBackground">
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
          backgroundColor="light.primaryBackground"
          value={walletName}
          onChangeText={(value) => setWalletName(value)}
          style={styles.inputField}
          borderRadius={10}
          height={12}
          autoCorrect={false}
          marginY={2}
          borderWidth="0"
        />
        <Input
          placeholder={wallet.WalletDescriptionPlaceholder}
          placeholderTextColor="light.GreyText"
          backgroundColor="light.primaryBackground"
          value={walletDescription}
          onChangeText={(value) => setWalletDescription(value)}
          style={styles.inputField}
          borderRadius={10}
          height={12}
          autoCorrect={false}
          borderWidth="0"
          marginY={2}
        />
        <Box marginTop={5}>
          <KeeperText type="regular" style={[styles.autoTransferText, { color: 'light.GreyText' }]}>
            {wallet.AutoTransferInitiated}
          </KeeperText>
          <Box style={styles.transferPolicyTextArea}>
            <Box style={styles.bitcoinLogo}>
              <BitcoinGreyIcon height="15" width="15" />
            </Box>
            <KeeperText style={[styles.splitter, { color: 'light.divider' }]}>|</KeeperText>
            <Input
              placeholderTextColor="light.GreyText"
              value={formatNumber(transferPolicy)}
              onChangeText={(value) => setTransferPolicy(formatNumber(value))}
              autoCorrect={false}
              fontSize={15}
              fontWeight="300"
              style={styles.transferPolicyInput}
              keyboardType="numeric"
              borderWidth="0"
              letterSpacing={3}
              color="light.greenText"
            />
            <Box style={styles.sats}>
              <KeeperText type="bold">{common.sats}</KeeperText>
            </Box>
          </Box>
          <KeeperText
            type="regular"
            style={[styles.autoTransferTextDesc, { color: 'light.GreyText' }]}
          >
            {wallet.AutoTransferInitiatedDesc}
          </KeeperText>
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
    fontSize: 12,
    letterSpacing: '0.6@s',
  },
  autoTransferTextDesc: {
    fontSize: 10,
    paddingTop: 10,
    letterSpacing: '0.5@s',
  },
  transferPolicyInput: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  },
  inputField: {
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 12,
    letterSpacing: 0.96,
  },
  transferPolicyTextArea: {
    flexDirection: 'row',
    borderWidth: 0,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#fdf7f1',
    borderColor: '#f4eee9',
  },
  splitter: {
    fontSize: 30,
    paddingTop: 18,
    paddingRight: 5,
    opacity: 0.25,
  },
  bitcoinLogo: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 5,
    paddingBottom: 15,
    opacity: 0.25,
  },
  sats: {
    paddingTop: 12,
    paddingRight: 5,
  },
});
export default EnterWalletDetailScreen;
