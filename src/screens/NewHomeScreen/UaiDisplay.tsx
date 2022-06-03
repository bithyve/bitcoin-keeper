import React, { useState, useEffect } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from 'native-base';
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
  const [uaiExtraDetails, setUaiExtraDetails] = useState({});
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();

  const getUaiTypeDefinations = (type) => {
    switch (type) {
      case uaiType.RELEASE_MESSAGE:
        return {
          btnText: 'Upgrade',
        };
      case uaiType.ALERT:
        return {
          btnText: 'Confirm',
        };
      case uaiType.WARNING:
        return {
          btnText: 'Ok',
        };
      case uaiType.REMINDER: {
        return {
          btnText: 'Take Action',
        };
      }
      default:
        return {
          btnText: 'Ok',
        };
    }
  };

  useEffect(() => {
    setUaiExtraDetails(getUaiTypeDefinations(uai?.uaiType));
  }, [uai]);

  useEffect(() => {
    console.log('update', uaiStack);
    setUai(uaiStack[0]);
  }, [uaiStack]);

  const presshandler = () => {
    console.log('uai', uai);
    let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); //Need to get a better way
    updatedUai = { ...updatedUai, isActioned: true };
    console.log('updatedUai', updatedUai);
    dispatch(updateUaiStack(updatedUai));
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
      <TouchableOpacity style={styles.button} onPress={presshandler}>
        <Text
          color={'light.textDark'}
          fontSize={RFValue(11)}
          fontFamily={'body'}
          fontWeight={'300'}
          letterSpacing={0.88}
        >
          {uaiExtraDetails?.btnText}
        </Text>
      </TouchableOpacity>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Contact Us</Modal.Header>
          <Modal.Body>
            <Text>asdf</Text>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
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
