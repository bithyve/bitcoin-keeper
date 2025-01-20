import { InteractionManager, Linking } from 'react-native';
import React, { useEffect } from 'react';
import {
  RKInteractionMode,
  SignerStorage,
  SignerType,
  WalletType,
  XpubTypes,
} from 'src/services/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { resetElectrumNotConnectedErr, setIsInitialLogin } from 'src/store/reducers/login';
import {
  findChangeFromReceiverAddresses,
  findVaultFromSenderAddress,
  urlParamsToObj,
} from 'src/utils/service-utilities/utils';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import useSigners from 'src/hooks/useSigners';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { generateSignerFromMetaData, getPsbtForHwi } from 'src/hardware';
import { addSigningDevice, refreshCanaryWallets } from 'src/store/sagaActions/vaults';
import { resetVaultMigration, setRemoteLinkDetails } from 'src/store/reducers/vaults';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import dbManager from 'src/storage/realm/dbManager';
import useAsync from 'src/hooks/useAsync';
import { initializeSentry } from 'src/services/sentry';
import Relay from 'src/services/backend/Relay';
import { generateDataFromPSBT } from 'src/utils/utilities';
import { getKeyUID } from 'src/utils/utilities';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { decrypt, getHashFromKey } from 'src/utils/service-utilities/encryption';
import { CommonActions, useNavigationState } from '@react-navigation/native';
import { updateCachedPsbtEnvelope } from 'src/store/reducers/cachedTxn';
import { store } from 'src/store/store';
import config from 'src/utils/service-utilities/config';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import messaging from '@react-native-firebase/messaging';
import { notificationType } from 'src/models/enums/Notifications';
import { CHANGE_INDEX_THRESHOLD, SignersReqVault } from '../Vault/SigningDeviceDetails';
import useVault from 'src/hooks/useVault';
import { Vault } from 'src/services/wallets/interfaces/vault';

function InititalAppController({ navigation, electrumErrorVisible, setElectrumErrorVisible }) {
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { isInitialLogin } = useAppSelector((state) => state.login);
  const { enableAnalyticsLogin } = useAppSelector((state) => state.settings);
  const averageTxFees = useAppSelector((state) => state.network.averageTxFees);
  const appData = useQuery(RealmSchema.KeeperApp);
  const { allVaults } = useVault({ includeArchived: false });

  const getAppData = (): { isPleb: boolean; appId: string } => {
    const tempApp = appData.map(getJSONFromRealmObject)[0];
    const isPleb = tempApp.subscription.name.toUpperCase() === SubscriptionTier.L1.toUpperCase();
    const appId = tempApp.id.toString();
    return { isPleb, appId };
  };

  function handleDeepLinkEvent(event) {
    const { url } = event;
    if (url) {
      if (url.includes('backup')) {
        const splits = url.split('backup/');
        const decoded = Buffer.from(splits[1], 'base64').toString();
        const params = urlParamsToObj(decoded);
        if (params.seed) {
          navigation.navigate('EnterWalletDetail', {
            seed: params.seed,
            name: `${
              params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
            } `,
            path: params.path,
            appId: params.appId,
            description: `Imported from ${
              params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
            } `,
            type: WalletType.IMPORTED,
          });
        } else {
          showToast('Invalid deeplink');
        }
      }
      if (url.includes('remote/')) {
        handleRemoteKeyDeepLink(url);
      }
    }
  }

  const activeRoute = useNavigationState((state) => {
    const route = state.routes[state.index]; // Get the active route
    return route.name;
  });

  const { inProgress, start } = useAsync();

  const handleRemoteKeyDeepLink = async (initialUrl: string) => {
    const encryptionKey = initialUrl.split('remote/')[1];
    const hash = getHashFromKey(encryptionKey);
    if (encryptionKey && hash) {
      try {
        const res = await Relay.getRemoteKey(hash);
        if (!res) {
          showToast('Remote Key link expired');
          return;
        }
        const { data: response } = res;
        const tempData = JSON.parse(decrypt(encryptionKey, response));
        switch (tempData.type) {
          case RKInteractionMode.SHARE_REMOTE_KEY:
            navigation.navigate('ManageSigners', {
              remoteData: tempData,
            });
            break;

          case RKInteractionMode.SHARE_PSBT:
            const { keyUID, xfp, cachedTxid } = tempData;
            let serializedPSBT = tempData.psbt;

            if (serializedPSBT) {
              try {
                try {
                  const signer = signers.find((s) => keyUID == getKeyUID(s));
                  // TODO: Need to find a way to detect Miniscript in PSBT without having to import the vault
                  let isMiniscript = false;
                  if (!signer) throw { message: 'Signer not found' };
                  let {
                    senderAddresses,
                    receiverAddresses,
                    fees,
                    signerMatched,
                    feeRate,
                    changeAddressIndex,
                  } = generateDataFromPSBT(serializedPSBT, signer);

                  if (!signerMatched) {
                    showToast(`Invalid signer selection. Please try again!`, <ToastErrorIcon />);
                    navigation.goBack();
                    return false;
                  }

                  const activeVault = findVaultFromSenderAddress(allVaults, senderAddresses);
                  if (SignersReqVault.includes(signer.type)) {
                    if (!activeVault) {
                      navigation.goBack();
                      throw new Error('Please import the vault before signing');
                    }
                    const psbtWithGlobalXpub = await getPsbtForHwi(serializedPSBT, activeVault);
                    serializedPSBT = psbtWithGlobalXpub.serializedPSBT;
                  }
                  if (activeVault && changeAddressIndex) {
                    if (
                      parseInt(changeAddressIndex) >
                      activeVault.specs.nextFreeChangeAddressIndex + CHANGE_INDEX_THRESHOLD
                    )
                      throw new Error('Change index is too high.');
                    receiverAddresses = findChangeFromReceiverAddresses(
                      activeVault,
                      receiverAddresses,
                      parseInt(changeAddressIndex)
                    );
                  }
                  if (activeVault) {
                    isMiniscript = !!activeVault?.scheme?.miniscriptScheme;
                  }

                  dispatch(setRemoteLinkDetails({ xfp, cachedTxid }));
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'PSBTSendConfirmation',
                      params: {
                        sender: senderAddresses,
                        recipient: receiverAddresses,
                        fees: fees,
                        signer,
                        psbt: serializedPSBT,
                        feeRate,
                        isMiniscript,
                      },
                    })
                  );
                } catch (e) {
                  showToast(e.message);
                }
              } catch (e) {
                console.log('🚀 ~ handleRemoteKeyDeepLink ~ e:', e);
                showToast('Something went wrong. Please try again!', <ToastErrorIcon />);
              }
            } else {
              showToast('Invalid link. Please try again!', <ToastErrorIcon />);
            }
            break;

          case RKInteractionMode.SHARE_SIGNED_PSBT:
            try {
              const { psbt, xfp, cachedTxid } = tempData;
              var state = store.getState();

              if (
                state.sendAndReceive.sendPhaseTwo.cachedTxid === cachedTxid &&
                state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops.length &&
                activeRoute != 'Home'
              ) {
                dispatch(updatePSBTEnvelops({ xfp, signedSerializedPSBT: psbt }));
                const navState = navigation.getState();
                const routeIndex = navState.routes.findIndex(
                  (route) => route.name === 'SignTransactionScreen'
                );
                if (routeIndex !== -1) {
                  navigation.pop(navState.index - routeIndex);
                  showToast('Remote Transaction signed successfully', <TickIcon />);
                }
              } else {
                dispatch(updateCachedPsbtEnvelope({ xfp, signedSerializedPSBT: psbt, cachedTxid }));
                showToast('Remote Transaction signed successfully', <TickIcon />);
              }
            } catch (err) {
              if (err.message) showToast(err.message, <ToastErrorIcon />);
              console.log('🚀 ~ handleRemoteKeyDeepLink ~ err:', err);
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.log('🚀 ~ handleRemoteKeyDeepLink ~ error:', error);
        showToast('Something went wrong, please try again!');
      }
    } else {
      showToast('Invalid Remote Key link');
    }
  };

  const toggleSentryReports = async () => {
    if (inProgress) {
      return;
    }
    if (enableAnalyticsLogin && config.isDevMode()) {
      await start(() => initializeSentry());
    }
    dbManager.updateObjectById(RealmSchema.KeeperApp, getAppData().appId, {
      enableAnalytics: enableAnalyticsLogin,
    });
  };

  const handleZendeskNotificationRedirection = (data) => {
    if (data?.notificationType === notificationType.ZENDESK_TICKET) {
      const { ticketId = null, ticketStatus = null } = data;
      if (ticketId && ticketStatus)
        navigation.navigate({
          name: 'TicketDetails',
          params: { ticketId: parseInt(ticketId), ticketStatus },
        });
    }
  };

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      handleZendeskNotificationRedirection(remoteMessage.data);
    });

    // Listener for when the app is opened from a terminated state
    const getInitialNotification = async () => {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) handleZendeskNotificationRedirection(initialNotification.data);
    };

    getInitialNotification();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isInitialLogin) {
      toggleSentryReports();
    }
    dispatch(setIsInitialLogin(false));
  }, []);

  async function handleDeepLinking() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        if (initialUrl.includes('backup')) {
          const splits = initialUrl.split('backup/');
          const decoded = Buffer.from(splits[1], 'base64').toString();
          const params = urlParamsToObj(decoded);
          if (params.seed) {
            navigation.navigate('EnterWalletDetail', {
              seed: params.seed,
              name: `${
                params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
              } `,
              path: params.path,
              appId: params.appId,
              purpose: params.purpose,
              description: `Imported from ${
                params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
              } `,
              type: WalletType.IMPORTED,
            });
          } else {
            showToast('Invalid deeplink');
          }
        } else if (initialUrl.includes('create/')) {
        } else if (initialUrl.includes('remote/')) {
          handleRemoteKeyDeepLink(initialUrl);
        }
      }
    } catch (error) {
      //
    }
  }

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLinkEvent);
    handleDeepLinking();
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (electrumClientConnectionStatus.success) {
        if (electrumErrorVisible) setElectrumErrorVisible(false);
      } else if (electrumClientConnectionStatus.failed) {
        showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
        setElectrumErrorVisible(true);
      }
    });
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (electrumClientConnectionStatus.setElectrumNotConnectedErr) {
        showToast(
          `${electrumClientConnectionStatus.setElectrumNotConnectedErr}`,
          <ToastErrorIcon />
        );
        dispatch(resetElectrumNotConnectedErr());
      }
    });
  }, [electrumClientConnectionStatus.setElectrumNotConnectedErr]);

  // inital mobile key generation
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const { signers } = useSigners();
  const myAppKeys = signers.filter((signer) => signer.type === SignerType.MY_KEEPER);
  const myAppKeyCount = myAppKeys.length;

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (!myAppKeyCount) {
        getCosignerDetails(primaryMnemonic, myAppKeyCount).then((details) => {
          const { signer } = generateSignerFromMetaData({
            xpub: details.xpubDetails[XpubTypes.P2WSH].xpub,
            xpriv: details.xpubDetails[XpubTypes.P2WSH].xpriv,
            derivationPath: details.xpubDetails[XpubTypes.P2WSH].derivationPath,
            masterFingerprint: details.mfp,
            signerType: SignerType.MY_KEEPER,
            storageType: SignerStorage.WARM,
            isMultisig: true,
          });
          dispatch(addSigningDevice([signer]));
        });
      }
    });
  }, []);

  useEffect(() => {
    dispatch(refreshCanaryWallets);
  }, []);

  // cleanup instances on app start
  useEffect(() => {
    dispatch(resetVaultMigration());
  }, []);

  return null;
}

export default InititalAppController;
