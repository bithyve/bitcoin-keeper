import Text from 'src/components/KeeperText';
import { Box, Modal, Input } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

import Close from 'src/assets/icons/modal_close.svg';
import LinearGradient from 'react-native-linear-gradient';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeleteIcon from 'src/assets/images/delete.svg';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';
import { useAppSelector } from 'src/store/hooks';

function CustomPriorityModal(props) {
  const {
    visible,
    close,
    title = 'Title',
    subTitle = null,
    info = null,
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = 'Button text',
    buttonTextColor = 'white',
    buttonCallback,
    textColor = '#000',
    network,
  } = props;
  const { bottom } = useSafeAreaInsets();
  const [customPriorityFee, setCustomPriorityFee] = useState('');
  const [customEstBlocks, setCustomEstBlock] = useState('');
  const averageTxFees = useAppSelector((state) => state.network.averageTxFees);

  const onPressNumber = (text) => {
    let currentFee = customPriorityFee;
    if (text != 'x') {
      currentFee += text;
      updateFeeAndBlock(currentFee);
    } else if (currentFee && text == 'x') {
      updateFeeAndBlock(currentFee.slice(0, -1));
    }
  };

  const updateFeeAndBlock = (value) => {
    if (averageTxFees && averageTxFees[network].feeRates) {
      const { feeRates } = averageTxFees[network];
      const customFeeRatePerByte = parseInt(value);
      let customEstimatedBlock = 0;
      // handling extremes
      if (customFeeRatePerByte > feeRates['2']) {
        customEstimatedBlock = 1;
      } else if (customFeeRatePerByte < feeRates['144']) {
        customEstimatedBlock = 200;
      } else {
        const closestFeeRatePerByte = Object.values(feeRates).reduce((prev, curr) =>
          Math.abs(curr - customFeeRatePerByte) < Math.abs(prev - customFeeRatePerByte)
            ? curr
            : prev
        );

        const etimatedBlock = Object.keys(feeRates).find(
          (key) => feeRates[key] === closestFeeRatePerByte
        );
        customEstimatedBlock = parseInt(etimatedBlock);
      }

      if (parseInt(value) >= 1) setCustomEstBlock(`${customEstimatedBlock}`);
      else setCustomPriorityFee('');
    }

    setCustomPriorityFee(value);
  };

  const onDeletePressed = () => {
    updateFeeAndBlock(customPriorityFee.slice(0, customPriorityFee.length - 1));
  };

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
          <Box style={styles.container}>
            <TouchableOpacity style={styles.close} onPress={close}>
              <Close />
            </TouchableOpacity>
            <Modal.Header
              alignSelf="flex-start"
              borderBottomWidth={0}
              backgroundColor="transparent"
              width="90%"
            >
              <Text style={styles.title} fontFamily="body" color={textColor} paddingBottom={2}>
                {title}
              </Text>
              <Text style={styles.subTitle} fontFamily="body" fontWeight="100" color={textColor}>
                {subTitle}
              </Text>
            </Modal.Header>
            <Box alignItems="center">
              <Input
                mx="3"
                placeholder="Enter Amount"
                w="100%"
                variant="unstyled"
                value={customPriorityFee}
              />
            </Box>
            <Box my={windowHeight * 0.02}>
              <Text fontFamily="body" color="#073B36" mx={windowWidth * 0.038}>
                {info}
              </Text>
            </Box>

            <Box
              alignSelf="flex-end"
              flexDirection="row"
              bg="transparent"
              alignItems="center"
              my={windowWidth * 0.031}
            >
              <TouchableOpacity
                onPress={() => {
                  setCustomPriorityFee('');
                }}
              >
                <Text
                  mr={windowWidth * 0.07}
                  color="#073E39"
                  fontFamily="body"
                  bold
                  letterSpacing={1.6}
                >
                  Start Over
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  buttonCallback(customPriorityFee, customEstBlocks);
                }}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={buttonBackground}
                  style={styles.cta}
                >
                  <Text
                    fontSize={13}
                    fontFamily="body"
                    bold
                    letterSpacing={1.6}
                    color={buttonTextColor}
                    mx={windowWidth * 0.04}
                    my={windowHeight * 0.001}
                  >
                    {buttonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
            <KeyPadView
              onPressNumber={onPressNumber}
              onDeletePressed={onDeletePressed}
              keyColor="light.primaryText"
              ClearIcon={<DeleteIcon />}
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
    backgroundColor: '#F7F2EC',
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
  close: {
    alignSelf: 'flex-end',
  },
});
