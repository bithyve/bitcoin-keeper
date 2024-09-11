import Text from 'src/components/KeeperText';
import { Box, Modal, useColorMode } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BtcInput from 'src/assets/images/btc_input.svg';
import BtcWhiteInput from 'src/assets/images/btc_white.svg';
import { calculateCustomFee } from 'src/store/sagaActions/send_and_receive';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';

function CustomPriorityModal(props) {
  const { colorMode } = useColorMode();
  const {
    visible,
    close,
    title = 'Title',
    subTitle = null,
    buttonText = 'Confirm',
    buttonTextColor = 'white',
    buttonCallback,
    secondaryButtonText,
    secondaryCallback,
    textColor = '#000',
    network,
    recipients,
    sender,
    selectedUTXOs,
  } = props;
  const { bottom } = useSafeAreaInsets();
  const [customPriorityFee, setCustomPriorityFee] = useState('');
  const [customEstBlocks, setCustomEstBlock] = useState();
  const [estimationSign, setEstimationSign] = useState('~');
  const averageTxFees = useAppSelector((state) => state.network.averageTxFees);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const onPressNumber = (text) => {
    let currentFee = customPriorityFee;
    if (text !== 'x') {
      currentFee += text;
      updateFeeAndBlock(currentFee);
    } else if (currentFee && text === 'x') {
      updateFeeAndBlock(currentFee.slice(0, -1));
    }
  };

  const updateFeeAndBlock = (value) => {
    setEstimationSign('~');
    if (averageTxFees && averageTxFees[network]) {
      const { high, medium, low } = averageTxFees[network];
      const customFeeRatePerByte = parseInt(value);
      let customEstimatedBlock = 0;
      if (customFeeRatePerByte >= high.feePerByte) {
        customEstimatedBlock = high.estimatedBlocks;
        if (customFeeRatePerByte > high.feePerByte) setEstimationSign('<');
      } else if (customFeeRatePerByte <= low.feePerByte) {
        customEstimatedBlock = low.estimatedBlocks;
        if (customFeeRatePerByte < low.feePerByte) setEstimationSign('>');
      } else {
        customEstimatedBlock = medium.estimatedBlocks;
      }

      if (parseInt(value) >= 1) setCustomEstBlock(customEstimatedBlock);
      else {
        setCustomPriorityFee('');
        setCustomEstBlock('');
      }
    }

    setCustomPriorityFee(value);
  };

  const onDeletePressed = () => {
    updateFeeAndBlock(customPriorityFee.slice(0, customPriorityFee.length - 1));
  };

  const handleCustomFee = () => {
    dispatch(
      calculateCustomFee({
        wallet: sender,
        recipients,
        feePerByte: customPriorityFee,
        customEstimatedBlocks: customEstBlocks,
        selectedUTXOs,
      })
    );
  };

  const customSendPhaseOneResults = useAppSelector(
    (state) => state.sendAndReceive.customPrioritySendPhaseOne
  );

  useEffect(() => {
    if (customSendPhaseOneResults.failedErrorMessage) {
      showToast(customSendPhaseOneResults.failedErrorMessage);
      buttonCallback(false, '');
    } else if (customSendPhaseOneResults.isSuccessful) {
      buttonCallback(true, customPriorityFee);
    }
  }, [customSendPhaseOneResults]);

  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });
  return (
    <Box flex={1}>
      <Modal
        isOpen={visible}
        onClose={close}
        size="xl"
        _backdrop={{ bg: '#000', opacity: 0.8 }}
        justifyContent="flex-end"
      >
        <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
          <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
            <Modal.Header
              alignSelf="flex-start"
              borderBottomWidth={0}
              backgroundColor="transparent"
              width="100%"
              flexDirection="row"
            >
              <Box w="80%">
                <Text style={styles.title} color={textColor} paddingBottom={2}>
                  {title}
                </Text>
                <Text style={styles.subTitle} color={textColor}>
                  {subTitle}
                </Text>
              </Box>
            </Modal.Header>
            <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.priorityContainer}>
              <Box borderRightWidth={0.5} borderRightColor={`${colorMode}.Border`} px="2">
                <Box>{colorMode === 'light' ? <BtcInput /> : <BtcWhiteInput />}</Box>
              </Box>
              <Text
                color={customPriorityFee ? `${colorMode}.greenText` : `${colorMode}.SlateGreen`}
                fontSize={13}
                bold
              >
                {customPriorityFee || 'Enter Amount'}
              </Text>
            </Box>
            <Box my={windowHeight * 0.03} flexDirection="row" justifyContent="space-between" mx={1}>
              <Text medium color={`${colorMode}.greenText`}>
                {walletTranslation.estimateArrvlTime}
              </Text>
              <Text fontSize={15}>
                {customEstBlocks ? `${estimationSign} ${customEstBlocks * 10} mins` : ''}
              </Text>
            </Box>

            <Box
              alignSelf="flex-end"
              flexDirection="row"
              backgroundColor="transparent"
              alignItems="center"
              my={windowWidth * 0.031}
            >
              <TouchableOpacity onPress={secondaryCallback}>
                <Text
                  mr={windowWidth * 0.07}
                  color={`${colorMode}.greenText`}
                  bold
                  letterSpacing={1.6}
                >
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCustomFee}>
                <Box style={styles.cta} backgroundColor={`${colorMode}.greenButtonBackground`}>
                  <Text
                    fontSize={13}
                    bold
                    letterSpacing={1.6}
                    color={buttonTextColor}
                    mx={windowWidth * 0.04}
                    my={windowHeight * 0.001}
                  >
                    {buttonText}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
            <KeyPadView
              onPressNumber={onPressNumber}
              onDeletePressed={onDeletePressed}
              keyColor={`${colorMode}.primaryText`}
            />
          </Box>
        </Modal.Content>
      </Modal>
    </Box>
  );
}

export default CustomPriorityModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: '4%',
    paddingVertical: '5%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    height: hp(50),
    width: '100%',
    borderRadius: 10,
  },
});
