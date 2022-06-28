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
          btnText: 'Update',
          modalDetails: {
            heading: 'Update application',
            btnText: 'Update',
          },
          cta: () => {
            console.log('asdfasd');
            setShowModal(false);
            uaiSetActionFalse();
          },
        };
      case uaiType.ALERT:
        return {
          btnText: 'Details',
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
          btnText: 'Secure now',
          modalDetails: {
            heading: 'Trasfer to Vault',
            btnText: 'Transfer details',
          },
          cta: () => {
            navigtaion.navigate('SendConfirmation', { isVaultTransfer: true, uaiSetActionFalse });
            setShowModal(false);
          },
        };
      // case uaiType.WARNING:
      //   return {
      //     btnText: 'Ok',
      //     cta: () => {
      //       setShowModal(true);
      //     },
      //     primaryCallback: () => {
      //       uaiSetActionFalse();
      //       setShowModal(false);
      //     },
      //   };
      // case uaiType.REMINDER: {
      //   return {
      //     btnText: 'Take Action',
      //     cta: () => {
      //       setShowModal(true);
      //     },
      //   };
      // }
      // default:
      //   return {
      //     btnText: 'Ok',
      //     cta: () => {
      //       setShowModal(true);
      //     },
      //   };
    }
  };

  useEffect(() => {
    setUaiConfig(getUaiTypeDefinations(uai?.uaiType));
  }, [uai]);

  useEffect(() => {
    setUai(uaiStack[0]);
  }, [uaiStack]);

  const uaiSetActionFalse = () => {
    console.log('uai', uai);
    let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); //Need to get a better way
    updatedUai = { ...updatedUai, isActioned: true };
    dispatch(updateUaiStack(updatedUai));
  };

  const pressHandler = () => {
    if (uai?.isDisplay) {
      setShowModal(true);
    } else {
      uaiSetActionFalse();
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
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={uaiConfig?.modalDetails?.btnText}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={uaiConfig?.cta}
          textColor={'#000'}
          Content={() => <Text>{uai?.displayText}</Text>}
        />
      </>
    );
  } else return null;
};

export default UaiDisplay;
