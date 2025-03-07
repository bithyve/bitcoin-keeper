import { Box, useColorMode } from 'native-base';
import React, { memo, useContext, useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, SectionList } from 'react-native';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Instruction from 'src/components/Instruction';
import KeeperModal from 'src/components/KeeperModal';
import PendingHealthCheckModal from 'src/components/PendingHealthCheckModal';
import SelectWalletModal from 'src/components/SelectWalletModal';
import useUaiStack from 'src/hooks/useUaiStack';
import { TransferType } from 'src/models/enums/TransferType';
import FeeInsightsContent from 'src/screens/FeeInsights/FeeInsightsContent';
import { SentryErrorBoundary } from 'src/services/sentry';
import { uaiActioned, uaisSeen } from 'src/store/sagaActions/uai';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useVault from 'src/hooks/useVault';
import ServerTransNotificaiton from 'src/assets/images/server-transaction-notification-icon.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import { EntityKind } from 'src/services/wallets/enums';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { hp, wp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';
import useWallets from 'src/hooks/useWallets';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import Text from 'src/components/KeeperText';
import BackupRecoveryIcon from 'src/assets/images/backup_recovery_key.svg';
import CanaryWalletIcon from 'src/assets/images/canary_wallet_notification.svg';
import FeeInsightsIcon from 'src/assets/images/fee_insights.svg';
import HealthCheckIcon from 'src/assets/images/health_check_reminder.svg';
import TechSupportIcon from 'src/assets/images/tech_support_received.svg';
import TransferToVaultIcon from 'src/assets/images/transfer_to_vault.svg';
import NotificationSimpleIcon from 'src/assets/images/header-notification-simple-icon.svg';
import uai from 'src/store/reducers/uai';
import { useAppSelector } from 'src/store/hooks';
import { cachedTxSnapshot } from 'src/store/reducers/cachedTxn';
import UAIView from '../components/HeaderDetails/components/UAIView';

type CardProps = {
  totalLength: number;
  index: number;
  uai: any;
  wallet: Wallet | Vault | null;
};
interface uaiDefinationInterface {
  heading: string;
  body: string;
  icon: React.ComponentType<any>;
  btnConfig: {
    primary: {
      text: string;
      cta: any;
    };
  };
  modalDetails?: {
    heading: string;
    subTitle: string;
    body: any;
    sender?: Object;
    recipient?: Object;
    btnConfig: {
      primary: {
        text: string;
        cta: any;
      };
    };
    hideHiddenVaults?: boolean;
  };
}

const SUPPORTED_NOTOFOCATION_TYPES = [
  uaiType.SECURE_VAULT,
  uaiType.VAULT_TRANSFER,
  uaiType.SIGNING_DEVICES_HEALTH_CHECK,
  uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
  uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
  uaiType.CANARAY_WALLET,
  uaiType.ZENDESK_TICKET,
  uaiType.SIGNING_DELAY,
];

const Card = memo(({ uai, index, totalLength, wallet }: CardProps) => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigtaion = useNavigation();
  const { showToast } = useToastMessage();
  const [showModal, setShowModal] = useState(false);
  const [modalActionLoader, setmodalActionLoader] = useState(false);
  const [insightModal, setInsightModal] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { notification } = translations;
  const { activeVault } = useVault({ getFirst: true });
  const { signerMap } = useSignerMap();
  const { signers: vaultKeys } = activeVault || { signers: [] };
  const { vaultSigners: keys } = useSigners(
    activeVault?.entityKind === EntityKind.VAULT ? activeVault?.id : ''
  );
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [showSelectVault, setShowSelectVault] = useState(false);
  const [pendingHealthCheckCount, setPendingHealthCheckCount] = useState(0);
  const snapshots = useAppSelector((state) => state.cachedTxn.snapshots);

  const getUaiTypeDefinations = (uai: UAI): uaiDefinationInterface => {
    const backupHistory = useQuery(RealmSchema.BackupHistory);
    const { activeVault } = useVault({ getFirst: true });
    const content = getUaiContent(uai.uaiType, uai.uaiDetails);

    switch (uai.uaiType) {
      case uaiType.SECURE_VAULT:
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                navigtaion.navigate('AddNewWallet');
              },
            },
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
                },
              },
            },
          },
        };
      case uaiType.VAULT_TRANSFER:
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                activeVault ? setShowModal(true) : showToast('No vaults found', <ToastErrorIcon />);
              },
            },
          },
          modalDetails: {
            heading: notification.vaultTransferHeading,
            subTitle: notification.vaultTransferSubTitle.replace(
              '$wallet',
              wallet.presentationData.name
            ),
            body: notification.vaultTransferBody,
            sender: wallet,
            recipient: activeVault,
            btnConfig: {
              primary: {
                text: 'Proceed',
                cta: () => {
                  if (pendingHealthCheckCount >= activeVault.scheme.m) {
                    setShowModal(false);
                    setShowHealthCheckModal(true);
                  } else {
                    setShowModal(false);
                    activeVault
                      ? setShowSelectVault(true)
                      : showToast('No vaults found', <ToastErrorIcon />);
                  }
                },
              },
            },
            hideHiddenVaults: true,
          },
        };
      case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                navigtaion.navigate('SigningDeviceDetails', {
                  signerId: uai.entityId,
                  isUaiFlow: true,
                });
              },
            },
          },
        };
      case uaiType.RECOVERY_PHRASE_HEALTH_CHECK:
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'Backup',
              cta: () => {
                if (backupHistory.length === 0) {
                  navigtaion.navigate('Home', {
                    selectedOption: 'More',
                    isUaiFlow: true,
                  });
                } else {
                  navigtaion.navigate('WalletBackHistory', {
                    isUaiFlow: true,
                  });
                }
              },
            },
          },
        };
      case uaiType.FEE_INISGHT:
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'View insights',
              cta: () => {
                setInsightModal(true);
              },
            },
          },
          modalDetails: {
            heading: 'Fee Insights',
            subTitle: '',
            body: '',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: () => {},
              },
            },
          },
        };
      case uaiType.CANARAY_WALLET:
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'View',
              cta: () => {
                navigtaion.navigate('VaultDetails', { vaultId: uai.entityId });
              },
            },
          },
        };
      case uaiType.ZENDESK_TICKET: {
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'View',
              cta: () => {
                dispatch(uaiActioned({ uaiId: uai.id, action: false }));
                navigtaion.navigate('TicketDetails', {
                  ticketId: parseInt(uai.entityId),
                  ticketStatus: uai.uaiDetails.heading,
                });
              },
            },
          },
        };
      }
      case uaiType.SIGNING_DELAY: {
        return {
          heading: content.heading,
          body: content.body,
          icon: content.icon,
          btnConfig: {
            primary: {
              text: 'View',
              cta: () => {
                const delayedTxid = uai.entityId;
                const snapshot: cachedTxSnapshot = snapshots[delayedTxid]; // cachedTxid is same as delayedTxid
                if (snapshot) {
                  navigtaion.dispatch(
                    CommonActions.navigate('SendConfirmation', {
                      ...snapshot.routeParams,
                      addresses: snapshot.routeParams.addresses,
                      amounts: snapshot.routeParams.amounts,
                      internalRecipients: snapshot.routeParams.internalRecipients,
                    })
                  );
                } else {
                  showToast('Cached transaction not found');
                }
              },
            },
          },
        };
      }

      default:
        return null;
    }
  };

  const uaiConfig = getUaiTypeDefinations(uai);

  if (!uaiConfig) {
    return <></>;
  }

  return (
    <>
      <Box style={styles.card} backgroundColor={`${colorMode}.seashellWhite`}>
        <UAIView
          title={uaiConfig.heading}
          subTitle={uaiConfig.body}
          icon={uaiConfig.icon}
          primaryCallbackText={uaiConfig.btnConfig.primary.text}
          primaryCallback={uaiConfig.btnConfig.primary.cta}
        />
      </Box>
      <KeeperModal
        visible={showModal}
        close={() => {
          setShowModal(false);
        }}
        title={uaiConfig?.modalDetails?.heading}
        subTitle={uaiConfig?.modalDetails?.subTitle}
        buttonText={uaiConfig?.modalDetails?.btnConfig.primary.text}
        buttonCallback={uaiConfig?.modalDetails?.btnConfig.primary.cta}
        showCloseIcon={false}
        Content={() => <Instruction text={uaiConfig?.modalDetails?.body} />}
      />
      <PendingHealthCheckModal
        selectedItem={activeVault}
        vaultKeys={vaultKeys}
        signerMap={signerMap}
        keys={keys}
        showHealthCheckModal={showHealthCheckModal}
        setShowHealthCheckModal={setShowHealthCheckModal}
        pendingHealthCheckCount={pendingHealthCheckCount}
        setPendingHealthCheckCount={setPendingHealthCheckCount}
        primaryButtonCallback={() => {
          setShowHealthCheckModal(false);
          if (activeVault) {
            navigtaion.navigate('Send', {
              sender: wallet,
              selectedUTXOs: [],
              isSendMax: true,
              internalRecipientWallet: activeVault,
            });
          } else {
            showToast('No vaults found', <ToastErrorIcon />);
          }
        }}
      />
      <KeeperModal
        visible={insightModal}
        close={() => {
          setInsightModal(false);
          dispatch(uaiActioned({ uaiId: uai.id, action: false }));
        }}
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonText="Done"
        buttonCallback={() => {
          setInsightModal(false);
          dispatch(uaiActioned({ uaiId: uai.id, action: false }));
        }}
        Content={() => <FeeInsightsContent />}
      />
      <SelectWalletModal
        showModal={showSelectVault}
        setShowModal={setShowSelectVault}
        onlyVaults={true}
        onlyWallets={false}
        hideHiddenVaults={uaiConfig?.modalDetails?.hideHiddenVaults}
        buttonCallback={(vault) => {
          navigtaion.navigate('AddSendAmount', {
            sender: wallet,
            recipient: vault,
            transferType: TransferType.WALLET_TO_VAULT,
            isSendMax: true,
          });
          setShowSelectVault(false);
        }}
        secondaryCallback={() => {
          setShowSelectVault(false);
        }}
      />
      <ActivityIndicatorView visible={modalActionLoader} showLoader />
    </>
  );
});

function NotificationsCenter() {
  const { colorMode } = useColorMode();
  const { uaiStack, isLoading } = useUaiStack();
  const { wallets: allWallets } = useWallets({ getAll: true });
  const dispatch = useDispatch();

  const { unseenNotifications, seenNotifications } = useMemo(
    () => ({
      unseenNotifications: uaiStack
        .filter((uai) => !uai.seenAt)
        .filter((uai) => SUPPORTED_NOTOFOCATION_TYPES.includes(uai.uaiType))
        .sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        }),
      seenNotifications: uaiStack
        .filter((uai) => uai.seenAt)
        .filter((uai) => SUPPORTED_NOTOFOCATION_TYPES.includes(uai.uaiType))
        .sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        }),
    }),
    [uaiStack]
  );

  useEffect(() => {
    if (uaiStack?.length) {
      const unseenNotifications = uaiStack.filter((notification) => !notification.seenAt);
      if (unseenNotifications.length) {
        dispatch(uaisSeen({ uaiIds: unseenNotifications.map((uai) => uai.id) }));
      }
    }
  }, [uaiStack]);

  const renderNotificationCard = ({ uai, index }: { uai: UAI; index: number }) => {
    return (
      <Card
        uai={uai}
        key={uai.id}
        index={index}
        totalLength={uaiStack.length - 1}
        wallet={allWallets.find((wallet) => wallet.id === uai.entityId)}
      />
    );
  };

  return (
    <ScreenWrapper paddingHorizontal={0}>
      <Box
        backgroundColor={`${colorMode}.primaryBackground`}
        style={{
          paddingHorizontal: 20,
          paddingTop: hp(15),
          paddingBottom: hp(5),
        }}
      >
        <WalletHeader title="Notifications" />
      </Box>
      <Box
        style={styles.notificationsContainer}
        height="93%"
        backgroundColor={`${colorMode}.seashellWhite`}
      >
        {isLoading ? (
          <Box height="100%" justifyContent="center" alignItems="center">
            <ActivityIndicator testID="activityIndicator" size="large" animating color="#00836A" />
          </Box>
        ) : (
          <Box height="95%">
            <SectionList
              sections={[
                {
                  title: 'New',
                  data: unseenNotifications,
                  show: unseenNotifications.length > 0,
                },
                {
                  title: 'Seen',
                  data: seenNotifications,
                  show: seenNotifications.length > 0,
                },
              ].filter((section) => section.show)}
              renderItem={({ item, index }) => renderNotificationCard({ uai: item, index })}
              renderSectionHeader={({ section: { title } }) => (
                <Box style={styles.listHeader} backgroundColor={`${colorMode}.seashellWhite`}>
                  <Text fontSize={16} semiBold>
                    {title}
                  </Text>
                  <Box
                    style={{ borderBottomWidth: 1, marginTop: hp(8) }}
                    borderColor={`${colorMode}.MintWhisper`}
                  />
                </Box>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
            {seenNotifications.length == 0 && unseenNotifications.length == 0 && (
              <Box height="95%" marginLeft={wp(15)}>
                <Text fontSize={14}>You have no new notifications</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ScreenWrapper>
  );
}

export default SentryErrorBoundary(NotificationsCenter);

const styles = StyleSheet.create({
  card: {
    height: hp(100),
    justifyContent: 'center',
  },
  notificationsContainer: {
    marginTop: hp(30),
    marginBottom: hp(10),
    width: '100%',
  },
  listHeader: {
    width: '100%',
    paddingHorizontal: wp(22),
    paddingTop: wp(20),
    paddingBottom: wp(10),
  },
});

export const getUaiContent = (type: uaiType, details?: any) => {
  switch (type) {
    case uaiType.SECURE_VAULT:
      return {
        heading: 'Create Your First Vault',
        body: 'Secure your sats with a vault',
        icon: <TransferToVaultIcon />,
      };

    case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
      return {
        heading: 'Health check pending',
        body: details?.body || 'Health Check for your Ledger',
        icon: <HealthCheckIcon />,
      };

    case uaiType.RECOVERY_PHRASE_HEALTH_CHECK:
      return {
        heading: 'Backup Recovery Key',
        body: 'Backup the Recovery Key to secure the app',
        icon: <BackupRecoveryIcon />,
      };

    case uaiType.FEE_INISGHT:
      return {
        heading: 'Fee Insights',
        body: details?.body || 'Check your fee insights',
        icon: <FeeInsightsIcon />,
      };

    case uaiType.VAULT_TRANSFER:
      return {
        heading: 'Transfer to Vault',
        body: details?.body || 'Transfer your sats to vault',
        icon: <TransferToVaultIcon />,
      };

    case uaiType.CANARAY_WALLET:
      return {
        heading: 'Canary Wallet Accessed',
        body: 'One of your key has been used',
        icon: <CanaryWalletIcon />,
      };

    case uaiType.ZENDESK_TICKET:
      return {
        heading: 'Technical Support',
        body: details?.body || 'Support ticket update',
        icon: <TechSupportIcon />,
      };
    case uaiType.SIGNING_DELAY:
      return {
        heading: 'Server Key Signed Transaction',
        body: 'The Server Key signed your requested transactions.',
        icon: <ServerTransNotificaiton />,
      };

    default:
      return {
        heading: '',
        body: '',
        icon: <NotificationSimpleIcon />,
      };
  }
};
