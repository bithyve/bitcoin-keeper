import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { uaiActioned } from 'src/store/sagaActions/uai';
import KeeperModal from 'src/components/KeeperModal';
import { StyleSheet } from 'react-native';
import { TransferType } from 'src/common/data/enums/TransferType';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import UAIView from '../NewHomeScreen/components/HeaderDetails/components/UAIView';

function UaiDisplay({ uaiStack }) {
  const [uai, setUai] = useState<UAI | {}>({});
  const [uaiConfig, setUaiConfig] = useState({});
  const [showModal, setShowModal] = useState(false);
  const { activeVault } = useVault();
  const { showToast } = useToastMessage();

  const dispatch = useDispatch();
  const navigtaion = useNavigation();

  const getUaiTypeDefinations = (type) => {
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
          cta: () => {
            navigtaion.navigate('SendConfirmation', {
              uaiSetActionFalse,
              walletId: uai?.entityId,
              transferType: TransferType.WALLET_TO_VAULT,
            });
            setShowModal(false);
          },
        };
      case uaiType.SECURE_VAULT:
        return {
          cta: () => {
            navigtaion.navigate('AddSigningDevice');
          },
        };
      case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
        return {
          cta: () => {
            navigtaion.navigate('VaultDetails');
          },
        };
      case uaiType.VAULT_MIGRATION:
        return {
          cta: () => {
            navigtaion.navigate('AddSigningDevice');
          },
        };
      case uaiType.DEFAULT:
        return {
          cta: () => {
            activeVault ? navigtaion.navigate('VaultDetails') : showToast('No vaults found', <ToastErrorIcon />);
          },
        };
      default:
        return {
          cta: () => {
            activeVault ? navigtaion.navigate('VaultDetails') : showToast('No vaults found', <ToastErrorIcon />);
          },
        };
    }
  };

  useEffect(() => {
    setUaiConfig(getUaiTypeDefinations(uai?.uaiType));
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
          title={uai?.title}
          primaryCallbackText="CONTINUE"
          secondaryCallbackText={uai?.uaiType !== uaiType.DEFAULT ? 'SKIP' : null}
          secondaryCallback={uaiSetActionFalse}
          primaryCallback={pressHandler}
        />
        <KeeperModal
          visible={showModal}
          close={() => setShowModal(false)}
          title={uaiConfig?.modalDetails?.heading}
          subTitle={uaiConfig?.modalDetails?.subTitle}
          buttonText={uaiConfig?.modalDetails?.btnText}
          buttonTextColor="light.white"
          buttonCallback={uaiConfig?.cta}
          Content={() => <Text color="light.greenText">{uai?.displayText}</Text>}
        />
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
