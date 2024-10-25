import React from 'react';
import { Box, ScrollView, Text, useColorMode } from 'native-base';
import { Share, StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import IconShare from 'src/assets/images/icon_share.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useRoute } from '@react-navigation/native';
import { captureError } from 'src/services/sentry';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import KeeperQRCode from 'src/components/KeeperQRCode';
import Note from 'src/components/Note/Note';

function GenerateVaultDescriptor() {
  const route = useRoute();
  const { descriptorString, vaultId } = route.params as {
    descriptorString: string;
    vaultId: string;
  };
  const { colorMode } = useColorMode();
  const onShare = async () => {
    try {
      await Share.share({ message: descriptorString });
    } catch (error) {
      captureError(error);
    }
  };
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Vault Configuration File"
        subtitle="The vault configuration file is used to restore the vault on other devices."
      />
      <ScrollView>
        <Box style={styles.container}>
          <KeeperQRCode size={windowWidth * 0.7} ecl="L" qrData={descriptorString} />
          <TouchableOpacity onPress={onShare}>
            <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Box style={styles.textWrapper}>
                <Text noOfLines={2}>{descriptorString}</Text>
              </Box>
              <IconShare style={styles.iconShare} />
            </Box>
          </TouchableOpacity>
          <Box style={{ paddingBottom: '10%' }}>
            <ShareWithNfc data={descriptorString} fileName={`wallet-${vaultId}-backup.bsms`} />
          </Box>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default GenerateVaultDescriptor;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    marginTop: hp(20),
  },
  inputWrapper: {
    borderRadius: 12,
    flexDirection: 'row',
    height: 75,
    width: '93%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp(30),
    marginBottom: hp(10),
    paddingHorizontal: wp(15),
  },
  textWrapper: {
    flex: -1,
  },
  iconShare: {
    marginLeft: wp(10),
  },
});
