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

const UaiDisplay = ({ uaiStack }) => {
  const [uai, setUai] = useState({});
  const [updateUai, setUpdateUai] = useState({});
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log('update', uaiStack);
    setUai(uaiStack[0]);
  }, [uaiStack]);

  //   const presshandler = () => {
  //     dispatch(
  //       updateUaiStack({
  //         displayCount: 0,
  //         displayText: null,
  //         id: '53d6cf0c-06f0-4358-a3d3-5850e883ee3f',
  //         isActioned: true,
  //         isDisplay: false,
  //         notificationId: null,
  //         prirority: 10,
  //         timeStamp: new Date(),
  //         title: 'Cloud Back',
  //         uaiType: 'DISPLAY_MESSAGE',
  //       })
  //     );
  //   };

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
      <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
        <Text
          color={'light.textDark'}
          fontSize={RFValue(11)}
          fontFamily={'body'}
          fontWeight={'300'}
          letterSpacing={0.88}
        >
          Upgrade
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
