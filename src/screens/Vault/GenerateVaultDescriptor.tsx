import React from 'react';
import { Box, Text, useColorMode } from 'native-base';
import { Share, StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, windowWidth } from 'src/constants/responsive';
import IconShare from 'src/assets/images/icon_share.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Note from 'src/components/Note/Note';
import Colors from 'src/theme/Colors';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useRoute } from '@react-navigation/native';
import { captureError } from 'src/services/sentry';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';

function GenerateVaultDescriptor() {
  const route = useRoute();
  const { descriptorString } = route.params as { descriptorString: string };
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
        title="Vault Configuration"
        subtitle="A descriptor contains sensitive information. Please use with caution"
      />
      <Box style={styles.container}>
        <TouchableOpacity onPress={onShare}>
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <Text noOfLines={4}>{descriptorString}</Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn_shareVaultConfiguration"
          onPress={onShare}
          style={styles.buttonContainer}
        >
          <Box>
            <IconShare />
          </Box>
          <Text color={`${colorMode}.primaryText`} style={styles.shareText}>
            Share
          </Text>
        </TouchableOpacity>
        <Box style={{ paddingBottom: '10%' }}>
          <ShareWithNfc data={descriptorString} />
        </Box>
      </Box>
      <Box style={styles.noteContainer}>
        <Note
          subtitle="Save the file with .bsms extension to import it in other cordinating apps"
          subtitleColor="GreyText"
        />
      </Box>
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
    borderRadius: 10,
    flexDirection: 'row',
    height: 150,
    width: windowWidth * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  buttonContainer: {
    borderColor: Colors.Seashell,
    marginVertical: hp(15),
    borderTopWidth: 0.5,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 12,
    letterSpacing: 0.84,
    marginVertical: 2.5,
    paddingLeft: 3,
  },
  noteContainer: {
    marginHorizontal: 10,
  },
});
