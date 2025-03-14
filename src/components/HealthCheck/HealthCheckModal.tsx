import { Box, Modal, Input, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Close from 'src/assets/images/modal_close.svg';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from 'src/store/hooks';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function HealthCheckModal(props) {
  const { colorMode } = useColorMode();
  const {
    visible,
    closeHealthCheck,
    title = 'Title',
    subTitle = null,
    placeHolderName = '',
    SignerName = 'SignerName',
    SignerIcon = '',
    modalBackground = [`${colorMode}.secondaryBackground`, `${colorMode}.secondaryBackground`],
    buttonBackground = [`${colorMode}.gradientStart`, `${colorMode}.gradientEnd`],
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
        <Box style={styles.container} backgroundColor={`${colorMode}.modalWhiteBackground`}>
          <TouchableOpacity style={styles.close} onPress={closeHealthCheck}>
            <Close />
          </TouchableOpacity>
          <Modal.Header
            alignSelf="flex-start"
            borderBottomWidth={0}
            backgroundColor="transparent"
            width="90%"
          >
            <Text style={styles.title} color={textColor} paddingBottom={1}>
              {title}
            </Text>
            <Text style={styles.subTitle} light color={textColor}>
              {subTitle}
            </Text>
          </Modal.Header>
          <Box style={{ flexDirection: 'row', marginLeft: 10, alignSelf: 'flex-start' }}>
            <Box>{SignerIcon}</Box>
            <Box style={{ marginTop: 8, flexDirection: 'column' }}>
              <Text color={`${colorMode}.primaryText`} fontSize={14}>
                {SignerName}
              </Text>
            </Box>
          </Box>
          <Input
            placeholderTextColor="grey"
            backgroundColor={`${colorMode}.primaryBackground`}
            placeholder={placeHolderName}
            borderWidth={0}
            borderRadius={5}
            width="90%"
            marginY={2}
            height="10"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
            }}
            _input={
              colorMode === 'dark' && {
                selectionColor: Colors.bodyText,
                cursorColor: Colors.bodyText,
              }
            }
          />
          <Box alignSelf="flex-end" flexDirection="row" backgroundColor="transparent">
            <TouchableOpacity onPress={onPress} testID={`btn_${buttonText}`}>
              <Box style={styles.cta} backgroundColor={`${colorMode}.greenButtonBackground`}>
                <Text fontSize={13} bold letterSpacing={1} color={buttonTextColor}>
                  {buttonText}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </Modal.Content>
    </Modal>
  );
}

export default HealthCheckModal;

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
