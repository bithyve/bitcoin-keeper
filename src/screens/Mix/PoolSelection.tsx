import { Box } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/common/constants/Bitcoin';
import PageIndicator from 'src/components/PageIndicator';
import Fonts from 'src/common/Fonts';
import WhirlpoolClient from 'src/core/services/whirlpool/client';
import { Preview } from 'src/nativemodules/interface';
import UtxoSummary from './UtxoSummary';
import LearnMoreModal from './components/LearnMoreModal';
import useBalance from 'src/hooks/useBalance';

const poolContent = (pools, onPoolSelectionCallback, satsEnabled) => (
  <Box style={styles.poolContent}>
    {pools &&
      pools.map((pool) => (
        <TouchableOpacity onPress={() => onPoolSelectionCallback(pool)}>
          <Box style={styles.poolItem}>
            <Text style={styles.poolItemText} color="#073e39">
              {satsEnabled ? pool?.denomination : SatsToBtc(pool?.denomination)}
            </Text>
            <Text style={styles.poolItemUnitText} color="#073e39">
              {satsEnabled ? 'sats' : 'btc'}
            </Text>
          </Box>
        </TouchableOpacity>
      ))}
  </Box>
);

export default function PoolSelection({ route, navigation }) {
  const { scode, premixFee, minerFee, utxos, utxoCount, utxoTotal, wallet } = route.params as any;
  const [showPools, setShowPools] = useState(false);
  const [availablePools, setAvailablePools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [poolSelectionText, setPoolSelectionText] = useState('');
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [premixOutput, setPremixOutput] = useState(0);
  const [minMixAmount, setMinMixAmount] = useState(0);
  const [tx0Data, setTx0Data] = useState(null);
  const [tx0Preview, setTx0Preview] = useState(null);
  const [poolLoading, setPoolLoading] = useState(true);
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const { getSatUnit } = useBalance();

  useEffect(() => {
    setPoolLoading(true);
    initPoolData();
  }, []);

  const initPoolData = async () => {
    try {
      setPoolSelectionText('Fetching Pools...');
      const [pools, tx0Data] = await Promise.all([
        WhirlpoolClient.getPools(),
        WhirlpoolClient.getTx0Data(scode),
      ]);
      const sortedPools = pools?.sort((a, b) => a.denomination - b.denomination);
      setMinMixAmount(sortedPools[0].mustMixBalanceCap + premixFee.averageTxFee);
      const filteredByUtxoTotal = sortedPools?.filter((pool) => pool.denomination <= utxoTotal);
      setAvailablePools(filteredByUtxoTotal);
      setTx0Data(tx0Data);

      if (filteredByUtxoTotal.length > 0) {
        setSelectedPool(filteredByUtxoTotal[0]);
        onPoolSelectionCallback(filteredByUtxoTotal[0], tx0Data);
      }
      setPoolLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const closePoolSelectionModal = async () => {
    setShowPools(false);
  };

  const onPreviewMix = () => {
    navigation.navigate('BroadcastPremix', {
      utxos,
      utxoCount,
      utxoTotal,
      tx0Preview,
      tx0Data,
      selectedPool,
      wallet,
    });
  };

  const onPoolSelectionCallback = async (pool, tx0) => {
    setSelectedPool(pool);

    // For some reason, tx0Data is undefined when called from initPoolData, so we need to get correct txoData
    const tx0ToFilter = tx0 || tx0Data;
    const correspondingTx0Data = tx0ToFilter?.filter((data) => data.poolId === pool.poolId)[0];
    const tx0Preview: Preview = await WhirlpoolClient.getTx0Preview(
      correspondingTx0Data,
      pool,
      premixFee.feePerByte,
      minerFee.feePerByte,
      utxos
    );
    setPremixOutput(tx0Preview?.nPremixOutputs);
    setTx0Preview(tx0Preview);
    setShowPools(false);
  };

  const valueByPreferredUnit = (value) => {
    if (!value) return '';
    const valueInPreferredUnit = satsEnabled ? value : SatsToBtc(value);
    return valueInPreferredUnit;
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
      <HeaderTitle
        paddingLeft={10}
        title="Selecting Pool"
        subtitle="Choose a pool based on total sats shown below"
        learnMore
        learnMorePressed={() => setLearnModalVisible(true)}
      />

      <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />
      {poolLoading ? (
        <Box
          backgroundColor="light.primaryBackground"
          style={[styles.poolSelection, styles.poolErrorContainer]}
        >
          <Text style={styles.poolErrorText}>Pools data loading......</Text>
        </Box>
      ) : availablePools && availablePools.length > 0 && utxoTotal > minMixAmount ? (
        <Box backgroundColor="light.primaryBackground" style={styles.poolSelection}>
          <Text color="#017963">Pool</Text>
          <TouchableOpacity onPress={() => setShowPools(true)}>
            <Box style={{ flexDirection: 'row' }}>
              <Box style={styles.poolTextDirection}>
                <Text style={styles.poolText}>
                  {selectedPool
                    ? valueByPreferredUnit(selectedPool?.denomination)
                    : poolSelectionText}
                </Text>
                <Text style={styles.denominatorText}>{selectedPool ? getSatUnit() : ''}</Text>
              </Box>
              <Box style={styles.arrowIcon}>
                <RightArrowIcon />
              </Box>
            </Box>
          </TouchableOpacity>
        </Box>
      ) : (
        <Box
          backgroundColor="light.primaryBackground"
          style={[styles.poolSelection, styles.poolErrorContainer]}
        >
          <Text style={styles.poolErrorText}>
            Pools not available. Min{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {valueByPreferredUnit(minMixAmount)} {getSatUnit()}
            </Text>{' '}
            required
          </Text>
        </Box>
      )}
      <Box style={styles.textArea}>
        <Text color="#017963">Anonset</Text>
        <Text color="light.secondaryText">
          {selectedPool ? `${selectedPool?.minAnonymitySet} UTXOs` : '--'}
        </Text>
      </Box>

      <Box style={styles.textArea}>
        <Text color="#017963">Pool Fee</Text>
        <Box style={styles.poolTextDirection}>
          <Text color="light.secondaryText">
            {selectedPool ? valueByPreferredUnit(selectedPool?.feeValue) : ''}
          </Text>
          <Text color="light.secondaryText" style={{ paddingLeft: selectedPool ? 5 : 0 }}>
            {selectedPool ? getSatUnit() : '--'}
          </Text>
        </Box>
      </Box>

      <Box style={styles.textArea}>
        <Text color="#017963">Premix Outputs</Text>
        <Text color="light.secondaryText">
          {selectedPool ? premixOutput : ''} {selectedPool ? 'UTXOs' : '--'}
        </Text>
      </Box>

      <Box style={styles.footerContainer}>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}>
            <PageIndicator currentPage={1} totalPage={2} />
          </Box>
          <Box style={styles.footerItemContainer}>
            <Buttons
              primaryText="Preview Pre-Mix"
              primaryDisable={
                !(availablePools && availablePools.length > 0 && utxoTotal > minMixAmount)
              }
              secondaryText='cancel'
              secondaryCallback={() => navigation.goBack()}
              primaryCallback={() => onPreviewMix()}
            />
          </Box>
        </Box>
      </Box>
      <LearnMoreModal visible={learnModalVisible} closeModal={() => setLearnModalVisible(false)} />
      <KeeperModal
        justifyContent="flex-end"
        visible={showPools}
        close={closePoolSelectionModal}
        title="Select Pool"
        subTitle="Determins the pool you want to mix your sats in. Bigger the pool, lesser the Doxxic"
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText=""
        buttonTextColor="#FAFAFA"
        buttonCallback={closePoolSelectionModal}
        closeOnOverlayClick={false}
        Content={() => poolContent(availablePools, onPoolSelectionCallback, satsEnabled)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  poolSelection: {
    marginLeft: 32,
    marginTop: 30,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: '85%',
  },
  textArea: {
    marginTop: 20,
    marginLeft: 40,
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
  poolTextDirection: {
    flexDirection: 'row',
    width: '90%',
  },
  poolText: {
    paddingTop: 4,
    fontSize: 16,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
  poolErrorContainer: {
    borderColor: '#F58E6F',
    borderWidth: 1,
  },
  poolErrorText: {
    color: '#F58E6F',
    padding: 5,
  },
  denominatorText: {
    fontSize: 12,
    paddingTop: 5,
    paddingLeft: 5,
  },
  arrowIcon: {
    width: 10,
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
    marginRight: 20,
  },
  poolContent: {
    marginBottom: 20,
    width: '100%',
  },
  poolItem: {
    fontSize: 18,
    padding: 15,
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    marginBottom: 5,
    flexDirection: 'row',
    width: '100%',
  },
  poolItemText: {
    fontSize: 18,
    textAlign: 'left',
  },
  poolItemUnitText: {
    fontSize: 12,
    width: '100%',
    paddingLeft: 5,
    paddingTop: 2,
    textAlign: 'left',
  },
});