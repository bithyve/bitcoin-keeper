import { ActivityIndicator, StyleSheet } from 'react-native';
import { Box, useColorMode, View } from 'native-base';
import React from 'react';
import { hp, wp } from 'src/constants/responsive';
import Note from 'src/components/Note/Note';

import { authenticator } from 'otplib';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperQRCode from 'src/components/KeeperQRCode';
import WalletCopiableData from 'src/components/WalletCopiableData';
import WalletHeader from 'src/components/WalletHeader';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';

function SetupAdditionalServerKey({ route }: { route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();

  const { validationKey, label } = route.params;

  return (
    <ScreenWrapper>
      <View style={styles.Container}>
        <Box>
          <WalletHeader
            title="Set up Server Key 2FA"
            subTitle="Share this code securely with the intended user to set up in their authenticator app. The server will require these 2FA codes for authorized actions."
            subtitleColor={`${colorMode}.GreyText`}
          />
        </Box>
        <Box>
          {validationKey === '' ? (
            <Box height={hp(200)} justifyContent="center">
              <ActivityIndicator animating size="small" />
            </Box>
          ) : (
            <Box
              style={styles.qrContainer}
              backgroundColor={
                isDarkMode ? `${colorMode}.modalWhiteBackground` : `${colorMode}.ChampagneBliss`
              }
            >
              <Box alignItems="center" alignSelf="center" width={wp(250)}>
                <KeeperQRCode
                  qrData={authenticator.keyuri(
                    'bitcoinkeeper.app',
                    `Bitcoin Keeper - ${label || 'Secondary Auth'} `,
                    validationKey
                  )}
                  logoBackgroundColor="transparent"
                  size={wp(200)}
                  showLogo
                />
              </Box>
              <Box>
                <WalletCopiableData data={validationKey} dataType="2fa" width="95%" />
              </Box>
            </Box>
          )}
        </Box>

        <Box style={styles.bottomNoteContainer}>
          <Box marginBottom={hp(30)}>
            <Note
              title="Note"
              subtitle="Important: Anyone with access to this code can perform permitted actions on the Server Key."
              subtitleColor="GreyText"
            />
          </Box>

          <Buttons
            primaryCallback={() => navigation.goBack()}
            primaryText="Finish Setup"
            fullWidth
          />
        </Box>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  otpContainer: {
    width: '100%',
  },
  bottomNoteContainer: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    marginBottom: hp(10),
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(15),
    paddingHorizontal: wp(20),
    paddingTop: hp(30),
    paddingBottom: hp(10),
    marginTop: hp(15),
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default SetupAdditionalServerKey;
