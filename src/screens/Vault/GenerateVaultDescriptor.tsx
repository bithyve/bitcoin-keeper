import React from 'react';
import { Box, Text, useColorMode } from 'native-base';
import { Share, StyleSheet } from 'react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import { windowWidth } from 'src/constants/responsive';
import IconShare from 'src/assets/images/icon_share.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Note from 'src/components/Note/Note';
import Colors from 'src/theme/Colors';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useRoute } from '@react-navigation/native';
import { captureError } from 'src/core/services/sentry';
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
    <ScreenWrapper>
      <HeaderTitle
        title="Generate Vault Descriptor"
        subtitle="A descriptor contains sensitive information. Please use with caution"
      />
      <Box style={styles.container}>
        <TouchableOpacity onPress={onShare}>
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <Text noOfLines={4}>{descriptorString}</Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.buttonContainer}>
          <Box>
            <IconShare />
          </Box>
          <Text color={`${colorMode}.primaryText`} style={styles.shareText}>
            Share
          </Text>
        </TouchableOpacity>
      </Box>
      <Box style={styles.bottom}>
        <Box style={{ paddingBottom: '10%' }}>
          <ShareWithNfc data={descriptorString} />
        </Box>
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
    marginTop: '10%',
  },
  inputWrapper: {
    borderRadius: 10,
    flexDirection: 'row',
    height: 150,
    width: windowWidth * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  bottom: {
    alignItems: 'flex-end',
    marginVertical: '20%',
    margin: '5%',
  },
  buttonContainer: {
    borderColor: Colors.Seashell,
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 0.5,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 12,
    letterSpacing: 0.84,
    marginVertical: 2.5,
    paddingLeft: 3,
  },
});
