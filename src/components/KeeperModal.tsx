import { Modal, Text } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import React from 'react';

const KeeperModal = (props) => {
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
    textColor = '#000',
    Content = () => <></>,
  } = props;
  return (
    <Modal isOpen={visible} onClose={close} avoidKeyboard size="xl">
      <Modal.Content borderRadius={10}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={modalBackground}
          style={styles.container}
        >
          <Modal.CloseButton style={styles.close} size={6} />
          <Modal.Header alignSelf={'flex-start'} borderBottomWidth={0}>
            <Text
              style={styles.title}
              fontFamily={'body'}
              fontWeight={'200'}
              color={textColor}
              paddingBottom={1}
            >
              {title}
            </Text>
            <Text style={styles.subTitle} fontFamily={'body'} fontWeight={'100'} color={textColor}>
              {subTitle}
            </Text>
          </Modal.Header>
          <Modal.Body>{<Content />}</Modal.Body>
          <Modal.Footer alignSelf={'flex-end'} bg={'transparent'}>
            <TouchableOpacity onPress={buttonCallback}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={buttonBackground}
                style={styles.cta}
              >
                <Text
                  fontSize={13}
                  fontFamily={'body'}
                  fontWeight={'300'}
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
};

export default KeeperModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    padding: '4%',
    paddingVertical: '5%',
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
});
