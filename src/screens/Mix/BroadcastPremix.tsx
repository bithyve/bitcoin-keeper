import { Box } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import UtxoSummary from './UtxoSummary';
import PageIndicator from 'src/components/PageIndicator';
import KeeperModal from 'src/components/KeeperModal';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/common/constants/Bitcoin';
import WalletOperations from 'src/core/wallets/operations';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { LocalizationContext } from 'src/common/content/LocContext';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import { useDispatch } from 'react-redux';
import { addNewWhirlpoolWallets, addWhirlpoolWalletsLocal } from 'src/store/sagaActions/wallets';
import { WalletType } from 'src/core/wallets/enums';
import { setTx0Complete, setWalletDetailsUI } from 'src/store/reducers/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';

const broadcastModalContent = (loading, onBroadcastModalCallback) => {
  return (
    <Box>
      <Box>
        <Text color="light.secondaryText" style={styles.premixInstructionText}>
          <Text style={{ fontWeight: 'bold' }}>Premix</Text> This wallet contains the UTXOs from
          your premix transaction (also called the Tx0). Your premix transaction splits your UTXOs
          into equal amounts ready for mixing.
        </Text>
        <Text color="light.secondaryText" style={styles.premixInstructionText}>
          <Text style={{ fontWeight: 'bold' }}>Postmix</Text> This wallet contains the UTXOs from
          your mixes. Whirlpool will select UTXOs from both the Premix and the Postmix wallets to
          include in coinjoin transactions. Funds in this wallet can be considered mixed and are
          safe to spend anonymously, especially after a number of mixing rounds.
        </Text>
        <Text color="light.secondaryText" style={styles.premixInstructionText}>
          <Text style={{ fontWeight: 'bold' }}>Badbank</Text> This wallet contains the change from
          your premix (Tx0) transaction - whatever is left over from splitting your input UTXOs into
          equal amounts. Consider mixing any UTXOs here if they are large enough, but do not combine
          them with mixed funds.
        </Text>
      </Box>
      <Box style={styles.modalFooter}>
        <Buttons
          primaryText="Proceed"
          primaryLoading={loading}
          primaryCallback={() => onBroadcastModalCallback()}
        />
      </Box>
    </Box>
  );
};

function SendSuccessfulContent() {
  return (
    <View>
      <Box alignSelf="center">
        <SuccessIcon />
      </Box>
      <Text color="light.greenText" fontSize={13} padding={2}>
        You can view the confirmation status of the transaction on any block explorer or when the
        vault transaction list is refreshed
      </Text>
    </View>
  );
}

export default function BroadcastPremix({ route, navigation }) {
  const {
    utxos,
    utxoCount,
    utxoTotal,
    tx0Preview,
    tx0Data,
    selectedPool,
    wallet,
    WhirlpoolClient,
  } = route.params;
  const { translations } = useContext(LocalizationContext);
  const walletTransactions = translations.wallet;
  const dispatch = useDispatch();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { whirlpoolWallets, tx0completed } = useAppSelector((state) => state.wallet);
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const [premixOutputs, setPremixOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    setPremixOutputsAndBadbank();
    setLoading(false);
  }, []);

  const setPremixOutputsAndBadbank = () => {
    const outputs = [];
    for (let i = 0; i < tx0Preview.n_premix_outputs; i++) {
      outputs.push(tx0Preview.premix_value);
    }
    setPremixOutputs(outputs);
  };

  const onBroadcastPremix = () => {
    setShowBroadcastModal(true);
  };

  const closeBroadcastModal = async () => {
    setShowBroadcastModal(false);
  };

  useEffect(() => {
    if (relayWalletError) {
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate && tx0completed) {
      dispatch(resetRealyWalletState());
      setLoading(false);
      setShowBroadcastModal(false);
      setSuccessModal(true);
      dispatch(setWalletDetailsUI({ walletId: wallet.id, walletType: WalletType.PRE_MIX }));
    }
    return () => {
      dispatch(setTx0Complete(false));
    };
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage, tx0completed]);

  const onBroadcastModalCallback = async () => {
    try {
      setLoading(true);
      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
        [wallet],
        network
      );
      const syncedWallet = synchedWallets[0] as Wallet;

      const premixWallet = whirlpoolWallets.filter((w) => w.type === WalletType.PRE_MIX)[0];
      const badBank = whirlpoolWallets.filter((w) => w.type === WalletType.BAD_BANK)[0];

      const premixAddresses = [];
      for (let i = 0; i < tx0Preview.n_premix_outputs; i++) {
        premixAddresses.push(
          WalletUtilities.getAddressByIndex(premixWallet.specs.xpub, false, i, network)
        );
      }

      const outputProvider = {
        premix: premixAddresses,
        badbank: badBank.specs.receivingAddress,
      };

      const correspondingTx0Data = tx0Data?.filter((data) => data.pool_id === selectedPool.id);

      const psbt = WhirlpoolClient.getTx0FromPreview(
        tx0Preview,
        correspondingTx0Data,
        utxos,
        outputProvider,
        syncedWallet
      );

      const tx = WhirlpoolClient.signTx0(syncedWallet, utxos, psbt);
      const txid = await WhirlpoolClient.broadcastTx0(tx);
      console.log({ txid });
      if (true) {
        dispatch(addNewWhirlpoolWallets({ depositWallet: wallet }));
      } else {
        // error modals
      }
    } catch (e) {
      console.log('onBroadcastModalCallback error', e);
    }
  };

  const valueByPreferredUnit = (value) => {
    if (!value) return '';
    const valueInPreferredUnit = satsEnabled ? value : SatsToBtc(value);
    return valueInPreferredUnit;
  };

  const getPreferredUnit = () => {
    return satsEnabled ? 'sats' : 'btc';
  };
  const navigateToWalletDetails = () => {
    setSuccessModal(false);
    navigation.navigate('WalletDetails', {
      selectedTab: 'Transactions',
    });
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
      <HeaderTitle
        paddingLeft={25}
        title="Broadcast Premix Transaction"
        subtitle="Your premix transaction is ready to be broadcast. Please review the details below and click the button to broadcast your transaction."
      />
      <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />
      <Box style={styles.textArea}>
        <Text color="#017963" style={styles.textWidth}>
          Whirlpool Fee
        </Text>
        <Box style={styles.textDirection}>
          <Text color="light.secondaryText">
            {valueByPreferredUnit(tx0Preview.coordinator_fee)}
          </Text>
          <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
            {getPreferredUnit()}
          </Text>
        </Box>
      </Box>
      <Box style={styles.textArea}>
        <Text color="#017963" style={styles.textWidth}>
          Badbank Change
        </Text>
        <Box style={styles.textDirection}>
          <Text color="light.secondaryText">{valueByPreferredUnit(tx0Preview.change)}</Text>
          <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
            {getPreferredUnit()}
          </Text>
        </Box>
      </Box>
      {premixOutputs &&
        premixOutputs.map((output, index) => {
          return (
            <Box style={styles.textArea}>
              <Text color="#017963" style={styles.textWidth}>
                Premix #{index + 1}
              </Text>
              <Box style={styles.textDirection}>
                <Text color="light.secondaryText">{valueByPreferredUnit(output)}</Text>
                <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
                  {getPreferredUnit()}
                </Text>
              </Box>
            </Box>
          );
        })}
      <Box style={styles.textArea}>
        <Text color="#017963" style={styles.textWidth}>
          Fee
        </Text>
        <Box style={styles.textDirection}>
          <Text color="light.secondaryText">{valueByPreferredUnit(tx0Preview.miner_fee)}</Text>
          <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
            {getPreferredUnit()}
          </Text>
        </Box>
      </Box>
      <Box style={styles.footerContainer}>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}>
            <PageIndicator currentPage={2} totalPage={2} />
          </Box>
          <Box style={styles.footerItemContainer}>
            <Buttons primaryText="Broadcast Premix" primaryCallback={() => onBroadcastPremix()} />
          </Box>
        </Box>
      </Box>
      <KeeperModal
        justifyContent="flex-end"
        visible={showBroadcastModal}
        close={closeBroadcastModal}
        title="Broadcast Premix"
        subTitle="Initiating your first coinjoin will add three new wallets to your existing wallet: Premix, Postmix and Badbank."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText=""
        buttonTextColor="#FAFAFA"
        buttonCallback={closeBroadcastModal}
        closeOnOverlayClick={false}
        Content={() => broadcastModalContent(loading, onBroadcastModalCallback)}
      />
      <KeeperModal
        visible={successModal}
        close={() => navigateToWalletDetails()}
        title="Transaction Broadcasted"
        subTitle="The transaction has been successfully broadcasted"
        buttonText={walletTransactions.ViewDetails}
        buttonCallback={() => navigateToWalletDetails()}
        textColor="light.greenText"
        buttonTextColor="light.white"
        Content={SendSuccessfulContent}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  textArea: {
    marginTop: 20,
    marginLeft: 50,
    flexDirection: 'row',
  },
  textWidth: {
    width: '45%',
  },
  textDirection: {
    flexDirection: 'row',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(375),
    paddingHorizontal: 5,
  },
  footerItemContainer: {
    flexDirection: 'row',
    marginTop: windowHeight > 800 ? 5 : 5,
    marginBottom: windowHeight > 800 ? hp(10) : 0,
    paddingBottom: 15,
    justifyContent: 'flex-end',
    marginHorizontal: 16,
  },
  premixInstructionText: {
    fontSize: 12,
    paddingTop: 10,
  },
  modalFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
});
