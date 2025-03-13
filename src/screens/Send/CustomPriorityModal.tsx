import Text from 'src/components/KeeperText';
import { Box, Modal, useColorMode } from 'native-base';
import { Platform, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { hp, wp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BtcInput from 'src/assets/images/btc_black.svg';
import BtcWhiteInput from 'src/assets/images/btc_white.svg';
import { calculateCustomFee } from 'src/store/sagaActions/send_and_receive';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import Buttons from 'src/components/Buttons';

function CustomPriorityModal(props) {
  const { colorMode } = useColorMode();
  const {
    visible,
    close,
    title = 'Title',
    subTitle = null,
    buttonText = 'Confirm',
    buttonCallback,
    secondaryButtonText,
    secondaryCallback,
    network,
    recipients,
    sender,
    selectedUTXOs,
    existingCustomPriorityFee,
    miniscriptSelectedSatisfier,
  } = props;
  const { bottom } = useSafeAreaInsets();
  const [customPriorityFee, setCustomPriorityFee] = useState(
    existingCustomPriorityFee ? existingCustomPriorityFee.toString() : ''
  );
  const [customEstBlocks, setCustomEstBlock] = useState();
  const [estimationSign, setEstimationSign] = useState('≈');
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
    setEstimationSign('≈');
    if (averageTxFees && averageTxFees[network]) {
      const { high, medium, low } = averageTxFees[network];
      const customFeeRatePerByte = parseInt(value);
      let customEstimatedBlock = 0;
      if (customFeeRatePerByte >= high.feePerByte) {
        customEstimatedBlock = high.estimatedBlocks;
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
        miniscriptSelectedSatisfier,
      })
    );
  };

  const customSendPhaseOneResults = useAppSelector(
    (state) => state.sendAndReceive.customPrioritySendPhaseOne
  );

  useEffect(() => {
    if (customSendPhaseOneResults.failedErrorMessage) {
      showToast(customSendPhaseOneResults.failedErrorMessage);
      buttonCallback(false, customPriorityFee);
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
                <Text style={styles.title} paddingBottom={2}>
                  {title}
                </Text>
                <Text style={styles.subTitle}>{subTitle}</Text>
              </Box>
            </Modal.Header>
            <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.priorityContainer}>
              <Box paddingLeft={wp(15)}>
                <Box>
                  {colorMode === 'light' ? (
                    <BtcInput width={13} height={13} />
                  ) : (
                    <BtcWhiteInput width={13} height={13} />
                  )}
                </Box>
              </Box>
              <Box style={styles.separator} backgroundColor={`${colorMode}.dullGreyBorder`} />
              <Text
                color={
                  customPriorityFee ? `${colorMode}.greenText` : `${colorMode}.placeHolderTextColor`
                }
                fontSize={13}
                bold
              >
                {customPriorityFee || 'Enter amount'}
              </Text>
            </Box>
            <Box my={3} flexDirection="row" justifyContent="space-between" mx={1}>
              <Text fontSize={12} color={`${colorMode}.SlateGrey`}>
                {customEstBlocks ? `${estimationSign} ${customEstBlocks * 10} mins` : ''}
              </Text>
            </Box>
            <KeyPadView
              onPressNumber={onPressNumber}
              onDeletePressed={onDeletePressed}
              keyColor={`${colorMode}.primaryText`}
            />
            <Box marginTop={hp(15)}>
              <Buttons
                primaryText={buttonText}
                primaryCallback={handleCustomFee}
                secondaryText={secondaryButtonText}
                secondaryCallback={secondaryCallback}
              />
            </Box>
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
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(50),
    width: '100%',
    borderRadius: 10,
  },
  separator: {
    width: 2,
    height: 20,
    marginRight: wp(12),
    marginLeft: wp(10),
  },
});
