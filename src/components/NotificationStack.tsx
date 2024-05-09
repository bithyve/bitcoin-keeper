import React, { useContext, useState } from 'react';
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
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import useUaiStack from 'src/hooks/useUaiStack';
import { useDispatch } from 'react-redux';
import { uaiActioned } from 'src/store/sagaActions/uai';
import { useNavigation } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import UAIView from 'src/screens/Home/components/HeaderDetails/components/UAIView';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { TransferType } from 'src/models/enums/TransferType';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import Text from './KeeperText';
import KeeperModal from './KeeperModal';
import ActivityIndicatorView from './AppActivityIndicator/ActivityIndicatorView';
import UAIEmptyState from './UAIEmptyState';
import FeeInsightsContent from 'src/screens/FeeInsights/FeeInsightsContent';
import useWallets from 'src/hooks/useWallets';
import VaultIcon from 'src/assets/images/wallet_vault.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import WalletsIcon from 'src/assets/images/daily_wallet.svg';
import Colors from 'src/theme/Colors';

import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc_black.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

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

type CardProps = {
  totalLength: number;
  index: number;
  uai: any;
  activeIndex: SharedValue<number>;
};

interface uaiDefinationInterface {
  heading: string;
  body: string;
  btnConfig: {
    primary: {
      text: string;
      cta: any;
    };
    secondary: {
      text: string;
      cta: any;
    };
  };
  modalDetails?: {
    heading: string;
    subTitle: string;
    body: any;
    sender: Object;
    recipient: Object;
    btnConfig: {
      primary: {
        text: string;
        cta: any;
      };
      secondary: {
        text: string;
        cta: any;
      };
    };
  };
}

function ModalCard({ preTitle = '', title, subTitle = '', isVault = false, icon = null }) {
  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.cardContainer}>
      <Box style={styles.preTitleContainer}>
        {isVault ? (
          <VaultIcon width={34} height={30} />
        ) : (
          <HexagonIcon
            width={34}
            height={30}
            backgroundColor={Colors.pantoneGreen}
            icon={<WalletsIcon />}
          />
        )}
        <Text style={styles.cardPreTitle}>{preTitle}</Text>
      </Box>

      <Box style={styles.subTitleContainer}>
        <Text numberOfLines={1} style={styles.cardTitle} color={`${colorMode}.balanceText`}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.cardSubtitle} color={`${colorMode}.balanceText`}>
          {icon} {subTitle}
        </Text>
      </Box>
    </Box>
  );
}

function Card({ uai, index, totalLength, activeIndex }: CardProps) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigtaion = useNavigation();
  const { showToast } = useToastMessage();
  const [showModal, setShowModal] = useState(false);
  const [modalActionLoader, setmodalActionLoader] = useState(false);
  const [insightModal, setInsightModal] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { notification } = translations;
  const skipUaiHandler = (uai: UAI) => {
    dispatch(uaiActioned({ uaiId: uai.id, action: false }));
  };

  const skipBtnConfig = (uai) => {
    return {
      text: 'Skip',
      cta: () => skipUaiHandler(uai),
    };
  };
  const backupHistory = useQuery(RealmSchema.BackupHistory);

  const getUaiTypeDefinations = (uai: UAI): uaiDefinationInterface => {
    const { activeVault } = useVault({ getFirst: true });
    const { wallets } = useWallets({ walletIds: [uai.entityId] });
    const wallet = wallets[0];

    switch (uai.uaiType) {
      case uaiType.SECURE_VAULT:
        return {
          heading: 'Create your first vault',
          body: 'Secure your sats with a vault',
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                setShowModal(true);
                navigtaion.navigate('AddWallet');
              },
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Set up your first vault',
            subTitle: 'Create your vault',
            body: 'Enhance security by creating a vault for your sats. Vaults add extra protection with multi-signature authentication.',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: () => {
                  setShowModal(false);
                  skipUaiHandler(uai);
                },
              },
              secondary: {
                text: 'Skip',
                cta: () => {
                  skipUaiHandler(uai);
                  navigtaion.goBack(); // TO-DO-UAI
                },
              },
            },
          },
        };
      case uaiType.VAULT_TRANSFER:
        return {
          heading: 'Transfer to Vault',
          body: uai.uaiDetails?.body,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                setShowModal(true);
              },
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: notification.vaultTransferHeading,
            subTitle: notification.vaultTransferSubTitle,
            body: notification.vaultTransferBody,
            sender: wallet,
            recipient: activeVault,
            btnConfig: {
              primary: {
                text: 'Transfer',
                cta: () => {
                  setShowModal(false);
                  activeVault
                    ? navigtaion.navigate('SendConfirmation', {
                        uaiSetActionFalse,
                        walletId: uai.entityId,
                        transferType: TransferType.WALLET_TO_VAULT,
                        isAutoTransfer: true,
                      })
                    : showToast('No vaults found', <ToastErrorIcon />);
                  skipUaiHandler(uai);
                },
              },
              secondary: {
                text: 'Later',
                cta: () => skipUaiHandler(uai),
              },
            },
          },
        };
      case uaiType.IKS_REQUEST:
        return {
          heading: 'Inheritance Key request',
          body: 'Take action on the pending IKS request ',
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                setShowModal(true);
              },
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Inheritance Key request',
            subTitle: 'Pleasetake action for the IKS ',
            body: 'There is a request by someone for accessing the Inheritance Key you have set up using this app',
            btnConfig: {
              primary: {
                text: 'Continue',
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
              },
              secondary: {
                text: 'Skip',
                cta: () => {
                  setShowModal(false);
                  skipUaiHandler(uai);
                },
              },
            },
          },
        };
      case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
        return {
          heading: 'Health check pending',
          body: uai.uaiDetails?.body,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                navigtaion.navigate('SigningDeviceDetails', {
                  signerId: uai.entityId,
                  isUaiFlow: true,
                });
                skipUaiHandler(uai);
              },
            },
            secondary: skipBtnConfig(uai),
          },
        };
      case uaiType.RECOVERY_PHRASE_HEALTH_CHECK:
        return {
          heading: 'Backup Recovery Key',
          body: 'Creates backup of all vaults and wallets',
          btnConfig: {
            primary: {
              text: 'Backup',
              cta: () => {
                if (backupHistory.length === 0) {
                  skipUaiHandler(uai);
                  navigtaion.navigate('AppSettings', {
                    isUaiFlow: true,
                  });
                } else {
                  skipUaiHandler(uai);
                  navigtaion.navigate('WalletBackHistory', {
                    isUaiFlow: true,
                  });
                }
              },
            },
            secondary: skipBtnConfig(uai),
          },
        };
      case uaiType.FEE_INISGHT:
        return {
          heading: 'Fee Insight',
          body: uai.uaiDetails?.body,
          btnConfig: {
            primary: {
              text: 'View insights',
              cta: () => {
                setInsightModal(true);
              },
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Fee Insight',
            subTitle: '',
            body: '',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: () => {},
              },
              secondary: {
                text: 'Skip',
                cta: () => {},
              },
            },
          },
        };
      default:
        return null;
    }
  };

  const uaiConfig = getUaiTypeDefinations(uai);

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

  const uaiSetActionFalse = () => {
    dispatch(uaiActioned({ uaiId: uai.id, action: true }));
  };

  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <>
      <Animated.View testID={`view_${uai.uaiType}`} style={[animations]}>
        {uai.uaiType === uaiType.DEFAULT ? (
          <UAIEmptyState />
        ) : uaiConfig ? (
          <Box style={styles.card} backgroundColor={`${colorMode}.seashellWhite`}>
            <UAIView
              title={uaiConfig.heading}
              subTitle={uaiConfig.body}
              primaryCallbackText={uaiConfig.btnConfig.primary.text}
              secondaryCallbackText={uaiConfig.btnConfig.secondary.text}
              primaryCallback={uaiConfig.btnConfig.primary.cta}
              secondaryCallback={uaiConfig.btnConfig.secondary.cta}
            />
          </Box>
        ) : null}
      </Animated.View>
      <KeeperModal
        visible={showModal}
        close={() => {
          setShowModal(false);
          skipUaiHandler(uai);
        }}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        title={uaiConfig?.modalDetails?.heading}
        subTitle={uaiConfig?.modalDetails?.subTitle}
        buttonText={uaiConfig?.modalDetails?.btnConfig.primary.text}
        buttonCallback={uaiConfig?.modalDetails?.btnConfig.primary.cta}
        secondaryButtonText={uaiConfig?.modalDetails?.btnConfig.secondary.text}
        secondaryCallback={uaiConfig?.modalDetails?.btnConfig.secondary.cta}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        showCloseIcon={false}
        Content={() => (
          <View>
            <Box style={styles.fdRow}>
              <Box style={styles.sentFromContainer}>
                <Text style={styles.transferText}>Transfer From</Text>
                <ModalCard
                  preTitle={uaiConfig?.modalDetails?.sender.presentationData.name}
                  title={notification.availableToSpend}
                  icon={
                    colorMode === 'light'
                      ? getCurrencyIcon(BTC, 'dark')
                      : getCurrencyIcon(BTC, 'light')
                  }
                  subTitle={`${getBalance(
                    uaiConfig?.modalDetails?.sender.specs.balances.confirmed
                  )} ${getSatUnit()}`}
                />
              </Box>
              <Box style={styles.sentToContainer}>
                <Text style={styles.transferText}>Transfer To</Text>
                <ModalCard
                  preTitle={uaiConfig?.modalDetails?.recipient.presentationData.name}
                  title={notification.Balance}
                  isVault={uaiConfig?.modalDetails?.recipient.entityKind === 'VAULT' ? true : false}
                  icon={
                    colorMode === 'light'
                      ? getCurrencyIcon(BTC, 'dark')
                      : getCurrencyIcon(BTC, 'light')
                  }
                  subTitle={`${getBalance(
                    uaiConfig?.modalDetails?.recipient.specs.balances.confirmed
                  )} ${getSatUnit()}`}
                />
              </Box>
            </Box>
            <Text style={styles.modalBody}>{uaiConfig?.modalDetails?.body}</Text>
          </View>
        )}
      />
      <KeeperModal
        visible={insightModal}
        close={() => {
          setInsightModal(false);
          skipUaiHandler(uai);
        }}
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={'Done'}
        buttonCallback={() => {
          setInsightModal(false);
          skipUaiHandler(uai);
        }}
        Content={() => <FeeInsightsContent />}
      />
      <ActivityIndicatorView visible={modalActionLoader} showLoader />
    </>
  );
}

export default function NotificationStack() {
  const { colorMode } = useColorMode();
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
          {uaiStack.length < 1 ? (
            <UAIEmptyState />
          ) : (
            uaiStack.map((uai, index) => {
              return (
                <Card
                  uai={uai}
                  key={uai.id}
                  index={index}
                  totalLength={uaiStack.length - 1}
                  activeIndex={activeIndex}
                />
              );
            })
          )}
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
  fdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  sentToContainer: {
    width: '48%',
  },
  sentFromContainer: {
    width: '48%',
  },
  subTitleContainer: {
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    marginLeft: 10,
  },
  cardPreTitle: {
    marginLeft: wp(5),
    fontSize: 14,
    letterSpacing: 0.14,
  },
  cardTitle: {
    fontSize: 11,
    letterSpacing: 0.14,
  },
  cardSubtitle: {
    fontSize: 14,
    letterSpacing: 0.72,
  },
  cardContainer: {
    alignItems: 'center',
    borderRadius: 10,

    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: hp(70),
  },
  preTitleContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  transferText: {
    fontWeight: 500,
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 3,
  },
  modalBody: {
    fontSize: 13,
  },
});
