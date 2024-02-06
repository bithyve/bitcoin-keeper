import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Box, useColorMode } from 'native-base';
import { uaiType } from 'src/models/interfaces/Uai';
import useUaiStack from 'src/hooks/useUaiStack';
import { useDispatch } from 'react-redux';
import { uaiActioned } from 'src/store/sagaActions/uai';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import Text from './KeeperText';
import KeeperModal from './KeeperModal';
import ActivityIndicatorView from './AppActivityIndicator/ActivityIndicatorView';
import UAIView from 'src/screens/Home/components/HeaderDetails/components/UAIView';
import { windowHeight } from 'src/constants/responsive';
import { TransferType } from 'src/models/enums/TransferType';

const { width } = Dimensions.get('window');

const _size = width * 0.95;
const layout = {
  borderRadius: 16,
  width: _size,
  height: 90,
  spacing: 12,
  cardsGap: 10,
};
const maxVisibleItems = 3;

const nonSkippableUAIs = [uaiType.DEFAULT, uaiType.SECURE_VAULT];

type CardProps = {
  totalLength: number;
  index: number;
  info: any;
  activeIndex: SharedValue<number>;
};

function Card({ info, index, totalLength, activeIndex }: CardProps) {
  const { colorMode } = useColorMode();

  const dispatch = useDispatch();
  const navigtaion = useNavigation();
  const { showToast } = useToastMessage();

  const [showModal, setShowModal] = useState(false);
  const [modalActionLoader, setmodalActionLoader] = useState(false);
  const [uaiConfig, setUaiConfig] = useState<any>({});

  const { activeVault } = useVault({ getFirst: true });

  const animations = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: totalLength - index,
      opacity: interpolate(
        activeIndex.value,
        [index - 1, index, index + 1],
        [1 - 1 / maxVisibleItems, 1, 1]
      ),
      transform: [
        {
          translateY: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [layout.cardsGap, 0, layout.height + layout.cardsGap]
          ),
        },
        {
          scale: interpolate(activeIndex.value, [index - 1, index, index + 1], [0.96, 1, 1]),
        },
      ],
    };
  });

  const getUaiTypeDefinations = (type: string, entityId?: string) => {
    switch (type) {
      case uaiType.RELEASE_MESSAGE:
        return {
          modalDetails: {
            heading: 'Update application',
            btnText: 'Update',
          },
          cta: () => {
            setShowModal(false);
            uaiSetActionFalse();
          },
        };
      case uaiType.VAULT_TRANSFER:
        return {
          modalDetails: {
            heading: 'Trasfer to Vault',
            subTitle:
              'Your Auto-transfer policy has triggered a transaction that needs your approval',
            btnText: ' Transfer Now',
          },
          heading: 'Trasfer to Vault',
          cta: (info) => {
            activeVault
              ? navigtaion.navigate('SendConfirmation', {
                  uaiSetActionFalse,
                  walletId: info.entityId,
                  transferType: TransferType.WALLET_TO_VAULT,
                })
              : showToast('No vaults found', <ToastErrorIcon />);

            setShowModal(false);
          },
        };
      case uaiType.SECURE_VAULT:
        return {
          heading: 'Secure you vault',
          cta: () => {
            navigtaion.dispatch(
              CommonActions.navigate({ name: 'VaultSetup', merge: true, params: {} })
            );
          },
        };
      case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
        return {
          heading: 'Pending healthcheck',
          cta: () => {
            navigtaion.navigate('VaultDetails', { vaultId: activeVault.id });
          },
        };
      case uaiType.IKS_REQUEST:
        return {
          modalDetails: {
            heading: 'Inheritance Key request',
            subTitle: `Request:${entityId}`,
            displayText:
              'There is a request by someone for accessing the Inheritance Key you have set up using this app',
            btnText: 'Decline',
          },
          heading: 'Inheritance Key request',
          cta: async (entityId) => {
            try {
              setmodalActionLoader(true);
              if (entityId) {
                const res = await InheritanceKeyServer.declineInheritanceKeyRequest(entityId);
                if (res?.declined) {
                  showToast('IKS declined');
                  uaiSetActionFalse();
                  setShowModal(false);
                } else {
                  Alert.alert('Something went Wrong!');
                }
              }
            } catch (err) {
              Alert.alert('Something went Wrong!');
              console.log('Error in declining request');
            }
            setShowModal(false);
            setmodalActionLoader(false);
          },
        };
      case uaiType.DEFAULT:
        return {
          heading: 'Secure you vault',
          cta: () => {
            navigtaion.navigate('ManageSigners');
          },
        };
      default:
        return {
          cta: () => {
            activeVault
              ? navigtaion.navigate('VaultDetails', { vaultId: activeVault.id })
              : showToast('No vaults found', <ToastErrorIcon />);
          },
        };
    }
  };

  useEffect(() => {
    setUaiConfig(getUaiTypeDefinations(info?.uaiType, info?.entityId));
  }, [info]);

  const uaiSetActionFalse = () => {
    dispatch(uaiActioned(info.id));
  };

  const pressHandler = () => {
    if (info?.isDisplay) {
      setShowModal(true);
    } else {
      uaiConfig?.cta(info);
    }
  };

  return (
    <>
      <Animated.View style={[animations]}>
        <Box style={styles.card} backgroundColor={`${colorMode}.seashellWhite`}>
          <UAIView
            title={uaiConfig.heading}
            subTitle={info?.title}
            primaryCallbackText={'Continue'}
            secondaryCallbackText={!nonSkippableUAIs.includes(info?.uaiType) && 'SKIP'}
            secondaryCallback={!nonSkippableUAIs.includes(info?.uaiType) && uaiSetActionFalse}
            primaryCallback={pressHandler}
          />
        </Box>
      </Animated.View>

      <KeeperModal
        visible={showModal}
        close={() => setShowModal(false)}
        title={uaiConfig?.modalDetails?.heading}
        subTitle={uaiConfig?.modalDetails?.subTitle}
        buttonText={uaiConfig?.modalDetails?.btnText}
        buttonTextColor="light.white"
        buttonCallback={() => uaiConfig?.cta(info?.entityId)}
        Content={() => <Text color="light.greenText">{info?.displayText}</Text>}
      />
      <ActivityIndicatorView visible={modalActionLoader} showLoader />
    </>
  );
}

export default function NotificationStack() {
  const activeIndex = useSharedValue(0);
  const { uaiStack } = useUaiStack();

  const removeCard = () => {};

  const flingUp = Gesture.Fling()
    .direction(Directions.UP)
    .onStart(() => {
      runOnJS(removeCard)();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(flingUp)}>
        <View style={styles.viewWrapper}>
          {(uaiStack || []).map((c, index) => {
            return (
              <Card
                info={c}
                key={c.id}
                index={index}
                totalLength={uaiStack.length - 1}
                activeIndex={activeIndex}
              />
            );
          })}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    top: windowHeight / 8,
  },
  viewWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: layout.borderRadius,
    width: layout.width,
    height: layout.height,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 14,
    fontWeight: '600',
    width: '50%',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skip: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
});
