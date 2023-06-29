import React, { useCallback, useEffect, useState } from 'react';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import Text from 'src/components/KeeperText';
import { wp } from 'src/common/data/responsiveness/responsive';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setWhirlpoolIntro } from 'src/store/reducers/vaults';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { AccountSelectionTab } from 'src/components/AccountSelectionTab';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { WalletType } from 'src/core/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Buttons from 'src/components/Buttons';
import NoTransactionIcon from 'src/assets/images/no_transaction_icon.svg';
import BatteryIllustration from 'src/assets/images/CautionIllustration.svg';
import useWallets from 'src/hooks/useWallets';
import { Box, HStack, VStack } from 'native-base';
import useWhirlpoolWallets, {
  whirlpoolWalletAccountMapInterface,
} from 'src/hooks/useWhirlpoolWallets';
import LearnMoreModal from './components/LearnMoreModal';
import InitiateWhirlpoolModal from './components/InitiateWhirlpoolModal';
import ErrorCreateTxoModal from './components/ErrorCreateTXOModal';
import SendBadBankSatsModal from './components/SendBadBankSatsModal';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { resetSyncing } from 'src/store/reducers/wallets';

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
}) {
  const navigation = useNavigation();

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
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      enableSelection={enableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      setIsRemix={setIsRemix}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      wallet={wallet}
      utxos={utxos}
      selectedUTXOs
      setRemixingToVault={setRemixingToVault}
    />
  );
}

function UTXOManagement({ route, navigation }) {
  const dispatch = useAppDispatch();
  const styles = getStyles();
  const {
    data,
    routeName,
    accountType,
  }: { data: Wallet | Vault; routeName: string; accountType: string } = route.params || {};
  const [enableSelection, _setEnableSelection] = useState(false);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const { id } = data;
  const wallet = useWallets({ walletIds: [id] }).wallets[0];

  const whirlpoolWalletAccountMap: whirlpoolWalletAccountMapInterface = useWhirlpoolWallets({
    wallets: [wallet],
  })?.[wallet.id];

  const isWhirlpoolWallet = Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
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

  useEffect(() => {
    return () => {
      dispatch(resetSyncing());
    };
  }, []);

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

  const updateSelectedWallet = (selectedAccount) => {
    const walletAccount: Wallet = getWalletBasedOnAccount(
      wallet,
      whirlpoolWalletAccountMap,
      selectedAccount
    );
    setSelectedWallet(walletAccount);
  };

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
    <ScreenWrapper>
      <ActivityIndicatorView visible={syncing} showLoader={false} />
      <HeaderTitle learnMore learnMorePressed={() => setLearnModalVisible(true)} />
      {isWhirlpoolWallet ? (
        <AccountSelectionTab
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          updateSelectedWallet={updateSelectedWallet}
          setEnableSelection={setEnableSelection}
        />
      ) : (
        <HStack marginBottom={10}>
          <Box paddingX={3}>{routeName === 'Vault' ? <VaultIcon /> : <LinkedWallet />}</Box>
          <VStack>
            <Text color="light.greenText" style={[styles.vaultInfoText, { fontSize: 16 }]}>
              {wallet?.presentationData?.name}
            </Text>
            <Text color="light.grayText" style={[styles.vaultInfoText, { fontSize: 12 }]}>
              {wallet?.presentationData?.description}
            </Text>
          </VStack>
        </HStack>
      )}
      <Box style={{ flex: 1 }}>
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
      </Box>
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
        />
      ) : null}
      <KeeperModal
        justifyContent="flex-end"
        visible={showBatteryWarningModal}
        close={() => {
          setShowBatteryWarningModal(false);
        }}
        title="Caution during the mix"
        subTitle="The mix may take some time to complete. Please do not close the app or navigate away."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
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
                  {/* <Text style={[styles.batteryModalText, styles.bulletPoint]}>{'\u2022'}</Text> */}
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
      <SendBadBankSatsModal
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
      />

      <InitiateWhirlpoolModal
        visible={whirlpoolIntroModal}
        closeModal={() => dispatch(setWhirlpoolIntro(false))}
      />
      <ErrorCreateTxoModal
        visible={txoErrorModalVisible}
        closeModal={() => setTxoErrorModalVisible(false)}
      />
    </ScreenWrapper>
  );
}
const getStyles = () =>
  StyleSheet.create({
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
    bulletPoint: {
      paddingRight: 10,
      fontSize: 16,
      fontWeight: '600',
    },
    batteryModalText: {
      marginTop: 10,
      letterSpacing: 1.28,
    },
  });
export default UTXOManagement;
