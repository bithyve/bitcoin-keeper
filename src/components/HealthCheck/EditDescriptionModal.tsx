import React from 'react';
import { Box, Modal, Text, Input } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Close from 'src/assets/icons/modal_close.svg';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from 'src/store/hooks';
import moment from 'moment';

function EditDescriptionModal(props) {
  const {
    visible,
    closeHealthCheck,
    title = 'Title',
    subTitle = null,
    placeHolderName = '',
    SignerName = 'SignerName',
    SignerDate = '',
    SignerIcon = '',
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = 'Button text',
    buttonTextColor = 'white',
    buttonCallback = props.closeHealthCheck || null,
    textColor = '#000',
    onPress,
    inputText,
    setInputText,
  } = props;
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();

  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });

  return (
    <Modal
      isOpen={visible}
      onClose={closeHealthCheck}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      marginTop="20%"
    >
      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={modalBackground}
          style={styles.container}
        >
          <TouchableOpacity style={styles.close} onPress={closeHealthCheck}>
            <Close />
          </TouchableOpacity>
          <Modal.Header
            alignSelf="flex-start"
            borderBottomWidth={0}
            backgroundColor="transparent"
            width="90%"
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
          <Box style={{ flexDirection: 'row', marginLeft: 10, alignSelf: 'flex-start' }}>
            <Box>{SignerIcon}</Box>
            <Box style={{ marginTop: 8, flexDirection: 'column' }}>
              <Text color="light.lightBlack" fontSize={14}>
                {SignerName}
              </Text>
              <Box flexDirection="row">
                <Text fontSize={12} color="light.greyText">
                  Added on{' '}
                </Text>
                <Text fontSize={12} color="light.greyText">
                  {moment(SignerDate).format('DD MMM YYYY')}
                </Text>
              </Box>
            </Box>
          </Box>
          <Input
            placeholderTextColor="grey"
            backgroundColor="light.lightYellow"
            placeholder={placeHolderName}
            borderWidth={0}
            borderRadius={5}
            w="90%"
            marginY={2}
            height="10"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
            }}
          />
          <Box alignSelf="flex-end" flexDirection="row" bg="transparent">
            <TouchableOpacity onPress={onPress}>
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
          </Box>
        </LinearGradient>
      </Modal.Content>
    </Modal>
  );
}

export default EditDescriptionModal;

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
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  ctabutton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  close: {
    alignSelf: 'flex-end',
  },
});
