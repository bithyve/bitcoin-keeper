import React, { useCallback, useEffect, useState } from 'react';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import { Box, HStack, VStack } from 'native-base';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { Alert, StyleSheet } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { AccountSelectionTab } from 'src/components/AccountSelectionTab';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { LabelType, WalletType } from 'src/core/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import WhirlpoolClient from 'src/core/services/whirlpool/client';
import KeeperModal from 'src/components/KeeperModal';
import Buttons from 'src/components/Buttons';
import { createUTXOReference } from 'src/store/sagaActions/utxos';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';

const getWalletBasedOnAccount = (depositWallet: Wallet | Vault, accountType: string) => {
  if (accountType === WalletType.BAD_BANK) return depositWallet?.whirlpoolConfig?.badbankWallet;
  else if (accountType === WalletType.PRE_MIX) return depositWallet?.whirlpoolConfig?.premixWallet;
  else if (accountType === WalletType.POST_MIX)
    return depositWallet?.whirlpoolConfig?.postmixWallet;
  else return depositWallet;
};

function Footer({
  depositWallet,
  wallet,
  setEnableSelection,
  enableSelection,
  selectedUTXOs,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  initiateWhirlpool,
  initateWhirlpoolMix,
  setShowMixSuccessModal,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { walletPoolMap } = useAppSelector((state) => state.wallet);

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
    try {
      const postmix = depositWallet?.whirlpoolConfig?.postmixWallet;
      const destination = postmix.specs.receivingAddress;
      const poolDenomination = walletPoolMap[depositWallet.id];
      // To-Do: Instead of taking pool_denomination from the lets create a switch case to get it based on UTXO value
      let isBroadcasted = true;
      for (const utxo of selectedUTXOs) {
        const { txid, PSBT } = await WhirlpoolClient.premixToPostmix(
          utxo,
          destination,
          poolDenomination,
          wallet
        );
        if (txid) {
          dispatch(
            refreshWallets(
              [
                depositWallet?.whirlpoolConfig.premixWallet,
                depositWallet?.whirlpoolConfig.postmixWallet,
              ],
              { hardRefresh: true }
            )
          );
          const outputs = PSBT.txOutputs;
          const voutPostmix = outputs.findIndex((o) => o.address === destination);
          dispatch(
            createUTXOReference({
              labels: [{ name: 'Premix', type: LabelType.SYSTEM }],
              txId: txid,
              vout: voutPostmix,
            })
          );
        } else isBroadcasted = false;
      }
      if (isBroadcasted) setShowMixSuccessModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  return enableSelection ? (
    <FinalizeFooter
      initiateWhirlpool={initiateWhirlpool}
      setEnableSelection={setEnableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      initateWhirlpoolMix={initateWhirlpoolMix}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      secondaryText="Cancel"
      footerCallback={() =>
        initiateWhirlpool
          ? goToWhirlpoolConfiguration()
          : initateWhirlpoolMix
          ? inititateWhirlpoolMixProcess()
          : navigation.dispatch(CommonActions.navigate('Send', { sender: wallet, selectedUTXOs }))
      }
    />
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      enableSelection={enableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      wallet={wallet}
    />
  );
}

function UTXOManagement({ route }) {
  const styles = getStyles();
  const {
    data,
    routeName,
    accountType,
  }: { data: Wallet | Vault; routeName: string; accountType: string } = route.params || {};

  console.log({ data, accountType });
  const [enableSelection, _setEnableSelection] = useState(false);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const isWhirlpoolWallet = Boolean(data?.whirlpoolConfig?.whirlpoolWalletDetails);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | Vault>(data);
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [depositWallet, setDepositWallet] = useState<any>();
  const [utxos, setUtxos] = useState([]);
  const [selectedUTXOs, setSelectedUTXOs] = useState([]);
  const [initiateWhirlpool, setInitiateWhirlpool] = useState(false);
  const [initateWhirlpoolMix, setInitateWhirlpoolMix] = useState(false);
  const [showMixSuccessModal, setShowMixSuccessModal] = useState(false);

  const dispatch = useDispatch();

  const goToPostMixWallet = () => {
    setEnableSelection(false);
    setSelectedAccount(WalletType.POST_MIX);
    setShowMixSuccessModal(false);
  };

  useEffect(() => {
    accountType ? setSelectedAccount(accountType) : setSelectedAccount(WalletType.DEFAULT);
    if (isWhirlpoolWallet) {
      dispatch(
        refreshWallets(
          [
            data,
            data?.whirlpoolConfig.premixWallet,
            data?.whirlpoolConfig.postmixWallet,
            data?.whirlpoolConfig.badbankWallet,
          ],
          { hardRefresh: true }
        )
      );
    }
  }, [accountType]);

  useEffect(() => {
    if (isWhirlpoolWallet) {
      setDepositWallet(data);
      const wallet: Wallet = getWalletBasedOnAccount(data, selectedAccount);
      setSelectedWallet(wallet);
    } else {
      setSelectedWallet(data);
    }
  }, [selectedAccount]);

  useEffect(() => {
    const { confirmedUTXOs, unconfirmedUTXOs } = selectedWallet?.specs || {
      confirmedUTXOs: [],
      unconfirmedUTXOs: [],
    };
    const utxos =
      confirmedUTXOs
        .map((utxo) => {
          utxo.confirmed = true;
          return utxo;
        })
        .concat(
          unconfirmedUTXOs.map((utxo) => {
            utxo.confirmed = false;
            return utxo;
          })
        ) || [];
    setUtxos(utxos);
  }, [selectedWallet]);

  useEffect(() => {
    const selectedUTXOsFiltered = utxos.filter(
      (utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]
    );
    setSelectedUTXOs(selectedUTXOsFiltered);
  }, [utxos, selectedUTXOMap, selectionTotal]);

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
      <HeaderTitle learnMore />
      <Box style={styles.dailySpendingWrapper}>
        {isWhirlpoolWallet ? (
          <AccountSelectionTab
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            setEnableSelection={setEnableSelection}
          />
        ) : (
          <HStack>
            <Box paddingRight={3}>{routeName === 'Vault' ? <VaultIcon /> : <LinkedWallet />}</Box>
            <VStack>
              <Text color="light.greenText" style={[styles.vaultInfoText, { fontSize: 16 }]}>
                {data.presentationData.name}
              </Text>
              <Text color="light.grayText" style={[styles.vaultInfoText, { fontSize: 12 }]}>
                {data.presentationData.description}
              </Text>
            </VStack>
          </HStack>
        )}
      </Box>
      <Box style={{ height: '66%' }}>
        {Object.values(selectedUTXOMap).length ? (
          <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} />
        ) : null}
        <UTXOList
          utxoState={utxos}
          enableSelection={enableSelection}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={data}
          emptyIcon={routeName === 'Vault' ? NoVaultTransactionIcon : NoTransactionIcon}
        />
      </Box>
      <Footer
        setInitiateWhirlpool={setInitiateWhirlpool}
        setInitateWhirlpoolMix={setInitateWhirlpoolMix}
        depositWallet={depositWallet}
        wallet={selectedWallet}
        setEnableSelection={setEnableSelection}
        initiateWhirlpool={initiateWhirlpool}
        initateWhirlpoolMix={initateWhirlpoolMix}
        enableSelection={enableSelection}
        selectedUTXOs={selectedUTXOs}
        setShowMixSuccessModal={setShowMixSuccessModal}
      />
      <KeeperModal
        justifyContent="flex-end"
        visible={showMixSuccessModal}
        close={() => {
          () => goToPostMixWallet();
        }}
        title="Mix broadcasted"
        subTitle="Your mix is now being broadcasted to the Bitcoin network."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonTextColor="#FAFAFA"
        closeOnOverlayClick={false}
        Content={() => (
          <Box style={styles.mixSuccesModalFooter}>
            <Box style={{ alignSelf: 'flex-end' }}>
              <Buttons
                primaryText="View Postmix Account"
                primaryCallback={() => goToPostMixWallet()}
              />
            </Box>
          </Box>
        )}
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
    dailySpendingWrapper: {
      marginLeft: wp(20),
      marginVertical: hp(20),
    },
    mixSuccesModalFooter: {
      marginTop: 80,
      flexDirection: 'row',
      alignContent: 'flex-end',
      justifyContent: 'flex-end',
      width: '100%',
    },
  });
export default UTXOManagement;
