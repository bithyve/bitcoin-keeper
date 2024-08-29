import React from 'react';
import { StyleSheet, Share } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, ScrollView, useColorMode, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import Text from 'src/components/KeeperText';
import useSignerMap from 'src/hooks/useSignerMap';
import RemoteShareIllustration from 'src/assets/images/remote-share-illustration.svg';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import MessagePreview from 'src/components/MessagePreview';
import { useNavigation } from '@react-navigation/native';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'RemoteSharing'>;

function RemoteSharing({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  const { signer: signerFromParam, isPSBTSharing = false } = route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[signerFromParam?.masterFingerprint];

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Hey, I’m sharing a bitcoin key with you. Please click the link to accept it.\nwww.sadaigiddfcbr...',
        title: 'Remote Key Sharing',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Add any specific logic if needed for the activity type
        } else {
          // Shared successfully
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed by user
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader />
      <VStack style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Box style={styles.descriptionContainer}>
            <Text style={styles.title} medium color={`${colorMode}.headerText`}>
              {isPSBTSharing ? 'Sign Transaction Remotely' : 'Remote Key Sharing'}
            </Text>
            <Text style={styles.description}>
              {isPSBTSharing
                ? 'Please share the PSBT Link with the key holder for transaction signing. Once generated, the link will be valid for 5 minutes.'
                : 'Please share this Key-Link with your contact using a secure and private communication medium. The link will be valid for 5 minutes.'}
            </Text>
          </Box>

          {!isPSBTSharing && <RemoteShareIllustration style={styles.illustration} />}

          <Box style={styles.messagePreview}>
            <MessagePreview
              title="Remote Key Sharing"
              description="Hey, I’m sharing a bitcoin key with you. Please click the link to accept it."
              link="www.sadaigiddfcbr..."
            />
          </Box>
        </ScrollView>
        <Box style={styles.CTAContainer}>
          <Buttons
            primaryText={!isPSBTSharing ? 'Share Key' : 'Share Link'}
            primaryCallback={handleShare}
            paddingHorizontal={wp(120)}
          />
          <Buttons
            secondaryText="Cancel"
            secondaryCallback={() => {
              navigation.goBack();
            }}
            paddingHorizontal={wp(120)}
          />
        </Box>
      </VStack>
    </ScreenWrapper>
  );
}

export default RemoteSharing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  contentContainer: {
    alignItems: 'center',
  },
  descriptionContainer: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },
  CTAContainer: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: hp(10),
  },
  title: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    width: wp(300),
  },
  illustration: {
    marginTop: hp(5),
    marginRight: wp(15),
  },
  messagePreview: {
    width: '100%',
    marginTop: hp(32),
    marginBottom: hp(34),
  },
});
