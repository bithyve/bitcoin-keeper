import { Image, Link, Modal, Text, View } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import tapsignerLogo from 'src/assets/images/tapsignerLogo.png';

function ApproveTransactionModal(props) {
  const {
    visible,
    close,
    title = 'Title',
    subTitle = 'Subtitle',
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = 'Button text',
    buttonTextColor = 'white',
    buttonCallback = props.close || null,
    textColor = '#4F5955',
    cancelButtonColor = '#073E39',
    // Content = () => <></>,
  } = props;
  return (
    <Modal isOpen={visible} onClose={close} avoidKeyboard size="md">
      <Modal.Content style={styles.modal}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={modalBackground}
          style={styles.container}
        >
          <Modal.CloseButton style={styles.close} size={8} />
          <Modal.Header
            alignSelf="flex-start"
            borderBottomWidth={0}
            backgroundColor="transparent"
          >
            <Text
              style={styles.title}
              fontFamily="body"
              fontWeight="200"
              color={textColor}
              paddingBottom={1}
            >
              {title}
            </Text>
            <Text style={styles.subTitle} fontFamily="body" fontWeight="100" color={textColor}>
              {subTitle}
            </Text>
          </Modal.Header>
          <Modal.Body>
            <View>
              <Image style={styles.dummy} source={tapsignerLogo} />
              <Text color={textColor} fontSize={13} fontFamily="body" fontWeight="100" p={2}>
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
              </Text>
              <Link>
                <Text color="#00836A" fontSize={13} fontFamily="body" fontWeight="100" p={2}>
                  Learn More
                </Text>
              </Link>
            </View>
          </Modal.Body>
          <Modal.Footer alignSelf="flex-end" bg="transparent">
            <TouchableOpacity onPress={close}>
              <Text
                mr="10%"
                mt="13%"
                fontSize={13}
                fontFamily="body"
                fontWeight="300"
                letterSpacing={1}
                color={cancelButtonColor}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={buttonCallback}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={buttonBackground}
                style={styles.cta}
              >
                <Text
                  fontSize={13}
                  fontFamily="body"
                  fontWeight="300"
                  letterSpacing={1}
                  color={buttonTextColor}
                >
                  {buttonText}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Modal.Footer>
        </LinearGradient>
      </Modal.Content>
    </Modal>
  );
}

export default ApproveTransactionModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    padding: '4%',
    paddingVertical: '5%',
  },
  modal: {
    borderRadius: 10,
    width: '100%',
    marginTop: '60%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  close: {
    backgroundColor: '#FAC48B',
    borderRadius: 100,
  },
  dummy: {
    height: 200,
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#092C27',
  },
});
