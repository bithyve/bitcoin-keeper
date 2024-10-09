import * as Sentry from '@sentry/react-native';
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
import { createDecipheriv, urlParamsToObj } from 'src/utils/service-utilities/utils';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import useSigners from 'src/hooks/useSigners';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { generateSignerFromMetaData } from 'src/hardware';
import { addSigningDevice, refreshCanaryWallets } from 'src/store/sagaActions/vaults';
import { resetVaultMigration } from 'src/store/reducers/vaults';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import dbManager from 'src/storage/realm/dbManager';
import useAsync from 'src/hooks/useAsync';
import { sentryConfig } from 'src/services/sentry';
import Relay from 'src/services/backend/Relay';
import { calculateTimeLeft } from 'src/utils/utilities';

import { Psbt } from 'bitcoinjs-lib';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import { decrypt } from 'src/utils/service-utilities/encryption';

function InititalAppController({ navigation, electrumErrorVisible, setElectrumErrorVisible }) {
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { isInitialLogin } = useAppSelector((state) => state.login);
  const { enableAnalyticsLogin } = useAppSelector((state) => state.settings);
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  function handleDeepLinkEvent(event) {
    console.log('🚀 ~ handleDeepLinkEvent ~ event:', event);
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
      if (url.includes('shareKey/')) {
        handleRemoteKeyDeepLink(url);
      }
    }
  }

  const { inProgress, start } = useAsync();

  const handleRemoteKeyDeepLink = async (initialUrl: string) => {
    const [externalKeyId, encryptionKey] = initialUrl.split('shareKey/')[1].split('/');
    if (externalKeyId) {
      const { createdAt, data: response, err } = await Relay.getRemoteKey(externalKeyId);
      if (err) {
        showToast(err);
        return;
      }
      const tempData = JSON.parse(decrypt(encryptionKey, response));
      console.log('🚀 ~ handleRemoteKeyDeepLink ~ tempData:', tempData);
      switch (tempData.type) {
        case RKInteractionMode.SHARE_REMOTE_KEY:
          navigation.navigate('ManageSigners', {
            receivedExternalSigner: {
              timeLeft: calculateTimeLeft(createdAt),
              data: tempData,
            },
          });
          break;

        case RKInteractionMode.SHARE_PSBT:
          const { sendConfirmationRouteParams, signingDetails, tnxDetails, type } = tempData;
          if (signingDetails?.serializedPSBTEnvelop) {
            try {
              try {
                const signer = signers.find((s) => signingDetails.signer == s.masterFingerprint);
                if (!signer) throw { message: 'Signer not found' };
                switch (signer.type) {
                  case SignerType.SEED_WORDS:
                  case SignerType.BITBOX02:
                  case SignerType.LEDGER:
                  case SignerType.TREZOR:
                  case SignerType.COLDCARD:
                  case SignerType.PASSPORT:
                  case SignerType.SPECTER:
                  case SignerType.TAPSIGNER:
                  case SignerType.JADE:
                  case SignerType.MY_KEEPER:
                    navigation.navigate('SendConfirmation', {
                      ...sendConfirmationRouteParams,
                      tnxDetails,
                      signingDetails: { ...signingDetails, signer },
                      timeLeft: calculateTimeLeft(createdAt),
                      isRemoteFlow: true,
                    });
                    break;
                  default:
                    console.log('Signer Type Unknown', signer.type); // TODO: remove this
                    break;
                }
              } catch (e) {
                showToast(e.message);
              }
            } catch (e) {
              console.log('🚀 ~ handleRemoteKeyDeepLink ~ e:', e);
              showToast('Please scan a valid PSBT');
            }
          } else {
            showToast('Invalid deeplink');
          }
          break;

        case RKInteractionMode.SHARE_SIGNED_PSBT:
          try {
            Psbt.fromBase64(tempData?.psbt); // will throw if not a psbt
            if (!tempData.isMultisig) {
              const signer = signers.find(
                (s) => tempData.vaultKey.masterFingerprint == s.masterFingerprint
              );
              if (signer.type === SignerType.KEYSTONE) {
                dispatch(updatePSBTEnvelops({ xfp: tempData.vaultKey.xfp, txHex: tempData.psbt }));
              } else {
                dispatch(
                  updatePSBTEnvelops({
                    xfp: tempData.vaultKey.xfp,
                    signedSerializedPSBT: tempData.psbt,
                  })
                );
              }
            } else {
              dispatch(
                updatePSBTEnvelops({
                  signedSerializedPSBT: tempData?.psbt,
                  xfp: tempData.vaultKey.xfp,
                })
              );
              console.log('Vault ID is :', tempData.vaultId);
              dispatch(
                updateKeyDetails(tempData.vaultKey, 'registered', {
                  registered: true,
                  vaultId: tempData.vaultId,
                })
              );
            }
          } catch (err) {
            console.log('🚀 ~ handleRemoteKeyDeepLink ~ err:', err);
          }

          break;

        default:
          break;
      }
    }
  };

  const toggleSentryReports = async () => {
    if (inProgress) {
      return;
    }
    if (enableAnalyticsLogin) {
      await start(() => Sentry.init(sentryConfig));
    } else {
      await start(() => Sentry.init({ ...sentryConfig, enabled: false }));
    }
    dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
      enableAnalytics: enableAnalyticsLogin,
    });
  };

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
        } else if (initialUrl.includes('shareKey/')) {
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
