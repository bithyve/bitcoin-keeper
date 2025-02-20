import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, StyleSheet } from 'react-native';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import { CHANNEL_MESSAGE, EMIT_MODES, JOIN_CHANNEL } from 'src/services/channel/constants';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import { createCipherGcm, createDecipherGcm } from 'src/utils/service-utilities/utils';
import QRScanner from 'src/components/QRScanner';
import BackgroundTimer from 'react-native-background-timer';

function ScanAndInstruct({ onBarCodeRead }) {
  const { colorMode } = useColorMode();
  const [channelCreated, setChannelCreated] = useState(false);

  const callback = (data) => {
    onBarCodeRead(data);
    setChannelCreated(true);
  };
  return !channelCreated ? (
    <QRScanner onScanCompleted={callback} />
  ) : (
    <VStack marginTop={'40%'}>
      <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
        {'Please continue subscription purchase from the Keeper Desktop App'}
      </Text>
      <ActivityIndicator style={{ marginTop: hp(20), alignSelf: 'center', padding: '2%' }} />
    </VStack>
  );
}

function PurchaseWithChannel() {
  const { colorMode } = useColorMode();
  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const onBarCodeRead = async (data) => {
    decryptionKey.current = data;
    const sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    const requestBody = {
      action: EMIT_MODES.PURCHASE_SUBS,
    };
    const requestData = createCipherGcm(JSON.stringify(requestBody), decryptionKey.current);
    channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE, requestData });
  };

  useEffect(() => {
    const startBackgroundListener = () => {
      BackgroundTimer.start();

      channel.connect();
      channel.on(CHANNEL_MESSAGE, async ({ data }) => {
        try {
          const { data: decrypted } = createDecipherGcm(data, decryptionKey.current);
        } catch (error) {
          console.log('🚀 ~ channel.on ~ error:', error);
        }
      });
    };

    startBackgroundListener();

    return () => {
      BackgroundTimer.stop();
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Purchase Subscription with Keeper Desktop App"
        subtitle={`Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to purchase a subscription plan.`}
      />
      <Box style={styles.qrContainer}>
        <ScanAndInstruct onBarCodeRead={onBarCodeRead} />
      </Box>
    </ScreenWrapper>
  );
}

export default PurchaseWithChannel;

const styles = StyleSheet.create({
  qrContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 25,
    alignItems: 'center',
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    padding: 20,
  },
  instructions: {
    width: windowWidth * 0.75,
    padding: '2%',
    letterSpacing: 0.65,
    fontSize: 13,
    textAlign: 'center',
  },
});
