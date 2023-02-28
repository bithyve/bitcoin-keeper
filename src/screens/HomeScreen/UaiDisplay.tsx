import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { Pressable } from 'native-base';
import { useDispatch } from 'react-redux';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { uaiActioned } from 'src/store/sagaActions/uai';
import KeeperModal from 'src/components/KeeperModal';
import { StyleSheet } from 'react-native';
import { TransferType } from 'src/common/data/enums/TransferType';
import { NextIcon } from './HomeScreen';

function UaiDisplay({ uaiStack }) {
  const [uai, setUai] = useState({});
  const [uaiConfig, setUaiConfig] = useState({});
  const [showModal, setShowModal] = useState(false);

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
            navigtaion.navigate('VaultDetails');
          },
        };
      default:
        return {
          cta: () => {
            navigtaion.navigate('VaultDetails');
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
        <Pressable backgroundColor="light.Glass" onPress={pressHandler} style={styles.container} testID={`btn_${uai?.uaiType}`}>
          <Text numberOfLines={2} color="light.white" style={styles.uaiTitle}>
            {uai?.title}
          </Text>
          <NextIcon pressHandler={pressHandler} />
        </Pressable>
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
