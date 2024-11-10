import React, { useEffect, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import { uaiActioned } from 'src/store/sagaActions/uai';
import KeeperModal from 'src/components/KeeperModal';
import { Alert, StyleSheet } from 'react-native';
import { TransferType } from 'src/models/enums/TransferType';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import UAIView from '../../HomeScreen/components/HeaderDetails/components/UAIView';
import { useColorMode } from 'native-base';

const nonSkippableUAIs = [uaiType.DEFAULT, uaiType.SECURE_VAULT];

function UaiDisplay({ uaiStack, vaultId }) {
  const { colorMode } = useColorMode();
  const [uai, setUai] = useState<UAI | {}>({});
  const [uaiConfig, setUaiConfig] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalActionLoader, setmodalActionLoader] = useState(false);
  const { activeVault } = useVault({ vaultId });
  const { showToast } = useToastMessage();

  const dispatch = useDispatch();
  const navigtaion = useNavigation();

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
            heading: 'Trasfer to vault',
            subTitle:
              'Your Auto-transfer policy has triggered a transaction that needs your approval',
            btnText: ' Transfer Now',
          },
          cta: () => {
            activeVault
              ? navigtaion.navigate('SendConfirmation', {
                  uaiSetActionFalse,
                  walletId: uai?.entityId,
                  transferType: TransferType.WALLET_TO_VAULT,
                })
              : showToast('No vaults found', <ToastErrorIcon />);

            setShowModal(false);
          },
        };
      case uaiType.SECURE_VAULT:
        return {
          cta: () => {
            navigtaion.dispatch(
              CommonActions.navigate({ name: 'VaultSetup', merge: true, params: {} })
            );
          },
        };
      case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
        return {
          cta: () => {
            navigtaion.navigate('VaultDetails', { vaultId: activeVault.id });
          },
        };
      case uaiType.VAULT_MIGRATION:
        return {
          cta: () => {
            navigtaion.dispatch(
              CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
            );
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
          cta: () => {
            activeVault
              ? navigtaion.navigate('VaultDetails', { vaultId: activeVault.id })
              : showToast('No vaults found', <ToastErrorIcon />);
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
    setUaiConfig(getUaiTypeDefinations(uai?.uaiType, uai?.entityId));
  }, [uai]);

  useEffect(() => {
    setUai(uaiStack[0]);
  }, [uaiStack]);

  const uaiSetActionFalse = () => {
    dispatch(uaiActioned(uai.id));
  };

  const pressHandler = () => {
    if (uai?.isDisplay) {
      setShowModal(true);
    } else {
      uaiConfig?.cta();
    }
  };

  if (uaiStack.length > 0) {
    return (
      <>
        <UAIView
          title="Your Vault: Valinor"
          subTitle={uai?.title}
          primaryCallbackText="ADD NOW"
          secondaryCallbackText={!nonSkippableUAIs.includes(uai?.uaiType) && 'SKIP'}
          secondaryCallback={!nonSkippableUAIs.includes(uai?.uaiType) && uaiSetActionFalse}
          primaryCallback={pressHandler}
        />
        <KeeperModal
          visible={showModal}
          close={() => setShowModal(false)}
          title={uaiConfig?.modalDetails?.heading}
          subTitle={uaiConfig?.modalDetails?.subTitle}
          buttonText={uaiConfig?.modalDetails?.btnText}
          buttonTextColor={`${colorMode}.buttonText`}
          buttonCallback={() => uaiConfig?.cta(uai?.entityId)}
          Content={() => <Text color={`${colorMode}.greenText`}>{uai?.displayText}</Text>}
        />
        <ActivityIndicatorView visible={modalActionLoader} showLoader />
      </>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    height: hp(60),
    width: wp(259),
    borderRadius: hp(20),
    marginTop: hp(45),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  uaiTitle: {
    width: wp(170),
    letterSpacing: 0.6,
    fontSize: 12,
    lineHeight: 14,
  },
});

export default UaiDisplay;
