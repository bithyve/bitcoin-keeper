import React, { useCallback, useEffect, useState, useRef } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoTransactionIcon from 'src/assets/images/no_transaction_icon.svg';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import { hp, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { StyleSheet } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { EntityKind, VaultType } from 'src/services/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useWallets from 'src/hooks/useWallets';
import { Box, useColorMode } from 'native-base';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { resetSyncing } from 'src/store/reducers/wallets';
import useVault from 'src/hooks/useVault';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import useToastMessage from 'src/hooks/useToastMessage';
import WalletHeader from 'src/components/WalletHeader';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function Footer({ utxos, wallet, setEnableSelection, enableSelection, selectedUTXOs }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);

  return enableSelection ? (
    <>
      <FinalizeFooter
        setEnableSelection={setEnableSelection}
        secondaryText="Cancel"
        footerCallback={() => {
          if (
            wallet.entityKind === EntityKind.VAULT &&
            (wallet as Vault).type === VaultType.MINISCRIPT
          ) {
            miniscriptPathSelectorRef.current?.selectVaultSpendingPaths();
          } else {
            setEnableSelection(false);
            navigation.dispatch(CommonActions.navigate('Send', { sender: wallet, selectedUTXOs }));
          }
        }}
        selectedUTXOs={selectedUTXOs}
      />
      <MiniscriptPathSelector
        ref={miniscriptPathSelectorRef}
        vault={wallet}
        onPathSelected={(satisfier) => {
          setEnableSelection(false);
          navigation.dispatch(
            CommonActions.navigate('Send', {
              sender: wallet,
              selectedUTXOs,
              miniscriptSelectedSatisfier: satisfier,
            })
          );
        }}
        onError={(err) => showToast(err)}
        onCancel={() => setEnableSelection(true)}
      />
    </>
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      enableSelection={enableSelection}
      wallet={wallet}
      utxos={utxos}
    />
  );
}
type ScreenProps = NativeStackScreenProps<AppStackParams, 'UTXOManagement'>;
function UTXOManagement({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { data, routeName, vaultId = '' } = route.params || {};
  const [enableSelection, _setEnableSelection] = useState(false);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const { id } = data;
  const wallet = vaultId
    ? useVault({ vaultId }).activeVault
    : useWallets({ walletIds: [id] }).wallets[0];
  const [selectedWallet, setSelectedWallet] = useState<Wallet | Vault>(wallet);
  const [selectedUTXOs, setSelectedUTXOs] = useState([]);
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && selectedWallet ? !!walletSyncing[selectedWallet.id] : false;

  useEffect(
    () => () => {
      dispatch(resetSyncing());
    },
    []
  );

  useEffect(() => {
    setSelectedWallet(wallet);
    if (!walletSyncing[wallet.id]) {
      dispatch(refreshWallets([wallet], { hardRefresh: false }));
    }
  }, []);

  const utxos = selectedWallet
    ? selectedWallet.specs.confirmedUTXOs
        ?.map((utxo) => {
          utxo.confirmed = true;
          return utxo;
        })
        .concat(
          selectedWallet.specs.unconfirmedUTXOs?.map((utxo) => {
            utxo.confirmed = false;
            return utxo;
          })
        )
    : [];

  useEffect(() => {
    const selectedUtxos = utxos || [];
    const selectedUTXOsFiltered = selectedUtxos.filter(
      (utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]
    );
    setSelectedUTXOs(selectedUTXOsFiltered);
  }, [selectedUTXOMap, selectionTotal]);

  const cleanUp = useCallback(() => {
    setSelectedUTXOMap({});
    setSelectionTotal(0);
  }, []);

  const setEnableSelection = useCallback(
    (value) => {
      _setEnableSelection(value);
      if (!value) {
        cleanUp();
      }
    },
    [cleanUp]
  );

  return (
    <ScreenWrapper paddingHorizontal={0} backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={syncing} showLoader />
      <Box style={{ marginLeft: wp(15), marginRight: wp(22) }}>
        <WalletHeader title="Manage Coins" rightComponent={<CurrencyTypeSwitch />} />
      </Box>
      <Box style={styles.contentContainer}>
        {enableSelection ? (
          <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} />
        ) : null}
        <UTXOList
          utxoState={utxos}
          enableSelection={enableSelection}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={selectedWallet}
          emptyIcon={
            routeName === 'Vault' ? <ThemedSvg name={'NoTransactionIcon'} /> : NoTransactionIcon
          }
        />
        <Box marginTop={hp(15)}>
          {utxos?.length ? (
            <Footer
              utxos={utxos}
              wallet={selectedWallet}
              setEnableSelection={setEnableSelection}
              enableSelection={enableSelection}
              selectedUTXOs={selectedUTXOs}
            />
          ) : null}
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  vaultInfoText: {
    marginLeft: wp(3),
    letterSpacing: 1.28,
  },
  contentContainer: {
    flex: 1,
    marginTop: hp(10),
    marginBottom: hp(15),
  },
});

export default UTXOManagement;
