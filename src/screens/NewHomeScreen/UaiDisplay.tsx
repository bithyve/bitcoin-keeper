import React, { useState, useEffect } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button, Text } from 'native-base';
import { TouchableOpacity, View } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { ScaledSheet } from 'react-native-size-matters';
import { useDispatch } from 'react-redux';
import { updateUaiStack } from 'src/store/actions/uai';
import { Modal } from 'native-base';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';

const UaiDisplay = ({ uaiStack }) => {
  const [uai, setUai] = useState({});
  const [uaiConfig, setUaiConfig] = useState({});
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();

  const getUaiTypeDefinations = (type) => {
    switch (type) {
      case uaiType.RELEASE_MESSAGE:
        return {
          btnText: 'Upgrade',
          modalDetails: {
            heading: 'Update application',
            btnText: 'Upgrade',
          },
          cta: () => {
            uaiSetActionFalse();
            setShowModal(false);
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
    console.log('update', uaiStack);
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

  return (
    <>
      <Text
        color={'light.textLight'}
        fontSize={RFValue(12)}
        fontFamily={'body'}
        fontWeight={'100'}
        marginY={'2'}
      >
        {uai?.title}
      </Text>
      <TouchableOpacity style={styles.button} onPress={pressHandler}>
        <Text
          color={'light.textDark'}
          fontSize={RFValue(11)}
          fontFamily={'body'}
          fontWeight={'300'}
          letterSpacing={0.88}
        >
          {uaiConfig?.btnText}
        </Text>
      </TouchableOpacity>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>{uaiConfig?.modalDetails?.heading}</Modal.Header>
          {uai?.displayText ? (
            <Modal.Body>
              <Text>{uai?.displayText}</Text>
            </Modal.Body>
          ) : null}

          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  uaiConfig?.cta();
                }}
              >
                {uaiConfig?.modalDetails?.btnText}
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

const styles = ScaledSheet.create({
  button: {
    borderRadius: 10,
    marginTop: hp(1),
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAC48B',
  },
});

export default UaiDisplay;
