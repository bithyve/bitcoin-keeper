import React, { useState, useContext, useEffect } from 'react';
import { View, Box, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import { updateVaultDetails, updateWalletDetails } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyVaultState, resetRealyWalletState } from 'src/store/reducers/bhr';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { EntityKind } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';

type Props = {
  wallet: Wallet | Vault | USDTWallet | {};
  close: () => void;
};

function EditWalletDetailsModal({ wallet = {}, close }: Props) {
  const dispatch = useDispatch();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletText, vault: vaultText } = translations;

  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage, relayVaultUpdateLoading } =
    useAppSelector((state) => state.bhr);

  const [walletName, setWalletName] = useState(wallet.presentationData.name);
  const [walletDescription, setWalletDescription] = useState(wallet.presentationData.description);
  const { updateWallet } = useUSDTWallets();

  const editWallet = async () => {
    const details = {
      name: walletName,
      description: walletDescription,
    };
    if ((wallet as Vault).entityKind === EntityKind.VAULT) {
      dispatch(updateVaultDetails(wallet as Vault, details));
    } else if ((wallet as USDTWallet).entityKind === EntityKind.USDT_WALLET) {
      const updatedWallet: USDTWallet = {
        ...(wallet as USDTWallet),
        presentationData: {
          ...(wallet as USDTWallet).presentationData,
          name: walletName,
          description: walletDescription,
        },
      };
      const updated = await updateWallet(updatedWallet);
      if (updated) {
        showToast(walletText.walletDeatilsUpdated, <TickIcon />);
        close();
      } else {
        showToast('Failed to update the details', <ToastErrorIcon />);
      }
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
      close();
      showToast(walletText.walletDeatilsUpdated, <TickIcon />);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  useEffect(() => {
    if (relayVaultError) {
      showToast(realyVaultErrorMessage, <ToastErrorIcon />);
      dispatch(resetRealyVaultState());
    }
    if (relayVaultUpdate) {
      close();
      showToast(vaultText.vaultDetailsUpdated, <TickIcon />);
      dispatch(resetRealyVaultState());
    }
  }, [relayVaultUpdate, relayVaultError, realyVaultErrorMessage]);

  return (
    <Box>
      <KeeperTextInput
        value={walletName}
        onChangeText={setWalletName}
        placeholder=""
        testID="walletName"
        maxLength={18}
        height={50}
        placeholderTextColor={`${colorMode}.SlateGreen`}
      />
      <KeeperTextInput
        value={walletDescription}
        onChangeText={setWalletDescription}
        placeholder={walletText.WalletDescriptionPlaceholder}
        testID="walletDescription"
        maxLength={20}
        height={50}
        placeholderTextColor={`${colorMode}.SlateGreen`}
      />
      <View style={styles.buttonWrapper}>
        <Buttons
          secondaryText={common.cancel}
          secondaryCallback={close}
          primaryText={common.save}
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
    </Box>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    marginTop: 40,
  },
});
export default EditWalletDetailsModal;
