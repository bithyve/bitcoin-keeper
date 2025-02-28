import React, { useCallback, useEffect, useState, useRef } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import NoTransactionIcon from 'src/assets/images/no_transaction_icon.svg';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Alert, StyleSheet } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { EntityKind, VaultType, WalletType } from 'src/services/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Buttons from 'src/components/Buttons';
import BatteryIllustration from 'src/assets/images/CautionIllustration.svg';
import useWallets from 'src/hooks/useWallets';
import { Box, useColorMode } from 'native-base';
import useWhirlpoolWallets, {
  whirlpoolWalletAccountMapInterface,
} from 'src/hooks/useWhirlpoolWallets';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { resetSyncing } from 'src/store/reducers/wallets';
import useVault from 'src/hooks/useVault';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LearnMoreModal from './components/LearnMoreModal';
import ErrorCreateTxoModal from './components/ErrorCreateTXOModal';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import useToastMessage from 'src/hooks/useToastMessage';
import WalletHeader from 'src/components/WalletHeader';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';

const getWalletBasedOnAccount = (
  depositWallet: Wallet,
  whirlpoolWalletAccountMap: whirlpoolWalletAccountMapInterface,
  accountType: string
) => {
  switch (accountType) {
    case WalletType.POST_MIX:
      return whirlpoolWalletAccountMap.postmixWallet;
    case WalletType.BAD_BANK:
      return whirlpoolWalletAccountMap.badbankWallet;
    case WalletType.PRE_MIX:
      return whirlpoolWalletAccountMap.premixWallet;
    default:
      return depositWallet;
  }
};

function Footer({
  utxos,
  depositWallet,
  wallet,
  setEnableSelection,
  enableSelection,
  selectedUTXOs,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  setIsRemix,
  initiateWhirlpool,
  initateWhirlpoolMix,
  setShowBatteryWarningModal,
  setSendBadBankModalVisible,
  selectedAccount,
  isRemix,
  setRemixingToVault,
  remixingToVault,
  vaultId,
}) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);
  const [miniscriptSelectedSatisfier, setMiniscriptSelectedSatisfier] = useState(null);

  const goToWhirlpoolConfiguration = () => {
    setEnableSelection(false);
    navigation.dispatch(
      CommonActions.navigate('WhirlpoolConfiguration', {
        utxos: selectedUTXOs || [],
        wallet,
      })
    );
  };

  const inititateWhirlpoolMixProcess = async () => {
    if (selectedUTXOs.length === 0) {
      Alert.alert('Please select atleast one UTXO');
      return;
    }
    setShowBatteryWarningModal(true);
  };

  return enableSelection ? (
    <>
      <FinalizeFooter
        initiateWhirlpool={initiateWhirlpool}
        setEnableSelection={setEnableSelection}
        setInitiateWhirlpool={setInitiateWhirlpool}
        initateWhirlpoolMix={initateWhirlpoolMix}
        setInitateWhirlpoolMix={setInitateWhirlpoolMix}
        secondaryText="Cancel"
        footerCallback={() => {
          if (initateWhirlpoolMix) {
            inititateWhirlpoolMixProcess();
          } else if (initiateWhirlpool) {
            goToWhirlpoolConfiguration();
          } else if (selectedAccount === WalletType.BAD_BANK) {
            setSendBadBankModalVisible();
          } else if (
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
        isRemix={isRemix}
        remixingToVault={remixingToVault}
        setRemixingToVault={setRemixingToVault}
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
function UTXOManagement({ route, navigation }: ScreenProps) {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { data, routeName, accountType, vaultId = '' } = route.params || {};
  const [enableSelection, _setEnableSelection] = useState(false);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const { id } = data;
  const wallet = vaultId
    ? useVault({ vaultId }).activeVault
    : useWallets({ walletIds: [id] }).wallets[0];

  const whirlpoolWalletAccountMap: whirlpoolWalletAccountMapInterface = useWhirlpoolWallets({
    wallets: [wallet],
  })?.[wallet.id];

  const isWhirlpoolWallet = vaultId
    ? false
    : Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | Vault>(wallet);
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [depositWallet, setDepositWallet] = useState<any>();
  const [selectedUTXOs, setSelectedUTXOs] = useState([]);
  const [isRemix, setIsRemix] = useState(false);
  const [initiateWhirlpool, setInitiateWhirlpool] = useState(false);
  const [initateWhirlpoolMix, setInitateWhirlpoolMix] = useState(false);
  const [showBatteryWarningModal, setShowBatteryWarningModal] = useState(false);
  const [remixingToVault, setRemixingToVault] = useState(false);
  const { walletPoolMap, walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && selectedWallet ? !!walletSyncing[selectedWallet.id] : false;
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [sendBadBankModalVisible, setSendBadBankModalVisible] = useState(false);
  const [txoErrorModalVisible, setTxoErrorModalVisible] = useState(false);
  const whirlpoolIntroModal = useAppSelector((state) => state.vault.whirlpoolIntro);

  useEffect(
    () => () => {
      dispatch(resetSyncing());
    },
    []
  );

  useEffect(() => {
    setSelectedAccount(accountType || WalletType.DEFAULT);
  }, [accountType]);

  useEffect(() => {
    if (isWhirlpoolWallet) {
      setDepositWallet(wallet);
      const walletAccount: Wallet = getWalletBasedOnAccount(
        wallet,
        whirlpoolWalletAccountMap,
        selectedAccount
      );
      if (!walletSyncing[walletAccount.id]) {
        dispatch(refreshWallets([walletAccount], { hardRefresh: true }));
      }
      if (selectedAccount === WalletType.PRE_MIX) {
        setInitateWhirlpoolMix(true);
      } else {
        setInitateWhirlpoolMix(false);
      }
      setSelectedWallet(walletAccount);
    } else {
      setInitateWhirlpoolMix(false);
      setSelectedWallet(wallet);
      if (!walletSyncing[wallet.id]) {
        dispatch(refreshWallets([wallet], { hardRefresh: true }));
      }
    }
  }, [selectedAccount]);

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
        {/* {isWhirlpoolWallet && (
          <AccountSelectionTab
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            updateSelectedWallet={updateSelectedWallet}
            setEnableSelection={setEnableSelection}
          />
        )} */}
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
          emptyIcon={routeName === 'Vault' ? NoVaultTransactionIcon : NoTransactionIcon}
          selectedAccount={selectedAccount}
          initateWhirlpoolMix={initateWhirlpoolMix}
        />
        <Box marginTop={hp(15)}>
          {utxos?.length ? (
            <Footer
              utxos={utxos}
              setInitiateWhirlpool={setInitiateWhirlpool}
              setInitateWhirlpoolMix={setInitateWhirlpoolMix}
              depositWallet={depositWallet}
              wallet={selectedWallet}
              setEnableSelection={setEnableSelection}
              initiateWhirlpool={initiateWhirlpool}
              initateWhirlpoolMix={initateWhirlpoolMix}
              setIsRemix={setIsRemix}
              isRemix={isRemix}
              enableSelection={enableSelection}
              selectedUTXOs={selectedUTXOs}
              setShowBatteryWarningModal={setShowBatteryWarningModal}
              setSendBadBankModalVisible={() => setSendBadBankModalVisible(true)}
              selectedAccount={selectedAccount}
              setRemixingToVault={setRemixingToVault}
              remixingToVault={remixingToVault}
              vaultId={vaultId}
            />
          ) : null}
        </Box>
      </Box>
      <KeeperModal
        justifyContent="flex-end"
        visible={showBatteryWarningModal}
        close={() => {
          setShowBatteryWarningModal(false);
        }}
        title="Caution during the mix"
        subTitle="The mix may take some time to complete. Please do not close the app or navigate away."
        subTitleColor="#5F6965"
        modalBackground="#F7F2EC"
        buttonBackground={`${colorMode}.gradientStart`}
        buttonTextColor="#FAFAFA"
        closeOnOverlayClick={false}
        Content={() => (
          <Box>
            <Box style={styles.batteryModalContent}>
              <Box style={styles.batteryImage}>
                <BatteryIllustration />
              </Box>
              <Box style={styles.batteryModalTextArea}>
                <Box style={{ flexDirection: 'row' }}>
                  <Text style={styles.batteryModalText}>
                    You will see the progress of your mix in the next step.
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box style={styles.mixSuccesModalFooter}>
              <Box style={{ alignSelf: 'flex-end' }}>
                <Buttons
                  primaryText="Continue"
                  primaryCallback={() => {
                    setShowBatteryWarningModal(false);
                    setEnableSelection(false);
                    navigation.navigate('MixProgress', {
                      selectedUTXOs,
                      depositWallet,
                      selectedWallet,
                      walletPoolMap,
                      isRemix,
                      remixingToVault,
                    });
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      />
      <LearnMoreModal visible={learnModalVisible} closeModal={() => setLearnModalVisible(false)} />
      {/* <SendBadBankSatsModal
        visible={sendBadBankModalVisible}
        closeModal={() => setSendBadBankModalVisible(false)}
        onclick={() => {
          setSendBadBankModalVisible(false);
          setEnableSelection(false);
          navigation.dispatch(
            CommonActions.navigate('Send', {
              sender: whirlpoolWalletAccountMap.badbankWallet,
              selectedUTXOs,
            })
          );
        }}
      /> */}

      {/* <InitiateWhirlpoolModal
        visible={whirlpoolIntroModal}
        closeModal={() => dispatch(setWhirlpoolIntro(false))}
      /> */}
      <ErrorCreateTxoModal
        visible={txoErrorModalVisible}
        closeModal={() => setTxoErrorModalVisible(false)}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  vaultInfoText: {
    marginLeft: wp(3),
    letterSpacing: 1.28,
  },
  mixSuccesModalFooter: {
    marginTop: 20,
    flexDirection: 'row',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
  batteryModalContent: {
    marginTop: 20,
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  batteryImage: {
    alignSelf: 'center',
  },
  batteryModalTextArea: {
    marginTop: 40,
  },
  batteryModalText: {
    marginTop: 10,
    letterSpacing: 1.28,
  },
  contentContainer: {
    flex: 1,
    marginTop: hp(10),
    marginBottom: hp(15),
  },
});

export default UTXOManagement;
