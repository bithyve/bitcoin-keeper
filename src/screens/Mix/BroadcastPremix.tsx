import { Box, useColorMode } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import PageIndicator from 'src/components/PageIndicator';
import KeeperModal from 'src/components/KeeperModal';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/constants/Bitcoin';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { useDispatch } from 'react-redux';
import { addNewWhirlpoolWallets, incrementAddressIndex } from 'src/store/sagaActions/wallets';
import { LabelRefType, WalletType } from 'src/services/wallets/enums';
import { setWalletPoolMap } from 'src/store/reducers/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import useWallets from 'src/hooks/useWallets';
import { BIP329Label, InputUTXOs } from 'src/services/wallets/interfaces';
import { PoolData, Preview, TX0Data } from 'src/nativemodules/interface';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WhirlpoolClient from 'src/services/whirlpool/client';
import useBalance from 'src/hooks/useBalance';
import { setWhirlpoolSwiperModal } from 'src/store/reducers/settings';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import BroadcastTX0Illustration from 'src/assets/images/BroadcastTX0Illustration.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { captureError } from 'src/services/sentry';
import useWhirlpoolWallets from 'src/hooks/useWhirlpoolWallets';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { bulkUpdateUTXOLabels } from 'src/store/sagaActions/utxos';
import { generateAbbreviatedOutputDescriptors } from 'src/utils/service-utilities/utils';
import { CommonActions } from '@react-navigation/native';
import SwiperModal from './components/SwiperModal';
import UtxoSummary from './UtxoSummary';

export default function BroadcastPremix({ route, navigation }) {
  const {
    utxos,
    utxoCount,
    utxoTotal,
    tx0Preview,
    tx0Data,
    selectedPool,
    wallet,
  }: {
    utxos: InputUTXOs[];
    utxoCount: number;
    utxoTotal: number;
    tx0Preview: Preview;
    tx0Data: TX0Data[];
    selectedPool: PoolData;
    wallet: Wallet;
  } = route.params as any;
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const [premixOutputs, setPremixOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preRequistesLoading, setPreRequistesLoading] = useState(true);
  const { getSatUnit } = useBalance();
  const { labels } = useLabelsNew({ utxos, wallet });

  const { showToast } = useToastMessage();
  const valueByPreferredUnit = (value) => {
    if (!value) return '';
    const valueInPreferredUnit = satsEnabled ? value : SatsToBtc(value);
    return valueInPreferredUnit;
  };
  const { wallets } = useWallets({ walletIds: [wallet.id] });
  const depositWallet: Wallet = wallets[0];
  const whirlpoolWalletAccountMap = useWhirlpoolWallets({
    wallets: [depositWallet],
  })?.[depositWallet.id];

  const setPremixOutputsAndBadbank = () => {
    const outputs = [];
    for (let i = 0; i < tx0Preview.nPremixOutputs; i += 1) {
      outputs.push(tx0Preview.premixValue);
    }
    setPremixOutputs(outputs);
  };

  useEffect(() => {
    if (!whirlpoolWalletAccountMap) {
      dispatch(addNewWhirlpoolWallets({ depositWallet: wallet }));
    }
    setPremixOutputsAndBadbank();
  }, []);

  useEffect(() => {
    if (premixOutputs.length && whirlpoolWalletAccountMap) {
      setPreRequistesLoading(false);
    }
  }, [premixOutputs, whirlpoolWalletAccountMap]);

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

  const onBroadcastModalCallback = async () => {
    try {
      const network = WalletUtilities.getNetworkByType(depositWallet.networkType);
      const { premixWallet, badbankWallet } = whirlpoolWalletAccountMap;
      const premixAddresses = [];
      for (
        let i = premixWallet.specs.nextFreeAddressIndex;
        i < premixWallet.specs.nextFreeAddressIndex + tx0Preview.nPremixOutputs;
        i += 1
      ) {
        premixAddresses.push(
          WalletUtilities.getAddressByIndex(premixWallet.specs.xpub, false, i, network)
        );
      }
      const outputProvider = {
        premix: premixAddresses,
        badbank: badbankWallet.specs.receivingAddress,
      };

      let correspondingTx0Data: TX0Data;
      for (const data of tx0Data) {
        if (data.poolId === selectedPool.poolId) {
          correspondingTx0Data = data;
          break;
        }
      }

      const { serializedPSBT } = await WhirlpoolClient.getTx0FromPreview(
        tx0Preview,
        correspondingTx0Data,
        utxos,
        outputProvider,
        network
      );
      if (serializedPSBT) {
        const { txHex, PSBT } = WhirlpoolClient.signTx0(serializedPSBT, depositWallet, utxos);
        const txid = await WhirlpoolClient.broadcastTx0(txHex, selectedPool.poolId);
        if (txid) {
          for (const wallet of [premixWallet, badbankWallet]) {
            let incrementBy = 1;
            if (wallet.type === WalletType.PRE_MIX) incrementBy = premixAddresses.length;
            dispatch(
              incrementAddressIndex(wallet, {
                external: { incrementBy },
              })
            );
          }
          showToast(
            'Your Tx0 was broadcasted successfully, you should find the new UTXOs in the Premix account',
            <TickIcon />
          );
          dispatch(setWalletPoolMap({ walletId: depositWallet.id, pool: selectedPool }));
          const outputs = PSBT.txOutputs;
          const premixTags: BIP329Label[] = [];
          const badbankTags: BIP329Label[] = [];
          const userLabels = [];
          Object.keys(labels).forEach((key) => {
            const tags = labels[key].filter((t) => !t.isSystem);
            userLabels.push(...tags);
          });
          const origin = generateAbbreviatedOutputDescriptors(wallet);
          outputs.forEach((_, i) => {
            userLabels.forEach((label) => {
              premixTags.push({
                id: `${txid}:${i}${label.name}`,
                ref: `${txid}:${i}`,
                type: LabelRefType.OUTPUT,
                label: label.name,
                isSystem: label.isSystem,
                origin,
              });
            });
          });

          const voutBadBank = outputs.findIndex(
            (o) => o.address === badbankWallet.specs.receivingAddress
          );
          userLabels.forEach((label) => {
            badbankTags.push({
              id: `${txid}:${voutBadBank}${label.name}`,
              ref: `${txid}:${voutBadBank}`,
              type: LabelRefType.OUTPUT,
              label: label.name,
              isSystem: label.isSystem,
              origin,
            });
          });
          dispatch(bulkUpdateUTXOLabels({ addedTags: premixTags.concat(badbankTags) }));
          setShowBroadcastModal(true);
          setLoading(false);
        } else {
          setLoading(false);
          showToast('Error in broadcasting Tx0 ', <ToastErrorIcon />);
        }
      } else {
        setLoading(false);
        showToast('Error in creating PSBT from Preview ', <ToastErrorIcon />);
      }
    } catch (error) {
      const problem = error?.message || '';
      let solution = '';
      switch (problem) {
        case 'txn-mempool-conflict': // the input has already been consumed in a tx0(unconfirmed)
        case 'bad-txns-inputs-missingorspent': // the input has already been consumed in a tx0(confirmed)
        case 'Duplicate input detected.': // same input selected twice(for some reason - UI glitch)
          solution = 'Please refresh the Deposit account & try again!';
          break;

        case 'address-reuse': // reusing premix addresses for vouts
          solution = 'Please refresh the Premix account & try again!';
          break;

        default:
      }

      showToast(`Error in broadcasting Tx0: ${problem} ${solution}`, <ToastErrorIcon />);
      setLoading(false);
      captureError(error);
    }
  };

  const navigateToWalletDetails = () => {
    setShowBroadcastModal(false);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UTXOManagement',
        params: {
          data: depositWallet,
          routeName: 'Wallet',
          accountType: WalletType.PRE_MIX,
        },
        merge: true,
      })
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`} barStyle="dark-content">
      <KeeperHeader
        title="Preview Premix"
        subtitle="Review the parameters of your Tx0."
        learnMore
        learnTextColor={`${colorMode}.buttonText`}
        learnMorePressed={() => {
          dispatch(setWhirlpoolSwiperModal(true));
        }}
      />
      <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />
      <ScrollView style={styles.scrollViewWrapper}>
        <Box style={styles.textArea}>
          <Text color="#017963" style={styles.textWidth}>
            Fee
          </Text>
          <Box style={styles.textDirection}>
            <Text color={`${colorMode}.secondaryText`}>
              {valueByPreferredUnit(tx0Preview.minerFee)}
            </Text>
            <Text color={`${colorMode}.secondaryText`} style={{ paddingLeft: 5 }}>
              {getSatUnit()}
            </Text>
          </Box>
        </Box>
        <Box style={styles.textArea}>
          <Text color="#017963" style={styles.textWidth}>
            Whirlpool Fee
          </Text>
          <Box style={styles.textDirection}>
            <Text color={`${colorMode}.secondaryText`}>
              {valueByPreferredUnit(
                tx0Preview.coordinatorFee?.coordinator
                  ? tx0Preview.coordinatorFee.coordinator[0]
                  : 0
              )}
            </Text>
            <Text color={`${colorMode}.secondaryText`} style={{ paddingLeft: 5 }}>
              {getSatUnit()}
            </Text>
          </Box>
        </Box>
        <Box style={styles.textArea}>
          <Text color="#017963" style={styles.textWidth}>
            Badbank Change
          </Text>
          <Box style={styles.textDirection}>
            <Text color={`${colorMode}.secondaryText`}>
              {valueByPreferredUnit(tx0Preview.change)}
            </Text>
            <Text color={`${colorMode}.secondaryText`} style={{ paddingLeft: 5 }}>
              {getSatUnit()}
            </Text>
          </Box>
        </Box>
        {preRequistesLoading ? (
          <Box style={styles.textArea}>
            <Text color="#017963" style={styles.textWidth}>
              Premixes Loading...
            </Text>
          </Box>
        ) : (
          <>
            <Box style={[styles.textArea, { marginTop: 30 }]}>
              <Text color="#017963" style={styles.textWidth}>
                Premix value
              </Text>
              <Box style={styles.textDirection}>
                <Text color={`${colorMode}.secondaryText`}>
                  {valueByPreferredUnit(premixOutputs[0])}
                </Text>
                <Text color={`${colorMode}.secondaryText`} style={{ paddingLeft: 5 }}>
                  {getSatUnit()}
                </Text>
              </Box>
            </Box>
            <Box style={styles.textArea} testID="Premixes_container">
              <Text color="#017963" style={styles.textWidth}>
                No. of Premixes
              </Text>
              <Box style={styles.textDirection}>
                <Text color={`${colorMode}.secondaryText`}>{premixOutputs.length}</Text>
              </Box>
            </Box>
          </>
        )}
      </ScrollView>
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
        subTitle="This step prepares your sats to enter a Whirlpool. After the Tx0 is confirmed, it is picked up soon, to be mixed with other UTXOs from the same pool."
        subTitleColor="#5F6965"
        modalBackground="#F7F2EC"
        buttonBackground={`${colorMode}.primaryGreen`}
        buttonTextColor="#FAFAFA"
        closeOnOverlayClick={false}
        Content={() => (
          <Box>
            <Box style={styles.BroadcastIllustrationWrapper}>
              <BroadcastTX0Illustration />
            </Box>
            <Text color={`${colorMode}.greenText`} style={styles.BroadcastContentText}>
              The sats from Tx0 land in a Premix Wallet. You would be able to spend those sats, but
              are encouraged to mix the sats before hodling or spending them.
            </Text>
            <Box style={styles.modalFooter}>
              <Box style={{ alignSelf: 'flex-end' }}>
                <Buttons
                  primaryText="View Premix Account"
                  primaryCallback={() => navigateToWalletDetails()}
                />
              </Box>
            </Box>
          </Box>
        )}
      />
      <SwiperModal enable={!preRequistesLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  textArea: {
    marginTop: 15,
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
  BroadcastIllustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  BroadcastContentText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
    marginVertical: 10,
  },
  modalFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
  scrollViewWrapper: {
    height: '65%',
  },
});
