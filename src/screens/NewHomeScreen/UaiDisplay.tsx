import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { Text, Pressable } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch } from 'react-redux';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { updateUaiStack } from 'src/store/sagaActions/uai';
import KeeperModal from 'src/components/KeeperModal';
import { NextIcon } from './HomeScreen';
import { StyleSheet } from 'react-native';
import { TransferType } from 'src/common/data/enums/TransferType';

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
      case uaiType.ALERT:
        return {
          modalDetails: {
            heading: 'Details',
            btnText: 'Okay',
          },
          cta: () => {
            uaiSetActionFalse();
            setShowModal(false);
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
      case uaiType.DEFAULT:
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
    let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); // Need to get a better way
    updatedUai = { ...updatedUai, isActioned: true };
    dispatch(updateUaiStack(updatedUai));
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
        <Pressable
          backgroundColor={'light.AddSignerCard'}
          onPress={pressHandler}
          style={styles.container}
        >
          <Text noOfLines={2} color="light.white1" style={styles.uaiTitle}>
            {uai?.title}
          </Text>
          <NextIcon pressHandler={pressHandler} />
        </Pressable>
        <KeeperModal
          visible={showModal}
          close={() => setShowModal(false)}
          title={uaiConfig?.modalDetails?.heading}
          subTitle={uaiConfig?.modalDetails?.subTitle}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={uaiConfig?.modalDetails?.btnText}
          buttonTextColor="#FAFAFA"
          buttonCallback={uaiConfig?.cta}
          textColor="#000"
          Content={() => <Text color="#073B36">{uai?.displayText}</Text>}
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
    fontSize: RFValue(12),
    lineHeight: 14,
  },
});

export default UaiDisplay;
