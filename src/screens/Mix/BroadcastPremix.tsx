import { Box } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import PageIndicator from 'src/components/PageIndicator';
import KeeperModal from 'src/components/KeeperModal';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/common/constants/Bitcoin';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { useDispatch } from 'react-redux';
import { addNewWhirlpoolWallets } from 'src/store/sagaActions/wallets';
import { LabelType, WalletType } from 'src/core/wallets/enums';
import { setTx0Complete, setWalletPoolMap } from 'src/store/reducers/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import { createUTXOReference } from 'src/store/sagaActions/utxos';
import { Psbt } from 'bitcoinjs-lib';
import UtxoSummary from './UtxoSummary';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

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
  const dispatch = useDispatch();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { tx0completed } = useAppSelector((state) => state.wallet);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const [premixOutputs, setPremixOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preRequistesLoading, setPreRequistesLoading] = useState(true);
  const getPreferredUnit = () => (satsEnabled ? 'sats' : 'btc');
  const valueByPreferredUnit = (value) => {
    if (!value) return '';
    const valueInPreferredUnit = satsEnabled ? value : SatsToBtc(value);
    return valueInPreferredUnit;
  };
  const { wallets } = useWallets({ walletIds: [wallet.id], whirlpoolStruct: true });
  const depositWallet: Wallet = wallets[0];

  const setPremixOutputsAndBadbank = () => {
    const outputs = [];
    for (let i = 0; i < tx0Preview.n_premix_outputs; i++) {
      outputs.push(tx0Preview.premix_value);
    }
    setPremixOutputs(outputs);
  };

  useEffect(() => {
    if (!wallet?.whirlpoolConfig?.premixWallet) {
      dispatch(addNewWhirlpoolWallets({ depositWallet: wallet }));
    }
    setPremixOutputsAndBadbank();
  }, []);

  useEffect(() => {
    if (
      premixOutputs.length &&
      depositWallet?.whirlpoolConfig?.premixWallet &&
      depositWallet?.whirlpoolConfig?.postmixWallet
    ) {
      setPreRequistesLoading(false);
    }
  }, [premixOutputs, depositWallet]);

  useEffect(() => {
    if (loading) {
      onBroadcastModalCallback();
    }
  }, [loading]);
  useEffect(() => {
    if (relayWalletError || relayWalletUpdate) {
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  useEffect(() => {
    console.log({ tx0completed });
    if (tx0completed) {
      setLoading(false);
      setShowBroadcastModal(true);
    }
    return () => {
      dispatch(setTx0Complete(false));
    };
  }, [tx0completed]);

  const onBroadcastModalCallback = async () => {
    try {
      const network = WalletUtilities.getNetworkByType(depositWallet.networkType);
      const premixWallet = depositWallet.whirlpoolConfig.premixWallet;
      const badbankWallet = depositWallet.whirlpoolConfig.badbankWallet;
      const premixAddresses = [];
      for (let i = 0; i < tx0Preview.n_premix_outputs; i++) {
        premixAddresses.push(
          WalletUtilities.getAddressByIndex(premixWallet.specs.xpub, false, i, network)
        );
      }
      const outputProvider = {
        premix: premixAddresses,
        badbank: badbankWallet.specs.receivingAddress,
      };
      const correspondingTx0Data = tx0Data?.filter((data) => data.pool_id === selectedPool.id);
      const psbt = WhirlpoolClient.getTx0FromPreview(
        tx0Preview,
        correspondingTx0Data,
        utxos,
        outputProvider,
        depositWallet
      ) as Psbt;
      const tx = WhirlpoolClient.signTx0(depositWallet, utxos, psbt);
      const txid = await WhirlpoolClient.broadcastTx0(tx);
      if (txid) {
        const outputs = psbt.txOutputs;
        const voutPremix = outputs.findIndex((o) => o.address === premixAddresses[0]);
        const voutBadBank = outputs.findIndex(
          (o) => o.address === badbankWallet.specs.receivingAddress
        );
        dispatch(
          createUTXOReference({
            labels: [{ name: 'Deposit', type: LabelType.SYSTEM }],
            txId: txid,
            vout: voutPremix,
          })
        );
        dispatch(
          createUTXOReference({
            labels: [
              { name: 'Deposit', type: LabelType.SYSTEM },
              { name: 'Doxxic Change', type: LabelType.SYSTEM },
            ],
            txId: txid,
            vout: voutBadBank,
          })
        );
        dispatch(
          setWalletPoolMap({ walletId: depositWallet.id, pool: selectedPool?.denomination })
        );
        dispatch(setTx0Complete(true));
      } else {
        // error modals
      }
    } catch (e) {
      setLoading(false);

      console.log('onBroadcastModalCallback error', e);
    }
  };

  const navigateToWalletDetails = () => {
    setShowBroadcastModal(false);
    navigation.navigate('UTXOManagement', {
      data: depositWallet,
      routeName: 'Wallet',
      accountType: WalletType.PRE_MIX,
    });
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
      <HeaderTitle
        paddingLeft={10}
        title="Preview Premix"
        subtitle="Review the parameters of your Tx0."
      />
      <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />
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
      {preRequistesLoading ? (
        <Box style={styles.textArea}>
          <Text color="#017963" style={styles.textWidth}>
            Premixes Loading......
          </Text>
        </Box>
      ) : (
        premixOutputs.map((output, index) => (
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
        ))
      )}
      <Box style={styles.footerContainer}>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}>
            <PageIndicator currentPage={2} totalPage={2} />
          </Box>
          <Box style={styles.footerItemContainer}>
            <Buttons
              primaryDisable={preRequistesLoading}
              primaryText="Broadcast Tx0"
              primaryLoading={loading}
              primaryCallback={() => {
                setLoading(true);
              }}
            />
          </Box>
        </Box>
      </Box>
      <KeeperModal
        justifyContent="flex-end"
        visible={showBroadcastModal}
        close={() => navigateToWalletDetails()}
        title="Broadcasting Tx0"
        subTitle="This step prepares your sats to enter a Whirlpool. After the Tx0 is confirmed, it is picked up soon, to be mixed with other UTXOs from the same pool. The sats from Tx0 land in a Premix Wallet. You would be able to spend those sats, but are encouraged to mix the sats before hodling or spending them."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonTextColor="#FAFAFA"
        closeOnOverlayClick={false}
        Content={() => (
          <Box style={styles.modalFooter}>
            <Box style={{ alignSelf: 'flex-end' }}>
              <Buttons
                primaryText="View Premix Account"
                primaryCallback={() => navigateToWalletDetails()}
              />
            </Box>
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  textArea: {
    marginTop: 20,
    marginLeft: 40,
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
    marginTop: 80,
    flexDirection: 'row',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
});
