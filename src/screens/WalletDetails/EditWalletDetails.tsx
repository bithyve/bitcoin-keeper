import React, { useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Box, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

import KeeperHeader from 'src/components/KeeperHeader';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { windowHeight, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { updateVaultDetails, updateWalletDetails } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyVaultState, resetRealyWalletState } from 'src/store/reducers/bhr';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import { EntityKind } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'EditWalletDetails'>;
function EditWalletSettings({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const walletText = translations.wallet;
  const { common } = translations;

  const { wallet } = route.params || {};
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage, relayVaultUpdateLoading } =
    useAppSelector((state) => state.bhr);

  const [walletName, setWalletName] = useState(wallet.presentationData.name);
  const [walletDescription, setWalletDescription] = useState(wallet.presentationData.description);

  const editWallet = () => {
    const details = {
      name: walletName,
      description: walletDescription,
    };
    if (wallet.entityKind === EntityKind.VAULT) {
      dispatch(updateVaultDetails(wallet as Vault, details));
    } else {
      dispatch(updateWalletDetails(wallet as Wallet, details));
    }
  };

  useEffect(() => {
    if (relayWalletError) {
      showToast(realyWalletErrorMessage, <ToastErrorIcon />);
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      navigtaion.goBack();
      showToast('Wallet details updated', <TickIcon />);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  useEffect(() => {
    if (relayVaultError) {
      showToast(realyVaultErrorMessage, <ToastErrorIcon />);
      dispatch(resetRealyVaultState());
    }
    if (relayVaultUpdate) {
      navigtaion.goBack();
      showToast('Vault details updated', <TickIcon />);
      dispatch(resetRealyVaultState());
    }
  }, [relayVaultUpdate, relayVaultError, realyVaultErrorMessage]);

  return (
    <Box style={styles.Container} background={`${colorMode}.primaryBackground`}>
      <StatusBarComponent padding={50} />
      <KeeperHeader title={walletText.WalletDetails} subtitle={walletText.EditWalletDeatils} />
      <View style={styles.inputWrapper}>
        <KeeperTextInput
          value={walletName}
          onChangeText={setWalletName}
          placeholder={''}
          testID={'walletName'}
          maxLength={20}
        />
        <KeeperTextInput
          value={walletDescription}
          onChangeText={setWalletDescription}
          placeholder={walletText.WalletDescriptionPlaceholder}
          testID={'walletDescription'}
          maxLength={40}
        />
        <View style={styles.buttonWrapper}>
          <Buttons
            secondaryText={common.cancel}
            secondaryCallback={() => {
              navigtaion.goBack();
            }}
            primaryText="Save"
            primaryCallback={editWallet}
            primaryLoading={
              relayWalletUpdateLoading ||
              relayWalletUpdate ||
              relayVaultUpdateLoading ||
              relayVaultUpdate
            }
            primaryDisable={!walletName}
          />
        </View>
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
  },
  addWalletText: {
    fontSize: 22,
    lineHeight: 20,
    letterSpacing: 0.7,
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  inputField: {
    padding: 30,
    color: '#073E39',
    marginVertical: 10,
    fontSize: 13,
    letterSpacing: 0.96,
  },
  inputFieldWrapper: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  inputWrapper: {
    marginHorizontal: 4,
    marginVertical: windowHeight / 15,
  },
  limitText: {
    marginRight: 10,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  buttonWrapper: {
    marginVertical: 25,
  },
});
export default EditWalletSettings;
