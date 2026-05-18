import React, { useCallback, useEffect, useState, useRef, useContext } from 'react';
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
import { EntityKind, TxPriority, VaultType } from 'src/services/wallets/enums';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import useWallets from 'src/hooks/useWallets';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
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
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import {
  DONATE_DUST_DESTINATION,
  DONATE_DUST_UNBUILDABLE_ERROR,
  getDoNotSpendUTXOs,
  MIN_DONATE_DUST_FEE_RATE,
} from 'src/services/wallets/operations/spendability';
import WalletOperations from 'src/services/wallets/operations';
import { MANAGEWALLETS } from 'src/navigation/contants';

function Footer({
  utxos,
  wallet,
  setEnableSelection,
  enableSelection,
  selectedUTXOs,
  canDonateDust,
  onDonateDust,
}) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return enableSelection ? (
    <>
      <FinalizeFooter
        setEnableSelection={setEnableSelection}
        secondaryText={common.cancel}
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
      onDonateDust={onDonateDust}
      canDonateDust={canDonateDust}
    />
  );
}
type ScreenProps = NativeStackScreenProps<AppStackParams, 'UTXOManagement'>;
function UTXOManagement({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
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
  const [showDonateDustModal, setShowDonateDustModal] = useState(false);
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && selectedWallet ? !!walletSyncing[selectedWallet.id] : false;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
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
  const utxoSpendability = useAppSelector((state) => state.utxos.spendability);
  const spendabilityMap = selectedWallet
    ? new Map(Object.entries(utxoSpendability[selectedWallet.id] || {}))
    : new Map();
  const doNotSpendUTXOs = selectedWallet ? getDoNotSpendUTXOs(spendabilityMap, utxos) : [];

  const handleConfirmDonateDust = useCallback(() => {
    if (!selectedWallet || !doNotSpendUTXOs.length) {
      setShowDonateDustModal(false);
      return;
    }

    const totalDoNotSpendSats = doNotSpendUTXOs.reduce((sum, utxo) => sum + utxo.value, 0);
    const donationOutput = [{ address: DONATE_DUST_DESTINATION, value: totalDoNotSpendSats }];

    const { txPrerequisites } = WalletOperations.prepareCustomTransactionPrerequisites(
      selectedWallet,
      donationOutput,
      MIN_DONATE_DUST_FEE_RATE,
      doNotSpendUTXOs
    );

    const donationInputs = txPrerequisites?.[TxPriority.CUSTOM]?.inputs;
    if (!donationInputs || !donationInputs.length) {
      setShowDonateDustModal(false);
      showToast(DONATE_DUST_UNBUILDABLE_ERROR);
      return;
    }

    setShowDonateDustModal(false);
    navigation.dispatch(
      StackActions.push('AddSendAmount', {
        sender: selectedWallet,
        internalRecipients: [null],
        address: DONATE_DUST_DESTINATION,
        amount: '0',
        note: 'Donate Dust',
        selectedUTXOs: doNotSpendUTXOs,
        totalUtxosAmount: totalDoNotSpendSats,
        parentScreen: MANAGEWALLETS,
        isSendMax: true,
        recipients: [],
        totalRecipients: 1,
        currentRecipientIdx: 1,
        donateDustMode: true,
        donateDustFeePerByte: MIN_DONATE_DUST_FEE_RATE,
      })
    );
  }, [selectedWallet, doNotSpendUTXOs, navigation, showToast]);

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
        <WalletHeader title={common.manageCoins} rightComponent={<CurrencyTypeSwitch />} />
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
              canDonateDust={doNotSpendUTXOs.length > 0}
              onDonateDust={() => setShowDonateDustModal(true)}
            />
          ) : null}
        </Box>
      </Box>
      <KeeperModal
        visible={showDonateDustModal}
        close={() => setShowDonateDustModal(false)}
        title="Donate Dust"
        subTitle="Only coins marked Do Not Spend will be used. Fees are paid from those coins only."
        buttonText="Donate Dust"
        buttonCallback={handleConfirmDonateDust}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setShowDonateDustModal(false)}
        Content={() => (
          <Box>
            <Box marginTop={hp(5)}>
              <Box marginBottom={hp(8)}>
                <ThemedSvg name={'NoTransactionIcon'} />
              </Box>
              <Box marginBottom={hp(6)}>
                <UTXOSelectionTotal
                  selectionTotal={doNotSpendUTXOs.reduce((sum, utxo) => sum + utxo.value, 0)}
                  selectedUTXOs={doNotSpendUTXOs}
                />
              </Box>
            </Box>
          </Box>
        )}
      />
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
