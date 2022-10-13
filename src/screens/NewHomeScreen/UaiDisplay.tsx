import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { Box, Text } from 'native-base';
import { NextIcon } from './HomeScreen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch } from 'react-redux';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { updateUaiStack } from 'src/store/sagaActions/uai';
import KeeperModal from 'src/components/KeeperModal';

const UaiDisplay = ({ uaiStack }) => {
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
            navigtaion.navigate('SendConfirmation', { isVaultTransfer: true, uaiSetActionFalse });
            setShowModal(false);
          },
        };
      case uaiType.SECURE_VAULT:
        return {
          cta: () => {
            navigtaion.navigate('HardwareSetup');
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
    let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); //Need to get a better way
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
        <Box
          backgroundColor={'light.AddSignerCard'}
          height={hp(60)}
          width={wp(259)}
          borderRadius={hp(20)}
          marginTop={hp(44)}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          paddingX={4}
        >
          <Text
            noOfLines={2}
            width={wp(170)}
            color={'light.white1'}
            letterSpacing={0.6}
            fontSize={RFValue(12)}
            fontWeight={200}
            lineHeight={14}
          >
            {uai?.title}
          </Text>
          <NextIcon pressHandler={pressHandler} />
        </Box>
        <KeeperModal
          visible={showModal}
          close={() => setShowModal(false)}
          title={uaiConfig?.modalDetails?.heading}
          subTitle={uaiConfig?.modalDetails?.subTitle}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={uaiConfig?.modalDetails?.btnText}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={uaiConfig?.cta}
          textColor={'#000'}
          Content={() => (
            <Text fontWeight={200} color={'#073B36'}>
              {uai?.displayText}
            </Text>
          )}
        />
      </>
    );
  } else return null;
};

export default UaiDisplay;
