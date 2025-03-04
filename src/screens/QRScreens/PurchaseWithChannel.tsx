import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import { CHANNEL_MESSAGE, EMIT_MODES, JOIN_CHANNEL } from 'src/services/channel/constants';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import { createCipherGcm } from 'src/utils/service-utilities/utils';
import QRScanner from 'src/components/QRScanner';
import BackgroundTimer from 'react-native-background-timer';
import Relay from 'src/services/backend/Relay';
import SubScription from 'src/models/interfaces/Subscription';
import useToastMessage from 'src/hooks/useToastMessage';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { setSubscription } from 'src/store/reducers/settings';
import Note from 'src/components/Note/Note';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import TierUpgradeModal, { UPGRADE_TYPE } from '../ChoosePlanScreen/TierUpgradeModal';
import { useQuery } from '@realm/react';
import { manipulateIosProdProductId } from 'src/utils/utilities';

function ScanAndInstruct({ onBarCodeRead }) {
  const { colorMode } = useColorMode();
  const [channelCreated, setChannelCreated] = useState(false);

  const callback = (data) => {
    let success = onBarCodeRead(data);
    if (success) {
      setChannelCreated(true);
    }
  };
  return !channelCreated ? (
    <QRScanner onScanCompleted={callback} />
  ) : (
    <VStack>
      <VStack marginTop={'40%'}>
        <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
          {`Please continue on the Keeper Desktop App`}
        </Text>
        <ActivityIndicator style={{ marginTop: hp(20), alignSelf: 'center', padding: '2%' }} />
      </VStack>
    </VStack>
  );
}

function PurchaseWithChannel() {
  const { colorMode } = useColorMode();
  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();
  const { common } = useContext(LocalizationContext).translations;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeType, setUpgradeType] = useState(null);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const { id, subscription: currentSubscription }: KeeperApp = dbManager.getObjectByIndex(
    RealmSchema.KeeperApp
  );

  useEffect(() => {
    const startBackgroundListener = () => {
      BackgroundTimer.start();
      const isSocketActive = channel.connected;
      if (isSocketActive) return;
      channel.connect();
      channel.on(CHANNEL_MESSAGE, async ({ data }) => {
        try {
          if (data?.isUpdated) {
            const { productId, receipt, name, level, icon } = data;
            const subscription: SubScription = {
              productId: manipulateIosProdProductId(productId),
              receipt,
              name,
              level,
              icon,
              isDesktopPurchase: true,
            };
            calculateModalContent(subscription, currentSubscription);
            dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
              subscription,
            });
            dispatch(setSubscription(subscription.name));
            setShowUpgradeModal(true);
          } else {
            if (data?.error) {
              Alert.alert('Error', data.error, [
                {
                  text: 'ok',
                  onPress: () => navigation.goBack(),
                  style: 'cancel',
                },
              ]);
            } else {
              showToast('Something went wrong, Please try again!.', <ToastErrorIcon />);
              navigation.goBack();
            }
          }
        } catch (error) {
          console.log('🚀 ~ channel.on ~ error:', error);
        }
      });
    };

    startBackgroundListener();

    return () => {
      BackgroundTimer.stop();
      channel.disconnect();
      channel.removeAllListeners();
    };
  }, []);

  const calculateModalContent = (response, appSubscription) => {
    if (response.level === appSubscription.level) {
      if (appSubscription.productId.includes('yearly'))
        setUpgradeType(UPGRADE_TYPE.YEARLY_TO_MONTHLY);
      else setUpgradeType(UPGRADE_TYPE.MONTHLY_TO_YEARLY);
    } else if (response.level > appSubscription.level) setUpgradeType(UPGRADE_TYPE.UPGRADE);
    else setUpgradeType(UPGRADE_TYPE.DOWNGRADE);
  };

  const onBarCodeRead = async (data) => {
    decryptionKey.current = data;
    const sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    const requestBody = {
      appId: id,
      roomId: room,
    };
    const res = await Relay.checkEligibilityForBtcPay(requestBody);
    if (res.status) {
      requestBody['action'] = EMIT_MODES.PURCHASE_SUBS;
      console.log('=> ', JSON.stringify(requestBody));
      const requestData = createCipherGcm(JSON.stringify(requestBody), decryptionKey.current);
      channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE, requestData });
    } else {
      navigation.goBack();
      showToast(res.error ?? 'Something went wrong, Please try again!.', <ToastErrorIcon />);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Purchase Subscription with Keeper Desktop App"
        subtitle={`Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to purchase a subscription plan.`}
      />
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
        <ScanAndInstruct onBarCodeRead={onBarCodeRead} />
      </ScrollView>
      <Box style={styles.noteWrapper}>
        <Note
          title={common.note}
          subtitle={'Make sure that the QR is well aligned, focused and visible as a whole'}
          subtitleColor="GreyText"
        />
      </Box>
      <TierUpgradeModal
        visible={showUpgradeModal}
        close={() => setShowUpgradeModal(false)}
        onPress={() => {
          setShowUpgradeModal(false);
          navigation.goBack();
        }}
        upgradeType={upgradeType}
        plan={subscription.name}
      />
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

  container: {
    marginVertical: 25,
    alignItems: 'center',
  },
  addressContainer: {
    marginHorizontal: wp(20),
  },
});
