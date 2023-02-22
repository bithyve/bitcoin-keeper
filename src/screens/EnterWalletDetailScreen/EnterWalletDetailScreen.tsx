import React, { useCallback, useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, View, Select } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Buttons from 'src/components/Buttons';
import { DerivationConfig, NewWalletInfo } from 'src/store/sagas/wallets';
import { DerivationPurpose, EntityKind, WalletType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/common/content/LocContext';
import BitcoinGreyIcon from 'src/assets/images/btc_grey.svg';
import KeeperText from 'src/components/KeeperText';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import { v4 as uuidv4 } from 'uuid';
import { wp } from 'src/common/data/responsiveness/responsive';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { Linking } from 'react-native';

// eslint-disable-next-line react/prop-types
function EnterWalletDetailScreen({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const { common } = translations;
  const [walletType, setWalletType] = useState(route.params?.type);
  const [importedSeed, setImportedSeed] = useState(route.params?.seed?.replace(/,/g, ' '));
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);
  const [transferPolicy, setTransferPolicy] = useState(defaultTransferPolicyThreshold.toString());
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError } = useAppSelector(
    (state) => state.bhr
  );
  const [purpose, setPurpose] = useState(`${DerivationPurpose.BIP84}`);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(
      EntityKind.WALLET,
      config.NETWORK_TYPE,
      0,
      Number(purpose)
    );
    setPath(path);
  }, [purpose]);

  const createNewWallet = useCallback(() => {
    setWalletLoading(true);

    const derivationConfig: DerivationConfig = {
      path,
      purpose: Number(purpose),
    };

    const newWallet: NewWalletInfo = {
      walletType,
      walletDetails: {
        name: walletName,
        description: walletDescription,
        derivationConfig: walletType === WalletType.DEFAULT ? derivationConfig : null,
        transferPolicy: {
          id: uuidv4(),
          threshold: parseInt(transferPolicy),
        },
      },
      importDetails: {
        derivationConfig,
        // eslint-disable-next-line react/prop-types
        mnemonic: importedSeed,
      },
    };
    dispatch(addNewWallets([newWallet]));
  }, [walletName, walletDescription, transferPolicy]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        showToast('New wallet created!', <TickIcon />);
        navigtaion.goBack();
      } else {
        showToast('Wallet imported', <TickIcon />);
        navigtaion.goBack();
        Linking.openURL(`${route?.params.appId}://backup/true`);
      }
    }
    if (relayWalletError) {
      showToast('Wallet creation failed!', <ToastErrorIcon />);
      setWalletLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

  // Format number with comma
  // Example: 1000000 => 1,000,000
  const formatNumber = (value: string) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const onQrScan = (qrData) => {
    navigtaion.goBack();
    const words = qrData.split(' ');
    if (words.length === 12 || words.length === 24) {
      setImportedSeed(qrData);
      setWalletType(WalletType.IMPORTED);
    } else {
      showToast('Invalid QR');
    }
  };

  const renderAdvanceOptions = () => (
    <Box>
      <KeeperText type="regular" style={[styles.autoTransferText, { color: 'light.GreyText' }]}>
        Path
      </KeeperText>
      <Box backgroundColor="light.primaryBackground" style={styles.inputFieldWrapper}>
        <Input
          placeholder="Path"
          placeholderTextColor="light.GreyText"
          value={path}
          onChangeText={(value) => setPath(value)}
          style={styles.inputField}
          width={wp(260)}
          autoCorrect={false}
          marginY={2}
          borderWidth="0"
          maxLength={20}
        />
      </Box>
      <KeeperText type="regular" style={[styles.autoTransferText, { color: 'light.GreyText' }]}>
        Purpose
      </KeeperText>
      <Select
        style={{ backgroundColor: 'red' }}
        selectedValue={purpose}
        minWidth="200"
        accessibilityLabel="Choose Service"
        placeholder="Choose Purpose"
        mt={1}
        onValueChange={(itemValue) => setPurpose(itemValue)}
      >
        <Select.Item label="P2PKH: legacy, single-sig" value={`${DerivationPurpose.BIP44}`} />
        <Select.Item
          label="P2SH-P2WPKH: wrapped segwit, single-sg"
          value={`${DerivationPurpose.BIP49}`}
        />
        <Select.Item
          label="P2WPKH: native segwit, single-sig"
          value={`${DerivationPurpose.BIP84}`}
        />
      </Select>
    </Box>
  );

  return (
    <View style={styles.Container} background="light.mainBackground">
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={walletType === WalletType.DEFAULT ? `${wallet.AddNewWallet}` : 'Import'}
        subtitle={wallet.AddNewWalletDescription}
        onPressHandler={() => navigtaion.goBack()}
        paddingTop={3}
      />
      <View marginX={4} marginY={4}>
        <Box backgroundColor="light.primaryBackground" style={styles.inputFieldWrapper}>
          <Input
            placeholder={wallet.WalletNamePlaceHolder}
            placeholderTextColor="light.GreyText"
            value={walletName}
            onChangeText={(value) => setWalletName(value)}
            style={styles.inputField}
            width={wp(260)}
            autoCorrect={false}
            marginY={2}
            borderWidth="0"
            maxLength={20}
            testID={`input_${walletName}`}
          />
          <KeeperText color="light.GreyText" style={styles.limitText}>
            {walletName && walletName.length}/20
          </KeeperText>
        </Box>
        <Box backgroundColor="light.primaryBackground" style={styles.inputFieldWrapper}>
          <Input
            placeholder={wallet.WalletDescriptionPlaceholder}
            placeholderTextColor="light.GreyText"
            value={walletDescription}
            onChangeText={(value) => setWalletDescription(value)}
            style={styles.inputField}
            width={wp(260)}
            autoCorrect={false}
            borderWidth="0"
            marginY={2}
            maxLength={40}
            testID={`input_${walletDescription}`}
          />
          <KeeperText color="light.GreyText" style={styles.limitText}>
            {walletDescription && walletDescription.length}/40
          </KeeperText>
        </Box>
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
              onChangeText={(value) => setTransferPolicy(value)}
              autoCorrect={false}
              fontSize={15}
              fontWeight="300"
              style={styles.transferPolicyInput}
              keyboardType="numeric"
              borderWidth="0"
              letterSpacing={3}
              color="light.greenText"
              testID={`input_${formatNumber(transferPolicy)}`}
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
        {walletType === WalletType.IMPORTED && renderAdvanceOptions()}
        <View marginY={5}>
          <Buttons
            secondaryText={common.cancel}
            secondaryCallback={() => {
              navigtaion.goBack()
              /* navigtaion.dispatch(
                 CommonActions.navigate({
                   name: 'ScanQR',
                   params: {
                     title: `Import`,
                     subtitle: 'Please scan seed words',
                     onQrScan,
                   },
                 })
               ); */
            }}
            primaryText={`${common.create}`}
            primaryCallback={createNewWallet}
            primaryDisable={!walletName || !walletDescription}
            primaryLoading={walletLoading || relayWalletUpdateLoading}
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
  inputFieldWrapper: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  inputField: {
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 12,
    letterSpacing: 0.96,
  },
  limitText: {
    marginRight: 10,
    fontSize: 10,
    alignSelf: 'flex-end',
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
