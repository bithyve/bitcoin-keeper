import { InteractionManager, Linking } from 'react-native';
import React, { useEffect } from 'react';
import { SignerStorage, SignerType, WalletType, XpubTypes } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { resetElectrumNotConnectedErr } from 'src/store/reducers/login';
import { urlParamsToObj } from 'src/core/utils';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useDispatch } from 'react-redux';
import useSigners from 'src/hooks/useSigners';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { generateSignerFromMetaData } from 'src/hardware';
import { addSigningDevice } from 'src/store/sagaActions/vaults';

function InititalAppController({ navigation, electrumErrorVisible, setElectrumErrorVisible }) {
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  function handleDeepLinkEvent({ url }) {
    if (url) {
      if (url.includes('backup')) {
        const splits = url.split('backup/');
        const decoded = Buffer.from(splits[1], 'base64').toString();
        const params = urlParamsToObj(decoded);
        if (params.seed) {
          navigation.navigate('EnterWalletDetail', {
            seed: params.seed,
            name: `${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
              } `,
            path: params.path,
            appId: params.appId,
            description: `Imported from ${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
              } `,
            type: WalletType.IMPORTED,
          });
        } else {
          showToast('Invalid deeplink');
        }
      }
    }
  }

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
              name: `${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
                } `,
              path: params.path,
              appId: params.appId,
              purpose: params.purpose,
              description: `Imported from ${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
                } `,
              type: WalletType.IMPORTED,
            });
          } else {
            showToast('Invalid deeplink');
          }
        } else if (initialUrl.includes('create/')) {
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
        showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
        if (electrumErrorVisible) setElectrumErrorVisible(false);
      } else if (electrumClientConnectionStatus.failed) {
        showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
        setElectrumErrorVisible(true);
      }
    })
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (electrumClientConnectionStatus.setElectrumNotConnectedErr) {
        showToast(`${electrumClientConnectionStatus.setElectrumNotConnectedErr}`, <ToastErrorIcon />);
        dispatch(resetElectrumNotConnectedErr());
      }
    })
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
    })
  }, []);

  return null;
}

export default InititalAppController;
