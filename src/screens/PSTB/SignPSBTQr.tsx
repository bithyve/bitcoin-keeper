import { ActivityIndicator, Clipboard, TouchableOpacity, StyleSheet } from 'react-native';
import { Box, Text, View, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import QRCode from 'react-native-qrcode-svg';
// components, hooks
import useToastMessage from 'src/hooks/useToastMessage';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Note from 'src/components/Note/Note';
// asserts
import TickIcon from 'src/assets/images/icon_tick.svg';
import CopyIcon from 'src/assets/images/svgs/icon_copy.svg';

const SignPSBTQr = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [pstbKey] = useState('lk2j3429-85213-5134=50t-93428562');

  return (
    <View style={styles.Container} background={`${colorMode}.ReceiveBackground`}>
      <StatusBarComponent padding={50} />
      <Box style={{
        width: '90%'
      }}>
        <HeaderTitle
          title={'Sign PSBT'}
          subtitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
          onPressHandler={() => navigation.goBack()}
          headerTitleColor={`${colorMode}.headerText`}
          paddingTop={hp(15)}
          paddingLeft={wp(10)}
        />
      </Box>
      <Box style={styles.contentContainer}>
        {pstbKey === '' ? (
          <Box style={styles.loader}>
            <ActivityIndicator animating={true} size="small" />
          </Box>
        ) : (
          <Box style={styles.QrContent}>
            <QRCode
              value={pstbKey}
              logoBackgroundColor="transparent"
              size={hp(200)}
            />
            <Box
              background={`${colorMode}.QrCode`}
              style={styles.qrTextContainer}
            >
              <Text
                color={`${colorMode}.recieverAddress`}
                noOfLines={1}
                style={styles.qrText}
              >
                Sign Transaction
              </Text>
            </Box>
            <Box style={styles.keyWrapper}>
              <Box
                backgroundColor={`${colorMode}.textInputBackground`}
                style={styles.keyContainer}
              >
                <Text style={styles.keyText} noOfLines={1} >
                  {pstbKey}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.4}
                  onPress={() => {
                    Clipboard.setString(pstbKey);
                    showToast('Address Copied Successfully', <TickIcon />);
                  }}
                >
                  <Box
                    backgroundColor={`${colorMode}.copyBackground`}
                    style={styles.copyIcon}
                  >
                    <CopyIcon />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Box style={styles.Note}>
        <Note
          title={'Note'}
          subtitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,'}
          subtitleColor={'GreyText'}
        />
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.20,
  },
  textBox: {
    width: '80%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
  Note: {
    marginBottom: hp(30),
    position: 'absolute',
    bottom: hp(20),
    marginHorizontal: 26,
    width: '90%'
  },
  copyIcon: {
    padding: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  },
  keyText: {
    width: '80%',
    marginLeft: 4,
    letterSpacing: 1.69
  },
  keyContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 20
  },
  keyWrapper: {
    alignItems: 'center',
    marginTop: hp(30),
    width: wp(320)
  },
  QrContent: {
    alignItems: 'center',
    width: hp(200),
    marginTop: hp(30),
  },
  qrText: {
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1.08,
    width: '100%'
  },
  qrTextContainer: {
    height: 20,
    width: '100%',
    justifyContent: 'center'
  },
  contentContainer: {
    marginTop: hp(50),
    alignItems: 'center',
    alignSelf: 'center',
    width: wp(250)
  },
  loader: {
    height: hp(250),
    justifyContent: 'center'
  }
});
export default SignPSBTQr;
