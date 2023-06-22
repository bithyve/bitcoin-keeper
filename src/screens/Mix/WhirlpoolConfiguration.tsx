import { Box, Input, ScrollView } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import RadioButton from 'src/components/RadioButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import PageIndicator from 'src/components/PageIndicator';
import { useAppSelector } from 'src/store/hooks';
import { setWhirlpoolModal } from 'src/store/reducers/wallets';
import { useDispatch } from 'react-redux';
import config from 'src/core/config';
import { TxPriority } from 'src/core/wallets/enums';
import { AverageTxFees } from 'src/core/wallets/interfaces';
import UtxoSummary from './UtxoSummary';
import SCodeLearnMore from './components/SCodeLearnMore';
import LearnMoreModal from '../UTXOManagement/components/LearnMoreModal';

// function WhirlpoolContent() {
//   return (
//     <View>
//       <Text color='light.white' style={{ letterSpacing: 0.6 }}>
//         Coinjoin through Whirlpool involves a number of steps, and in addition a number of wallets.
//         These wallets are all based off the same seed that you used to create the BIP39 software
//         wallet you are using. They simply use different (but well known) derivation paths to derive
//         other addresses. That means that you can always recover all your funds so long as you have
//         the seed.
//       </Text>
//     </View>
//   );
// }

export default function WhirlpoolConfiguration({ route }) {
  const { utxos, wallet } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const whirlpoolModal = useAppSelector((state) => state.wallet.whirlpoolModal) || false;
  const averageTxFees: AverageTxFees = useAppSelector((state) => state.network.averageTxFees);
  const [fees, setFees] = useState([]);
  const [showWhirlpoolModal, setShowWhirlpoolModal] = useState(false);
  const networkType = config.NETWORK_TYPE;

  const [showFee, setShowFee] = useState(false);
  const [scode, setScode] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [utxoCount, setUtxoCount] = useState(0);
  const [utxoTotal, setUtxoTotal] = useState(0);
  const [scodeModalVisible, setScodeModalVisible] = useState(false);
  const [transactionPriority, setTransactionPriority] = useState('high')

  function capitalizeFirstLetter(priority) {
    const firstLetter = priority && priority.charAt(0)
    const firstLetterCap = firstLetter && firstLetter.toUpperCase()
    const remainingLetters = priority && priority.slice(1)
    const capitalizedWord = firstLetterCap + remainingLetters
    return capitalizedWord
  }

  const feesContent = (fees, onFeeSelectionCallback) => (
    <Box style={styles.feeContent}>
      <Box style={styles.feeHeaderItem}>
        <Text style={styles.feeItemHeader}>Priority</Text>
        <Text style={styles.feeItemHeader}>Arrival Time</Text>
        <Text style={styles.feeItemHeader}>Fee</Text>
      </Box>
      {fees &&
        fees.map((fee) => (
          <TouchableOpacity onPress={() => { onFeeSelectionCallback(fee); setTransactionPriority(fee?.priority) }}>
            <Box style={styles.feeItem}>
              <Box style={styles.priorityWrapper}>
                <RadioButton
                  size={15}
                  isChecked={transactionPriority === fee?.priority}
                  borderColor="#E3E3E3"
                  onpress={() => {
                    setTransactionPriority(fee?.priority);
                    // onTransactionPriorityChanged(priority)
                  }}
                />
                <Text style={styles.feeItemText}>&nbsp;&nbsp;{capitalizeFirstLetter(fee?.priority)}</Text>
              </Box>
              <Text style={styles.feeItemText}>{fee?.time}</Text>
              <Text style={styles.feeItemText}>
                {fee?.fee} {fee?.fee > 1 ? 'sats' : 'sat'}/vB
              </Text>
            </Box>
            <Box style={styles.feeItemBorder} />
          </TouchableOpacity>
        ))}
    </Box>
  );

  useEffect(() => {
    if (whirlpoolModal) {
      setShowWhirlpoolModal(true);
    }
    setUtxoInfo();
    getFees(averageTxFees[networkType]);
  }, []);

  const setUtxoInfo = () => {
    setUtxoCount(utxos.length);
    let total = 0;
    utxos.forEach((utxo) => {
      total += utxo.value;
    });
    setUtxoTotal(total);
  };

  const getFees = (fees: AverageTxFees) => {
    if (fees) {
      const feeStructure = [];
      feeStructure.push(
        {
          priority: TxPriority.HIGH,
          time: '10 - 20 minutes',
          fee: fees[TxPriority.HIGH].feePerByte,
          averageTxFee: fees[TxPriority.HIGH].averageTxFee,
        },
        {
          priority: TxPriority.MEDIUM,
          time: '20 - 40 minutes',
          fee: fees[TxPriority.MEDIUM].feePerByte,
          averageTxFee: fees[TxPriority.MEDIUM].averageTxFee,
        },
        {
          priority: TxPriority.LOW,
          time: '20 - 40 minutes',
          fee: fees[TxPriority.LOW].feePerByte,
          averageTxFee: fees[TxPriority.LOW].averageTxFee,
        }
      );

      setFees(feeStructure);
      setSelectedFee(feeStructure[0]);
    }
  };

  const closeFeeSelectionModal = async () => {
    setShowFee(false);
  };

  const onProceed = () => {
    Keyboard.dismiss()
    setTimeout(() => {
      navigation.navigate('PoolSelection', {
        scode,
        premixFee: selectedFee,
        minerFee: fees[0],
        utxos,
        utxoCount,
        utxoTotal,
        wallet,
      });
    }, 0)
  };

  const onFeeSelectionCallback = (fee) => {
    setSelectedFee(fee);
    console.log(fee);
    setShowFee(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      enabled
      keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
      style={styles.keyBoardAvoidViewWrapper}
    >
      <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
        <HeaderTitle paddingLeft={25} title="Configure Whirlpool" subtitle="Prepare to start a mix" learnMore learnMorePressed={() => setScodeModalVisible(true)} />
        <ScrollView style={styles.scrollViewWrapper} keyboardShouldPersistTaps='always'>
          <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />

          <Box style={styles.scode}>
            <Input
              placeholderTextColor="grey"
              backgroundColor="light.primaryBackground"
              placeholder="Enter SCODE"
              borderRadius={10}
              borderWidth={0}
              height="12"
              fontSize={13}
              width="95%"
              value={scode}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setScode(text);
              }}
            />
          </Box>
          <Box style={styles.feeSelection}>
            <Box style={styles.feeDetail}>
              <Box style={styles.column}>
                <Text style={styles.feeHeader}>Priority</Text>
                <Text style={styles.feeValue}>{capitalizeFirstLetter(selectedFee?.priority)}</Text>
              </Box>
              <Box style={styles.column}>
                <Text style={styles.feeHeader}>Arrival Time</Text>
                <Text style={styles.feeValue}>{selectedFee?.time}</Text>
              </Box>
              <Box style={styles.column}>
                <Text style={styles.feeHeader}>Fee</Text>
                <Text style={styles.feeValue}>
                  {selectedFee?.fee} {selectedFee?.fee > 1 ? 'sats' : 'sat'}/vB
                </Text>
              </Box>
            </Box>
          </Box>
          <Box backgroundColor="light.primaryBackground" style={styles.changePriority}>
            <TouchableOpacity onPress={() => setShowFee(true)}>
              <Box style={styles.changePriorityDirection}>
                <Text style={styles.changePriorityText}>Change Priority</Text>
                <RightArrowIcon />
              </Box>
            </TouchableOpacity>
          </Box>
        </ScrollView>

        <Box style={styles.footerContainer}>
          <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}>
              <PageIndicator currentPage={0} totalPage={2} />
            </Box>
            <Box style={styles.footerItemContainer}>
              <Buttons primaryText="Proceed" primaryCallback={() => onProceed()} />
            </Box>
          </Box>
        </Box>
        <KeeperModal
          justifyContent="flex-end"
          visible={showFee}
          close={closeFeeSelectionModal}
          title="Change Priority"
          subTitle="Select a priority for your transaction"
          subTitleColor="#5F6965"
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText=""
          buttonTextColor="#FAFAFA"
          buttonCallback={closeFeeSelectionModal}
          closeOnOverlayClick={false}
          Content={() => feesContent(fees, onFeeSelectionCallback)}
        />

        {/* <KeeperModal
        visible={showWhirlpoolModal}
        close={() => {
          setShowWhirlpoolModal(false);
          dispatch(setWhirlpoolModal(false));
        }}
        title="Whirlpool"
        subTitle="Mix transactions to improve privacy and obfuscate your transaction history"
        modalBackground={['light.gradientStart', 'light.gradientEnd']}
        textColor="light.white"
        Content={WhirlpoolContent}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      /> */}
        <LearnMoreModal
          visible={showWhirlpoolModal}
          closeModal={() => {
            setShowWhirlpoolModal(false);
            dispatch(setWhirlpoolModal(false));
          }} />
        <SCodeLearnMore visible={scodeModalVisible} closeModal={() => setScodeModalVisible(false)} />
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyBoardAvoidViewWrapper: {
    flex: 1
  },
  scrollViewWrapper: {
    height: '60%',
  },
  scode: {
    marginTop: 20,
    marginLeft: 30,
  },
  feeSelection: {
    marginLeft: 30,
    marginTop: 40,
    padding: 10,
    borderRadius: 10,
    width: '87%',
  },
  feeDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
    marginLeft: 0,
    marginTop: 10,
  },
  feeHeader: {
    fontSize: 12,
    color: '#656565',
  },
  feeValue: {
    marginTop: 5,
    fontSize: 12,
    color: '#656565',
  },
  changePriority: {
    marginLeft: 30,
    borderRadius: 10,
    width: '87%',
  },
  changePriorityDirection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  changePriorityText: {
    color: '#00836A',
    fontSize: 15,
    fontStyle: 'italic',
    padding: 10,
  },
  arrowIcon: {
    marginBottom: 5,
    alignItems: 'flex-start',
    marginRight: 20,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    // paddingHorizontal: 5,
  },
  footerItemContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: windowHeight > 800 ? hp(10) : 0,
    // paddingBottom: 15,
    justifyContent: 'flex-end',
    // marginHorizontal: 16,
  },

  feeContent: {
    width: wp(280),
  },
  feeHeaderItem: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  feeItemHeader: {
    color: '#656565',
    fontSize: 13,
    textAlign: 'left',
    width: 120,
  },

  feeItem: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 2,
    marginTop: 2,
  },
  feeItemBorder: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#005545',
    opacity: 0.5,
  },
  feeItemText: {
    color: '#656565',
    width: 100,
    fontSize: 13,
    textAlign: 'left',
  },
  priorityWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
