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
import { getCosignerDetails, signCosignerPSBT } from 'src/services/wallets/factories/WalletFactory';
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
import config from 'src/utils/service-utilities/config';

import { Psbt } from 'bitcoinjs-lib';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';

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
    console.log('handleDeepLinkEvent', url);
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
    console.log('🚀 ~ handleRemoteKeyDeepLink ~ initialUrl:', initialUrl);
    const externalKeyId = initialUrl.split('shareKey/')[1];
    if (externalKeyId) {
      const { createdAt, data: response } = await Relay.getRemoteKey(externalKeyId);
      const { iv, encryptedData } = JSON.parse(response);
      const tempData = createDecipheriv({ encryptedData, iv }, config.REMOTE_KEY_PASSWORD);
      switch (tempData.type) {
        case RKInteractionMode.SHARE_REMOTE_KEY:
          console.log('🚀 ~ handleRemoteKeyDeepLink ~ tempData:', tempData);
          navigation.navigate('ManageSigners', {
            receivedExternalSigner: {
              timeLeft: calculateTimeLeft(createdAt),
              data: tempData,
            },
          });
          break;

        case RKInteractionMode.SHARE_PSBT:
          // # next step: sign the psbt and send.
          if (tempData?.psbt) {
            try {
              let signedSerializedPSBT;
              try {
                const activeSigner = signers.find(
                  (s) => s.masterFingerprint == tempData.signer.masterFingerprint
                );
                if (!activeSigner) throw { message: 'Signer not found' };
                const key = activeSigner.signerXpubs[XpubTypes.P2WSH][0];
                signedSerializedPSBT = signCosignerPSBT(key.xpriv, tempData.psbt);
                if (signedSerializedPSBT) {
                  navigation.navigate('RemoteSharing', {
                    isPSBTSharing: true,
                    signerData: {},
                    signer: activeSigner,
                    psbt: signedSerializedPSBT,
                    mode: RKInteractionMode.SHARE_SIGNED_PSBT,
                    vaultKey: tempData.vaultKey,
                    vaultId: tempData.vaultId,
                  });
                }
              } catch (e) {
                showToast(e.message);
                // TODO: error handling
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
            console.log('valid PSBT');
            if (false) {
              // TODO: handle single sig
              // if (isSingleSig) {
              // if (signer.type === SignerType.SEEDSIGNER) {
              //   const { signedPsbt } = updateInputsForSeedSigner({
              //     serializedPSBT,
              //     signedSerializedPSBT,
              //   });
              //   dispatch(
              //     updatePSBTEnvelops({ signedSerializedPSBT: signedPsbt, xfp: vaultKey.xfp })
              //   );
              // } else if (signer.type === SignerType.KEYSTONE) {
              //   const tx = getTxHexFromKeystonePSBT(serializedPSBT, signedSerializedPSBT);
              //   dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, txHex: tx.toHex() }));
              // } else {
              //   dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, signedSerializedPSBT }));
              // }
            } else {
              dispatch(
                updatePSBTEnvelops({
                  signedSerializedPSBT: tempData.psbt,
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
